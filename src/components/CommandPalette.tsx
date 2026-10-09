import React, { useState, useEffect, useRef } from 'react';
import { AppItem, AIIntentResult } from '../types';
import { Search, Sparkles, CornerDownLeft, X, ArrowUpRight, Loader2, Zap } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { soundFx } from '../utils/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  onSelectApp: (app: AppItem) => void;
  onLaunchUrl: (url: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  apps,
  onSelectApp,
  onLaunchUrl,
}) => {
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIIntentResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setAiResult(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter apps matching query
  const filteredApps = React.useMemo(() => {
    if (!query.trim()) return apps.slice(0, 8);
    const q = query.toLowerCase().trim();
    return apps
      .filter((app) => {
        return (
          app.name.toLowerCase().includes(q) ||
          app.hotkey.toLowerCase() === q ||
          app.description.toLowerCase().includes(q) ||
          app.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [apps, query]);

  // Run AI Intent parsing with free-tier Gemini Flash model via /api/ai/intent
  const handleRunAiIntent = async () => {
    if (!query.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAiResult(null);
    soundFx.tick(800);

    try {
      const res = await fetch('/api/ai/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, apps }),
      });

      if (!res.ok) throw new Error('AI intent service returned non-200');

      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
        const targetApp = apps.find((a) => a.id === data.result.bestAppId);
        if (targetApp) {
          onSelectApp(targetApp);
          soundFx.selectLock();
        }
      }
    } catch (err) {
      console.error('AI Intent failed', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundFx.tick(1100);
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredApps.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundFx.tick(1100);
      setSelectedIndex((prev) => (prev - 1 + filteredApps.length) % Math.max(1, filteredApps.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || query.includes(' ') || query.length > 12) {
        // Natural language command -> trigger AI Intent
        handleRunAiIntent();
      } else if (filteredApps[selectedIndex]) {
        const app = filteredApps[selectedIndex];
        onSelectApp(app);
        onLaunchUrl(app.primaryUrl);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#0c101b] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800/80 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type app name, hotkey (e.g. C, N, V), or natural AI command..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />

          {query.trim() && (
            <button
              onClick={handleRunAiIntent}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono transition-colors shrink-0"
              title="Parse with free-tier Gemini Flash"
            >
              {isAiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>Gemini Flash</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Intent Result Banner if active */}
        {aiResult && (
          <div className="px-4 py-3 bg-gradient-to-r from-purple-950/40 to-cyan-950/30 border-b border-purple-500/30 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-300">
                  GEMINI FLASH INTENT
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(aiResult.confidence * 100)}% match
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">{aiResult.reasoning}</p>
              {aiResult.suggestedActionUrl && (
                <button
                  onClick={() => {
                    onLaunchUrl(aiResult.suggestedActionUrl);
                    onClose();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                  <span>{aiResult.actionLabel || 'Execute Action'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* App List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/40 p-2">
          {filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No matching apps found. Press Gemini Flash to synthesize intent.
            </div>
          ) : (
            filteredApps.map((app, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    onSelectApp(app);
                    soundFx.selectLock();
                  }}
                  onDoubleClick={() => {
                    onSelectApp(app);
                    onLaunchUrl(app.primaryUrl);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800/80 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${app.color}15`,
                        borderColor: `${app.color}40`,
                      }}
                    >
                      <AppIcon name={app.icon} className="w-4 h-4" color={app.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100 truncate">
                          {app.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          Ring {app.ring}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[380px]">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApp(app);
                        onLaunchUrl(app.primaryUrl);
                        onClose();
                      }}
                      className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Open</span>
                      <CornerDownLeft className="w-3 h-3 text-cyan-400" />
                    </button>
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#070a12] border border-cyan-500/40 text-cyan-400">
                      [{app.hotkey}]
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-[#080b13] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">↵</kbd> to launch
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">ESC</kbd> to exit
            </span>
          </div>
          <span className="text-cyan-400/80">AI Model: Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
