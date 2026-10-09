import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: AI Intent Parser using free-tier Gemini Flash
app.post('/api/ai/intent', async (req, res) => {
  try {
    const { query, apps } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const trimmedQuery = query.trim().toLowerCase();

    // Fast local heuristic fallback in case API key is unavailable or fails
    const localMatch = () => {
      let bestApp = null;
      let highestScore = 0;

      for (const appItem of apps || []) {
        let score = 0;
        const name = (appItem.name || '').toLowerCase();
        const desc = (appItem.description || '').toLowerCase();
        const tags = (appItem.tags || []).map((t: string) => t.toLowerCase());

        if (name === trimmedQuery) score += 100;
        else if (name.includes(trimmedQuery) || trimmedQuery.includes(name)) score += 50;

        for (const tag of tags) {
          if (trimmedQuery.includes(tag)) score += 25;
        }

        for (const word of trimmedQuery.split(/\s+/)) {
          if (word.length > 2) {
            if (desc.includes(word)) score += 10;
            if (name.includes(word)) score += 15;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestApp = appItem;
        }
      }

      return bestApp
        ? {
            bestAppId: bestApp.id,
            confidence: Math.min(0.9, Math.max(0.4, highestScore / 100)),
            reasoning: `Matched "${bestApp.name}" based on keywords and tags.`,
            suggestedActionUrl: bestApp.primaryUrl,
            actionLabel: `Launch ${bestApp.name}`,
          }
        : null;
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const match = localMatch();
      return res.json({
        result: match || {
          bestAppId: apps?.[0]?.id || 'colab',
          confidence: 0.3,
          reasoning: 'Keyword lookup match',
          suggestedActionUrl: apps?.[0]?.primaryUrl || 'https://colab.research.google.com',
          actionLabel: `Open ${apps?.[0]?.name || 'Hub'}`,
        },
        source: 'local-heuristic',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build concise directory of available tools
    const catalog = (apps || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      ring: a.ring,
      description: a.description,
      tags: a.tags,
      quickActions: a.quickActions?.map((qa: any) => ({ label: qa.label, url: qa.url })),
    }));

    const prompt = `You are the intent interpreter for Radial, a concentric command launcher.
A user gave this natural language command or request: "${query}".

Analyze the request and match it to the single best application from this catalog:
${JSON.stringify(catalog, null, 2)}

Respond with STRICT JSON only, in this exact format:
{
  "bestAppId": "id_from_catalog",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief 1-sentence reason why this app fits",
  "suggestedActionUrl": "direct url to perform the action or primary url",
  "actionLabel": "concise verb phrase like 'Create Notebook', 'Play Lo-Fi', 'Join Meeting'"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    return res.json({
      result: parsedResult,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.warn('AI Intent error, falling back to local heuristic:', error?.message);
    return res.json({
      result: {
        bestAppId: 'colab',
        confidence: 0.4,
        reasoning: 'Fallback launcher route',
        suggestedActionUrl: 'https://colab.research.google.com',
        actionLabel: 'Launch Colab',
      },
      source: 'fallback',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Radial server running at http://localhost:${PORT}`);
  });
}

startServer();
