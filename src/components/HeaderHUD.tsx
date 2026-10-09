import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Keyboard,
  Plus,
  Search,
  Sparkles,
  Compass,
  Minimize2,
  Maximize2,
  Play,
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface HeaderHUDProps {
  onOpenCommand: () => void;
  onOpenShortcuts: () => void;
  onOpenAddApp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeRing: number;
  isWheelCollapsed: boolean;
  onToggleCollapse: () => void;
  onStartDemo?: () => void;
  isDemoPlaying?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onOpenCommand,
  onOpenShortcuts,
  onOpenAddApp,
  soundEnabled,
  onToggleSound,
  activeRing,
  isWheelCollapsed,
  onToggleCollapse,
  onStartDemo,
  isDemoPlaying,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full flex items-center justify-between py-3 px-4 sm:px-8 border-b border-slate-800/80 bg-[#070a12]/90 backdrop-blur-md z-40">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#070a12] rounded-[7px] flex items-center justify-center">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider text-white uppercase font-sans">
              RADIAL
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-400">
              COMMAND HUB
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
            <span>CORE · RING {activeRing}</span>
            <span>·</span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Keystroke Search Trigger Button */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-slate-300">Quick Keystroke Search & AI Intent</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
            SPACE
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Cheatsheet, Audio, Time */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onStartDemo && (
          <button
            onClick={onStartDemo}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isDemoPlaying
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title="Live automated demonstration of Radial"
          >
            <Play className={`w-3.5 h-3.5 ${isDemoPlaying ? 'text-amber-400 fill-amber-400' : 'text-cyan-400 fill-cyan-400'}`} />
            <span className="hidden sm:inline">{isDemoPlaying ? 'Demo Playing...' : 'Live Demo'}</span>
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-colors"
          title="Toggle Deploy / Collapse Radial Hub [\] or [Alt+Space]"
        >
          {isWheelCollapsed ? (
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="hidden sm:inline">
            {isWheelCollapsed ? 'Deploy [ \\ ]' : 'Collapse [ \\ ]'}
          </span>
        </button>

        <button
          onClick={onOpenAddApp}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          title="Add Custom Application"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Add App</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Keyboard Matrix [?]"
        >
          <Keyboard className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          title={soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        <div className="hidden xl:block font-mono text-[11px] text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-900">
          {currentTime || '16:54:00'}
        </div>
      </div>
    </header>
  );
};
