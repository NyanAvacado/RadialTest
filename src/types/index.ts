export type RingLevel = 1 | 2 | 3;

export interface QuickAction {
  id: string;
  label: string;
  url: string;
  hotkey?: string;
  description?: string;
}

export interface AppItem {
  id: string;
  name: string;
  ring: RingLevel; // 1 = Inner Google Core/Research, 2 = Middle Comm/Media, 3 = Outer Dev/Engineering
  category: 'google-core' | 'communication' | 'engineering' | 'custom';
  description: string;
  hotkey: string; // Single key e.g. 'N', 'C', 'D'
  primaryUrl: string;
  desktopProtocol?: string;
  color: string; // Vibrant accent color (cyan, orange, emerald, purple, etc.)
  secondaryColor?: string;
  icon: string; // Lucide icon name or specialized key
  tags: string[];
  quickActions: QuickAction[];
  launchCount?: number;
  lastLaunched?: number;
  isCustom?: boolean;
}

export interface AIIntentResult {
  bestAppId: string;
  confidence: number;
  reasoning: string;
  suggestedActionUrl: string;
  actionLabel: string;
}

export interface RingDefinition {
  level: RingLevel;
  name: string;
  label: string;
  radius: number; // in px
  color: string;
  description: string;
}
