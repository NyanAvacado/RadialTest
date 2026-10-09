import React, { useState, useEffect } from 'react';
import { AppItem } from '../types';
import { Keyboard, X, ArrowRightLeft, Check, AlertTriangle, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface KeybindModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem | null;
  allApps: AppItem[];
  onSaveKeybind: (appId: string, newKey: string, swapAppId?: string) => void;
  onResetDefaults?: () => void;
}

export const KeybindModal: React.FC<KeybindModalProps> = ({
  isOpen,
  onClose,
  app,
  allApps,
  onSaveKeybind,
  onResetDefaults,
}) => {
  const [recordedKey, setRecordedKey] = useState<string>('');
  const [conflictApp, setConflictApp] = useState<AppItem | null>(null);

  useEffect(() => {
    if (isOpen && app) {
      setRecordedKey(app.hotkey);
      setConflictApp(null);
    }
  }, [isOpen, app]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys alone
      if (['Control', 'Alt', 'Shift', 'Meta', 'Tab'].includes(e.key)) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const keyChar = e.key.toUpperCase();
      // Allow letters, numbers, and basic symbols
      if (keyChar.length === 1) {
        soundFx.tick(1200);
        setRecordedKey(keyChar);

        // Check for conflicts
        if (app) {
          const conflicting = allApps.find(
            (a) => a.id !== app.id && a.hotkey.toUpperCase() === keyChar
          );
          setConflictApp(conflicting || null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, app, allApps, onClose]);

  if (!isOpen || !app) return null;

  const handleApply = () => {
    if (!recordedKey) return;
    soundFx.selectLock();
    onSaveKeybind(app.id, recordedKey);
    onClose();
  };

  const handleSwap = () => {
    if (!recordedKey || !conflictApp) return;
    soundFx.selectLock();
    onSaveKeybind(app.id, recordedKey, conflictApp.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0b0f1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Rebind Quick Keystroke</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="text-xs font-mono text-slate-400 mb-1">
            Reassigning hotkey for:
          </div>
          <div className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <span style={{ color: app.color }}>{app.name}</span>
            <span className="text-xs font-mono text-slate-500">
              (Current: [{app.hotkey}])
            </span>
          </div>

          {/* Key Recorder Display Box */}
          <div className="w-32 h-32 rounded-2xl bg-[#070912] border-2 border-dashed border-cyan-500/60 flex flex-col items-center justify-center p-4 shadow-inner relative group mb-4">
            <span className="text-4xl font-mono font-extrabold text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              {recordedKey || '_'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-2">
              Press any single key
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-xs font-mono mb-4">
            Type any letter (A-Z) or number (0-9) on your keyboard.
          </p>

          {/* Conflict Warning & Resolution */}
          {conflictApp && (
            <div className="w-full p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left mb-4 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-amber-300 font-bold font-mono">
                  KEY CONFLICT: [{recordedKey}]
                </span>
                <p className="text-slate-300 mt-0.5">
                  Already bound to <strong className="text-white">{conflictApp.name}</strong>.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={handleSwap}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono font-bold text-[11px] transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap Keys ([{recordedKey}] ↔ [{app.hotkey}])</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800">
            {onResetDefaults ? (
              <button
                type="button"
                onClick={() => {
                  onResetDefaults();
                  onClose();
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Defaults</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!recordedKey || Boolean(conflictApp)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Keybind</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
