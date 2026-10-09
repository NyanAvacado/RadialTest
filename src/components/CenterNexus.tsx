import React from 'react';
import { AppItem, RingDefinition } from '../types';
import { AppIcon } from './AppIcon';
import { ExternalLink, Zap, Monitor, Globe, Compass, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface CenterNexusProps {
  selectedApp: AppItem | null;
  onLaunch: (url: string, isDesktop?: boolean) => void;
  ringDefinition?: RingDefinition;
  preferDesktopProtocol: boolean;
  onToggleProtocol: () => void;
}

export const CenterNexus: React.FC<CenterNexusProps> = ({
  selectedApp,
  onLaunch,
  ringDefinition,
  preferDesktopProtocol,
  onToggleProtocol,
}) => {
  if (!selectedApp) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[180px] h-[180px] rounded-full flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-auto">
          <Compass className="w-8 h-8 text-cyan-400 mb-2 animate-pulse" />
          <div className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Radial Nexus
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono leading-tight">
            Press hotkey or click any sector
          </div>
          <div className="text-[9px] text-cyan-400/80 mt-2 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            [TAB] to switch rings
          </div>
        </div>
      </div>
    );
  }

  const hasDesktopOption = Boolean(selectedApp.desktopProtocol);
  const targetUrl =
    preferDesktopProtocol && selectedApp.desktopProtocol
      ? selectedApp.desktopProtocol
      : selectedApp.primaryUrl;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div
        className="w-[184px] h-[184px] rounded-full flex flex-col items-center justify-center p-3 text-center pointer-events-auto shadow-2xl relative backdrop-blur-md border transition-all duration-300"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #111726 0%, #090c15 100%)',
          borderColor: `${selectedApp.color}60`,
          boxShadow: `0 0 25px ${selectedApp.color}25`,
        }}
      >
        {/* Ring indicator marker */}
        <div className="absolute top-2 flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase text-slate-400">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ringDefinition?.color || selectedApp.color }}
          />
          R{selectedApp.ring} · {selectedApp.category.split('-')[0]}
        </div>

        {/* Center App Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-transform hover:scale-105 border mt-2"
          style={{
            backgroundColor: `${selectedApp.color}15`,
            borderColor: `${selectedApp.color}40`,
          }}
        >
          <AppIcon name={selectedApp.icon} className="w-5 h-5" color={selectedApp.color} />
        </div>

        {/* App Title */}
        <div className="text-xs font-bold text-white tracking-tight truncate max-w-[150px]">
          {selectedApp.name}
        </div>

        {/* Hotkey Indicator */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
            Key: {selectedApp.hotkey}
          </span>
          {hasDesktopOption && (
            <button
              onClick={onToggleProtocol}
              title={
                preferDesktopProtocol
                  ? 'Desktop protocol mode (Click to switch to Web)'
                  : 'Web browser mode (Click to switch to Desktop app)'
              }
              className="text-[9px] font-mono flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {preferDesktopProtocol ? (
                <>
                  <Monitor className="w-2.5 h-2.5 text-cyan-400" /> App
                </>
              ) : (
                <>
                  <Globe className="w-2.5 h-2.5 text-emerald-400" /> Web
                </>
              )}
            </button>
          )}
        </div>

        {/* Direct Launch Button */}
        <button
          onClick={() => {
            soundFx.launch();
            onLaunch(targetUrl, preferDesktopProtocol && Boolean(selectedApp.desktopProtocol));
          }}
          className="mt-2 w-[130px] flex items-center justify-center gap-1 py-1 px-2.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-slate-950 transition-all hover:brightness-110 active:scale-95 shadow-md"
          style={{
            backgroundColor: selectedApp.color,
          }}
        >
          <span>Launch [↵]</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
