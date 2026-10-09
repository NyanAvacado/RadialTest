import React from 'react';
import { AppItem } from '../types';
import { AppIcon } from './AppIcon';
import { Maximize2, Zap, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface CollapsedHubProps {
  onExpand: () => void;
  selectedApp: AppItem | null;
  onLaunchApp: (app: AppItem) => void;
  apps: AppItem[];
  onSelectApp: (app: AppItem) => void;
}

export const CollapsedHub: React.FC<CollapsedHubProps> = ({
  onExpand,
  selectedApp,
  onLaunchApp,
  apps,
  onSelectApp,
}) => {
  // Take top 6 quick apps
  const quickApps = apps.slice(0, 6);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 my-12 animate-fade-in select-none">
      {/* Outer ambient glow */}
      <div className="relative group">
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-30 transition-all duration-700 animate-pulse"
          style={{ backgroundColor: selectedApp?.color || '#06b6d4' }}
        />

        {/* Concentric pulse rings around collapsed orb */}
        <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-ping opacity-25 pointer-events-none" />
        <div className="absolute -inset-8 rounded-full border border-slate-700/30 pointer-events-none" />

        {/* Central Obsidian Dock Orb */}
        <div
          onClick={onExpand}
          className="relative w-44 h-44 rounded-full bg-[#0a0d18] border-2 flex flex-col items-center justify-center p-4 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-105 group"
          style={{
            borderColor: selectedApp ? `${selectedApp.color}70` : '#38bdf8',
            boxShadow: `0 0 40px ${selectedApp?.color || '#38bdf8'}25`,
          }}
        >
          {selectedApp ? (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 border transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${selectedApp.color}20`,
                  borderColor: `${selectedApp.color}60`,
                }}
              >
                <AppIcon name={selectedApp.icon} className="w-6 h-6" color={selectedApp.color} />
              </div>

              <div className="text-xs font-bold text-white tracking-tight truncate max-w-[130px]">
                {selectedApp.name}
              </div>

              <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                [{selectedApp.hotkey}] · Ring {selectedApp.ring}
              </div>

              <div className="mt-2 text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 group-hover:text-white transition-colors">
                <Maximize2 className="w-3 h-3 text-cyan-400" />
                <span>Deploy Hub [\]</span>
              </div>
            </>
          ) : (
            <>
              <Compass className="w-10 h-10 text-cyan-400 mb-2 animate-spin-slow" />
              <div className="text-xs font-bold text-white">Radial Dock</div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">Press [ \ ]</div>
            </>
          )}
        </div>
      </div>

      {/* Keystroke Prompt */}
      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-bold">
            \
          </kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-bold">
            Alt+Space
          </kbd>
          <span className="text-slate-400">to Open / Expand Concentric Rings</span>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Hub is currently collapsed in background dock mode. Hotkeys still work instantly!
        </p>
      </div>

      {/* Quick Launch Dock Strip */}
      <div className="mt-6 flex items-center gap-2 p-2 rounded-2xl bg-[#090d18]/90 border border-slate-800 backdrop-blur-md">
        {quickApps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              onSelectApp(app);
              soundFx.tick(1200);
            }}
            onDoubleClick={() => onLaunchApp(app)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700 group"
          >
            <AppIcon name={app.icon} className="w-4 h-4" color={app.color} />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">
              {app.name}
            </span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
              {app.hotkey}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
};
