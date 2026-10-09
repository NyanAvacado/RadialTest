/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppItem, RingLevel } from './types';
import { INITIAL_APPS, RING_DEFINITIONS } from './data/defaultApps';
import { RadialWheel } from './components/RadialWheel';
import { CenterNexus } from './components/CenterNexus';
import { CollapsedHub } from './components/CollapsedHub';
import { HeaderHUD } from './components/HeaderHUD';
import { InspectorPanel } from './components/InspectorPanel';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AddAppModal } from './components/AddAppModal';
import { KeybindModal } from './components/KeybindModal';
import { soundFx } from './utils/sound';
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Terminal,
} from 'lucide-react';

const STORAGE_KEY_APPS = 'obsidian_apps_v1';
const STORAGE_KEY_COLLAPSED = 'obsidian_wheel_collapsed_v1';

export default function App() {
  // Load custom/saved apps from localStorage or fallback to INITIAL_APPS
  const [apps, setApps] = useState<AppItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved apps', e);
    }
    return INITIAL_APPS;
  });

  // State
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(() => apps[0] || null);
  const [activeRing, setActiveRing] = useState<RingLevel>(1);
  const [rotationOffset, setRotationOffset] = useState<number>(0);
  const [preferDesktopProtocol, setPreferDesktopProtocol] = useState<boolean>(false);
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  // Wheel Open/Collapse State
  const [isWheelCollapsed, setIsWheelCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COLLAPSED) === 'true';
    } catch {
      return false;
    }
  });

  // Modals & Rebind
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [appToRebind, setAppToRebind] = useState<AppItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Save apps on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [apps]);

  // Save collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(isWheelCollapsed));
    } catch (e) {
      console.warn('Storage save collapsed failed', e);
    }
  }, [isWheelCollapsed]);

  // Audio mute sync
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundFx.enabled = next;
      if (next) soundFx.tick(880);
      return next;
    });
  };

  // Toggle Collapse / Expand
  const toggleWheelCollapse = useCallback(() => {
    setIsWheelCollapsed((prev) => {
      const next = !prev;
      if (next) {
        soundFx.tick(600);
        showToast('Radial Hub Collapsed · Press [ \\ ] to Deploy');
      } else {
        soundFx.ringShift(activeRing);
        showToast('Radial Hub Deployed · Concentric Rings Active');
      }
      return next;
    });
  }, [activeRing, showToast]);

  // Launch application handler
  const handleLaunchApp = useCallback(
    (appToLaunch: AppItem, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      soundFx.launch();

      const target =
        preferDesktopProtocol && appToLaunch.desktopProtocol
          ? appToLaunch.desktopProtocol
          : appToLaunch.primaryUrl;

      // Update launch count
      setApps((prev) =>
        prev.map((item) =>
          item.id === appToLaunch.id
            ? {
                ...item,
                launchCount: (item.launchCount || 0) + 1,
                lastLaunched: Date.now(),
              }
            : item
        )
      );

      showToast(`Launching ${appToLaunch.name}...`);

      if (target.startsWith('http://') || target.startsWith('https://')) {
        window.open(target, '_blank', 'noopener,noreferrer');
      } else {
        // Desktop protocol URI (e.g. vscode://, spotify://)
        window.location.href = target;
      }
    },
    [preferDesktopProtocol, showToast]
  );

  const handleLaunchUrl = useCallback(
    (url: string, isDesktop = false) => {
      soundFx.launch();
      showToast(`Opening destination...`);
      if (isDesktop || !url.startsWith('http')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    [showToast]
  );

  // Select an app and rotate wheel so that app rotates toward top
  const handleSelectApp = useCallback(
    (app: AppItem, shouldRotate = true) => {
      setSelectedApp(app);
      setActiveRing(app.ring);

      if (shouldRotate) {
        // Compute target angle so app lands near the top reticle
        const ringApps = apps.filter((a) => a.ring === app.ring);
        const index = ringApps.findIndex((a) => a.id === app.id);
        if (index !== -1 && ringApps.length > 0) {
          const step = 360 / ringApps.length;
          const targetAngle = -index * step;
          setRotationOffset(targetAngle);
        }
      }
    },
    [apps]
  );

  // Add custom app
  const handleAddApp = (newApp: AppItem) => {
    setApps((prev) => [...prev, newApp]);
    handleSelectApp(newApp);
    showToast(`Added ${newApp.name} to Ring ${newApp.ring}`);
  };

  // Rebind hotkey handler
  const handleSaveKeybind = useCallback(
    (appId: string, newKey: string, swapAppId?: string) => {
      const upperNewKey = newKey.toUpperCase();
      let targetName = '';
      let swappedName = '';

      setApps((prevApps) => {
        const currentTarget = prevApps.find((x) => x.id === appId);
        targetName = currentTarget?.name || 'App';
        const currentTargetOldKey = currentTarget?.hotkey || '';

        return prevApps.map((a) => {
          if (a.id === appId) {
            return { ...a, hotkey: upperNewKey };
          }
          if (swapAppId && a.id === swapAppId) {
            swappedName = a.name;
            return { ...a, hotkey: currentTargetOldKey };
          }
          return a;
        });
      });

      if (swapAppId) {
        showToast(`Swapped binds: ${targetName} [${upperNewKey}] ↔ ${swappedName}`);
      } else {
        showToast(`Bound ${targetName} to [${upperNewKey}]`);
      }
    },
    [showToast]
  );

  // Reset to defaults
  const handleResetDefaults = useCallback(() => {
    setApps(INITIAL_APPS);
    localStorage.removeItem(STORAGE_KEY_APPS);
    soundFx.selectLock();
    showToast('Reset all keybindings to defaults');
  }, [showToast]);

  // Reset rotation
  const handleResetWheel = () => {
    soundFx.tick(1000);
    setRotationOffset(0);
  };

  // Automated live demonstration walkthrough
  const handleStartDemo = useCallback(() => {
    if (isDemoPlaying) {
      setIsDemoPlaying(false);
      showToast('Live Demo stopped');
      return;
    }

    setIsDemoPlaying(true);
    setIsWheelCollapsed(false);
    showToast('Starting Radial Live Tour...');

    const colab = apps.find((a) => a.id === 'colab');
    const notebooklm = apps.find((a) => a.id === 'notebooklm');
    const spotify = apps.find((a) => a.id === 'spotify');
    const vscode = apps.find((a) => a.id === 'vscode');

    // Step 1: Lock onto Google Colab [C]
    setTimeout(() => {
      if (colab) {
        soundFx.selectLock();
        handleSelectApp(colab);
        showToast('Step 1: Press [C] → Google Colab (Neural Compute)');
      }
    }, 800);

    // Step 2: Rotate to NotebookLM [N]
    setTimeout(() => {
      if (notebooklm) {
        soundFx.selectLock();
        handleSelectApp(notebooklm);
        showToast('Step 2: Press [N] → NotebookLM (AI Research)');
      }
    }, 2800);

    // Step 3: Jump to Mid Ring Spotify [S]
    setTimeout(() => {
      if (spotify) {
        soundFx.ringShift(2);
        handleSelectApp(spotify);
        showToast('Step 3: Press [S] → Spotify (Deep Focus Audio)');
      }
    }, 4800);

    // Step 4: Jump to Outer Ring VS Code [V]
    setTimeout(() => {
      if (vscode) {
        soundFx.ringShift(3);
        handleSelectApp(vscode);
        showToast('Step 4: Press [V] → VS Code (Desktop IDE)');
      }
    }, 6800);

    // Step 5: Collapse wheel to minimal dock via [\]
    setTimeout(() => {
      soundFx.tick(600);
      setIsWheelCollapsed(true);
      showToast('Step 5: Press [ \\ ] → Collapsed Minimal Dock');
    }, 8800);

    // Step 6: Deploy back into full concentric circles
    setTimeout(() => {
      soundFx.ringShift(1);
      setIsWheelCollapsed(false);
      if (colab) handleSelectApp(colab);
      showToast('Step 6: Radial Deployed · Instant Spatial Flow!');
      setIsDemoPlaying(false);
    }, 11200);
  }, [apps, isDemoPlaying, handleSelectApp, showToast]);

  // Concentric ring definitions
  const activeRingDef = useMemo(() => {
    return RING_DEFINITIONS.find((r) => r.level === activeRing);
  }, [activeRing]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Modals open checks
      if (isCommandOpen || isShortcutsOpen || isAddAppOpen || Boolean(appToRebind)) {
        return;
      }

      // 1. Toggle Open / Collapse: Backslash (\), Backtick (`), or Alt + Space
      if (
        e.key === '\\' ||
        e.key === '`' ||
        (e.altKey && (e.code === 'Space' || e.key === ' '))
      ) {
        e.preventDefault();
        toggleWheelCollapse();
        return;
      }

      // 2. Escape: Collapse wheel if currently open
      if (e.key === 'Escape' && !isWheelCollapsed) {
        e.preventDefault();
        setIsWheelCollapsed(true);
        soundFx.tick(600);
        showToast('Concentric Rings Collapsed');
        return;
      }

      // 3. Space or / -> Open Command Palette
      if (e.key === ' ' || e.key === '/') {
        e.preventDefault();
        soundFx.tick(900);
        setIsCommandOpen(true);
        return;
      }

      // 4. ? -> Open Shortcuts Cheatsheet
      if (e.key === '?') {
        e.preventDefault();
        soundFx.tick(800);
        setIsShortcutsOpen(true);
        return;
      }

      // 5. Tab -> Cycle concentric rings (1 -> 2 -> 3 -> 1)
      if (e.key === 'Tab') {
        e.preventDefault();
        // If collapsed, deploying makes it visible
        if (isWheelCollapsed) {
          setIsWheelCollapsed(false);
        }
        setActiveRing((prev) => {
          const next = (prev === 3 ? 1 : prev + 1) as RingLevel;
          soundFx.ringShift(next);
          // Auto select first app in that ring
          const ringApps = apps.filter((a) => a.ring === next);
          if (ringApps.length > 0) {
            handleSelectApp(ringApps[0]);
          }
          return next;
        });
        return;
      }

      // 6. Ring numbers (1, 2, 3)
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        if (isWheelCollapsed) {
          setIsWheelCollapsed(false);
        }
        const level = Number(e.key) as RingLevel;
        setActiveRing(level);
        soundFx.ringShift(level);
        const ringApps = apps.filter((a) => a.ring === level);
        if (ringApps.length > 0) {
          handleSelectApp(ringApps[0]);
        }
        return;
      }

      // 7. Enter -> Launch selected app
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedApp) {
          handleLaunchApp(selectedApp);
        }
        return;
      }

      // 8. ArrowLeft / ArrowRight -> Traverse ring nodes
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isWheelCollapsed) {
          setIsWheelCollapsed(false);
        }
        const ringApps = apps.filter((a) => a.ring === activeRing);
        if (ringApps.length === 0) return;

        const currentIndex = selectedApp
          ? ringApps.findIndex((a) => a.id === selectedApp.id)
          : 0;

        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const nextIndex =
          (currentIndex + delta + ringApps.length) % ringApps.length;
        const nextApp = ringApps[nextIndex];

        soundFx.tick(1200);
        handleSelectApp(nextApp);
        return;
      }

      // 9. ArrowUp / ArrowDown -> Traverse rings inward / outward
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (isWheelCollapsed) {
          setIsWheelCollapsed(false);
        }
        const delta = e.key === 'ArrowUp' ? -1 : 1; // Up goes inward to Ring 1
        const nextLevel = Math.max(1, Math.min(3, activeRing + delta)) as RingLevel;

        if (nextLevel !== activeRing) {
          setActiveRing(nextLevel);
          soundFx.ringShift(nextLevel);
          const ringApps = apps.filter((a) => a.ring === nextLevel);
          if (ringApps.length > 0) {
            handleSelectApp(ringApps[0]);
          }
        }
        return;
      }

      // 10. [ or ] -> Manual wheel rotation
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const delta = e.key === ']' ? 30 : -30;
        soundFx.tick(700);
        setRotationOffset((prev) => prev + delta);
        return;
      }

      // 11. Check direct app hotkeys (e.g. C for Colab, N for NotebookLM, D for Drive, V for VSCode, S for Spotify)
      const upperKey = e.key.toUpperCase();
      const matchedApp = apps.find(
        (a) => a.hotkey.toUpperCase() === upperKey
      );

      if (matchedApp) {
        e.preventDefault();
        soundFx.selectLock();
        handleSelectApp(matchedApp);

        // If Shift was held, launch instantly!
        if (e.shiftKey) {
          handleLaunchApp(matchedApp);
        } else {
          showToast(`Focused ${matchedApp.name} [${matchedApp.hotkey}]`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandOpen,
    isShortcutsOpen,
    isAddAppOpen,
    appToRebind,
    isWheelCollapsed,
    toggleWheelCollapse,
    activeRing,
    selectedApp,
    apps,
    handleLaunchApp,
    handleSelectApp,
    showToast,
  ]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
      {/* Background cybernetic grid & radial illumination */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top HUD Navigation */}
      <HeaderHUD
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAddApp={() => setIsAddAppOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        activeRing={activeRing}
        isWheelCollapsed={isWheelCollapsed}
        onToggleCollapse={toggleWheelCollapse}
        onStartDemo={handleStartDemo}
        isDemoPlaying={isDemoPlaying}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce-subtle">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 relative z-10">
        {/* Left / Center: Concentric Radial Wheel or Collapsed View */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[580px]">
          {isWheelCollapsed ? (
            /* Collapsed Dock Hub */
            <CollapsedHub
              onExpand={() => setIsWheelCollapsed(false)}
              selectedApp={selectedApp}
              onLaunchApp={handleLaunchApp}
              apps={apps}
              onSelectApp={(app) => handleSelectApp(app, true)}
            />
          ) : (
            /* Expanded Concentric Radial Wheel */
            <>
              {/* Wheel HUD Controls */}
              <div className="w-full max-w-[820px] flex items-center justify-between mb-2 px-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider">
                    {activeRingDef?.label}
                  </span>
                  <span>·</span>
                  <span className="text-[11px] text-slate-400">
                    {apps.filter((a) => a.ring === activeRing).length} nodes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleWheelCollapse}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-[10px] text-cyan-300 transition-colors"
                    title="Collapse radial wheel [\]"
                  >
                    <Minimize2 className="w-3 h-3 text-cyan-400" />
                    <span>Collapse [ \ ]</span>
                  </button>

                  <button
                    onClick={handleResetWheel}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors"
                    title="Reset wheel rotation to 0°"
                  >
                    <RotateCcw className="w-3 h-3 text-cyan-400" />
                    <span>0°</span>
                  </button>

                  <button
                    onClick={() => setIsShortcutsOpen(true)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-amber-400" />
                    <span>Keys [?]</span>
                  </button>
                </div>
              </div>

              {/* Radial Wheel with Embedded Center Nexus */}
              <div className="relative w-full flex items-center justify-center">
                <RadialWheel
                  apps={apps}
                  selectedApp={selectedApp}
                  onSelectApp={(app) => handleSelectApp(app, false)}
                  onLaunchApp={handleLaunchApp}
                  activeRing={activeRing}
                  rotationOffset={rotationOffset}
                  ringDefinitions={RING_DEFINITIONS}
                  hoveredAppId={hoveredAppId}
                  setHoveredAppId={setHoveredAppId}
                  onOpenRebind={(app) => setAppToRebind(app)}
                />

                {/* Obsidian Center Core Nexus */}
                <CenterNexus
                  selectedApp={selectedApp}
                  onLaunch={(url, isDesktop) => handleLaunchUrl(url, isDesktop)}
                  ringDefinition={activeRingDef}
                  preferDesktopProtocol={preferDesktopProtocol}
                  onToggleProtocol={() =>
                    setPreferDesktopProtocol((prev) => !prev)
                  }
                />
              </div>

              {/* Bottom Quick Guide Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400 px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-850">
                <span className="text-slate-400">Direct Keystrokes:</span>
                <span className="text-cyan-300">
                  [C] Colab · [N] NotebookLM · [D] Drive · [V] VSCode · [S] Spotify · [I] Discord
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">
                  Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-bold">\ </kbd> to Collapse/Open
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Inspector & Quick Actions Panel */}
        <InspectorPanel
          selectedApp={selectedApp}
          onLaunchUrl={handleLaunchUrl}
          preferDesktopProtocol={preferDesktopProtocol}
          onToggleProtocol={() => setPreferDesktopProtocol((prev) => !prev)}
          activeRing={activeRing}
          onSelectRing={(ring) => {
            setActiveRing(ring as RingLevel);
            const ringApps = apps.filter((a) => a.ring === ring);
            if (ringApps.length > 0) {
              handleSelectApp(ringApps[0]);
            }
          }}
          ringDefinitions={RING_DEFINITIONS}
          onOpenRebind={(app) => setAppToRebind(app)}
          isWheelCollapsed={isWheelCollapsed}
          onToggleCollapse={toggleWheelCollapse}
        />
      </main>

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        apps={apps}
        onSelectApp={(app) => handleSelectApp(app, true)}
        onLaunchUrl={handleLaunchUrl}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        apps={apps}
        onOpenRebind={(app) => setAppToRebind(app)}
      />

      <AddAppModal
        isOpen={isAddAppOpen}
        onClose={() => setIsAddAppOpen(false)}
        onAddApp={handleAddApp}
        existingHotkeys={apps.map((a) => a.hotkey.toUpperCase())}
      />

      <KeybindModal
        isOpen={Boolean(appToRebind)}
        onClose={() => setAppToRebind(null)}
        app={appToRebind}
        allApps={apps}
        onSaveKeybind={handleSaveKeybind}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
