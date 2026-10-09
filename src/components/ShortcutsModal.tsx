import React from 'react';
import { AppItem } from '../types';
import { X, Keyboard, Sparkles, Compass } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  onOpenRebind?: (app: AppItem) => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  apps,
  onOpenRebind,
}) => {
  if (!isOpen) return null;

  const ring1Apps = apps.filter((a) => a.ring === 1);
  const ring2Apps = apps.filter((a) => a.ring === 2);
  const ring3Apps = apps.filter((a) => a.ring === 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0c101c] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-white tracking-tight">
              Radial Keystroke Matrix
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Navigation keys */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Concentric Navigation & Reticle</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">\ or Alt+Space</span>
                <span className="text-cyan-400 font-semibold">Open / Collapse Concentric Rings</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Space or /</span>
                <span className="text-slate-400">Command Palette & AI Intent</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Tab</span>
                <span className="text-slate-400">Cycle concentric rings (1 → 2 → 3)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">1, 2, 3</span>
                <span className="text-slate-400">Jump directly to Ring 1, 2, or 3</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">← / → Arrow Keys</span>
                <span className="text-slate-400">Step clockwise / counter-clockwise</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">↑ / ↓ Arrow Keys</span>
                <span className="text-slate-400">Traverse inward / outward rings</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">[ or ]</span>
                <span className="text-slate-400">Rotate radial wheel 30°</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Enter [↵]</span>
                <span className="text-slate-400">Launch active focused application</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>💡 Tip: Click any key badge below to rebind that application's hotkey!</span>
          </div>

          {/* Ring 1 direct shortcuts */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Ring 1: Inner Google Core & Neural
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ring1Apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onOpenRebind?.(app)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs cursor-pointer transition-colors group"
                >
                  <span className="text-slate-200 truncate pr-1 group-hover:text-white">{app.name}</span>
                  <kbd className="font-mono font-bold text-cyan-300 bg-cyan-950/80 group-hover:bg-cyan-900 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    {app.hotkey}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Ring 2 direct shortcuts */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
              Ring 2: Mid Comms, Audio & Media
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ring2Apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onOpenRebind?.(app)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-xs cursor-pointer transition-colors group"
                >
                  <span className="text-slate-200 truncate pr-1 group-hover:text-white">{app.name}</span>
                  <kbd className="font-mono font-bold text-purple-300 bg-purple-950/80 group-hover:bg-purple-900 px-1.5 py-0.5 rounded border border-purple-800/60">
                    {app.hotkey}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Ring 3 direct shortcuts */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
              Ring 3: Outer Dev, Cloud & Systems
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ring3Apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onOpenRebind?.(app)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-xs cursor-pointer transition-colors group"
                >
                  <span className="text-slate-200 truncate pr-1 group-hover:text-white">{app.name}</span>
                  <kbd className="font-mono font-bold text-amber-300 bg-amber-950/80 group-hover:bg-amber-900 px-1.5 py-0.5 rounded border border-amber-800/60">
                    {app.hotkey}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#080b13] border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs transition-colors"
          >
            Got It (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
