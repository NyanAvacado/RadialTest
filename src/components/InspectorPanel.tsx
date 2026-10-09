import React from 'react';
import { AppItem, RingDefinition } from '../types';
import { AppIcon } from './AppIcon';
import { ExternalLink, Zap, Monitor, Globe, Tag, Sparkles, Hash } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface InspectorPanelProps {
  selectedApp: AppItem | null;
  onLaunchUrl: (url: string, isDesktop?: boolean) => void;
  preferDesktopProtocol: boolean;
  onToggleProtocol: () => void;
  activeRing: number;
  onSelectRing: (ring: number) => void;
  ringDefinitions: RingDefinition[];
  onOpenRebind: (app: AppItem) => void;
  isWheelCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedApp,
  onLaunchUrl,
  preferDesktopProtocol,
  onToggleProtocol,
  activeRing,
  onSelectRing,
  ringDefinitions,
  onOpenRebind,
  isWheelCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 text-slate-200">
      {/* Hub State & Concentric Ring Selector */}
      <div className="bg-[#0b0e18]/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${isWheelCollapsed ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span>Hub: {isWheelCollapsed ? 'Collapsed' : 'Open'}</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 transition-colors flex items-center gap-1"
            title="Toggle Open / Collapse radial hub [\]"
          >
            <span>{isWheelCollapsed ? 'Deploy [ \\ ]' : 'Collapse [ \\ ]'}</span>
          </button>
        </div>

        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
          <span>Concentric Rings</span>
          <span className="text-cyan-400">Keys 1 · 2 · 3</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {ringDefinitions.map((ringDef) => {
            const isActive = ringDef.level === activeRing;
            return (
              <button
                key={ringDef.level}
                onClick={() => {
                  soundFx.ringShift(ringDef.level);
                  onSelectRing(ringDef.level);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all text-center flex flex-col items-center justify-center border ${
                  isActive
                    ? 'bg-slate-800 border-cyan-500/50 text-white shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="text-[10px] font-bold" style={{ color: ringDef.color }}>
                  RING {ringDef.level}
                </span>
                <span className="text-[9px] truncate max-w-full text-slate-400">
                  {ringDef.level === 1 ? 'Google' : ringDef.level === 2 ? 'Media' : 'Dev'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected App Detail Card */}
      {selectedApp ? (
        <div
          className="bg-[#0b0e18]/90 border rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4 transition-all"
          style={{
            borderColor: `${selectedApp.color}40`,
            boxShadow: `0 8px 32px ${selectedApp.color}15`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: `${selectedApp.color}18`,
                  borderColor: `${selectedApp.color}50`,
                }}
              >
                <AppIcon name={selectedApp.icon} className="w-6 h-6" color={selectedApp.color} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  <span>{selectedApp.name}</span>
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  Ring {selectedApp.ring} · {selectedApp.category.replace('-', ' ')}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                onClick={() => onOpenRebind(selectedApp)}
                title="Click to rebind quick keystroke"
                className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 shadow-sm flex items-center gap-1 transition-all group"
              >
                <span>[{selectedApp.hotkey}]</span>
                <span className="text-[9px] text-cyan-400/80 group-hover:text-cyan-200">✎</span>
              </button>
              <button
                onClick={() => onOpenRebind(selectedApp)}
                className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 underline mt-1 transition-colors"
              >
                Change Key
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">{selectedApp.description}</p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                soundFx.launch();
                const target =
                  preferDesktopProtocol && selectedApp.desktopProtocol
                    ? selectedApp.desktopProtocol
                    : selectedApp.primaryUrl;
                onLaunchUrl(target, preferDesktopProtocol && Boolean(selectedApp.desktopProtocol));
              }}
              className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{
                backgroundColor: selectedApp.color,
              }}
            >
              <span>Launch {selectedApp.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenRebind(selectedApp)}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Rebind Key [{selectedApp.hotkey}]</span>
            </button>

            {selectedApp.desktopProtocol && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  Desktop URI Protocol
                </span>
                <button
                  onClick={onToggleProtocol}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    preferDesktopProtocol
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preferDesktopProtocol ? 'Active' : 'Enable'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions / Deep Links */}
          {selectedApp.quickActions && selectedApp.quickActions.length > 0 && (
            <div className="border-t border-slate-800/80 pt-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Instant Deep Links</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {selectedApp.quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      soundFx.launch();
                      onLaunchUrl(action.url);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 text-left transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {action.label}
                      </div>
                      {action.description && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {action.description}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keywords / Tags */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
            {selectedApp.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#0b0e18]/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
          <div className="text-xs font-mono text-slate-300">No App Focused</div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use hotkeys, click any node on the radial wheel, or hit <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> to search.
          </p>
        </div>
      )}
    </aside>
  );
};
