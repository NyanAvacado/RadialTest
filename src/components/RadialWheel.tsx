import React, { useMemo } from 'react';
import { AppItem, RingDefinition } from '../types';
import { AppIcon } from './AppIcon';
import { soundFx } from '../utils/sound';

interface RadialWheelProps {
  apps: AppItem[];
  selectedApp: AppItem | null;
  onSelectApp: (app: AppItem) => void;
  onLaunchApp: (app: AppItem, e?: React.MouseEvent) => void;
  activeRing: number; // 1, 2, or 3
  rotationOffset: number; // In degrees
  ringDefinitions: RingDefinition[];
  hoveredAppId: string | null;
  setHoveredAppId: (id: string | null) => void;
  onOpenRebind?: (app: AppItem) => void;
}

export const RadialWheel: React.FC<RadialWheelProps> = ({
  apps,
  selectedApp,
  onSelectApp,
  onLaunchApp,
  activeRing,
  rotationOffset,
  ringDefinitions,
  hoveredAppId,
  setHoveredAppId,
  onOpenRebind,
}) => {
  const center = 450;

  // Group apps by ring
  const appsByRing = useMemo(() => {
    return {
      1: apps.filter((a) => a.ring === 1),
      2: apps.filter((a) => a.ring === 2),
      3: apps.filter((a) => a.ring === 3),
    };
  }, [apps]);

  // Convert polar coordinates to Cartesian
  const getCoordinates = (radius: number, angleDegrees: number) => {
    const angleRad = ((angleDegrees - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
      angleRad,
    };
  };

  // Find active node coordinates for target laser beam
  const activeCoordinates = useMemo(() => {
    if (!selectedApp) return null;
    const ringApps = appsByRing[selectedApp.ring] || [];
    const index = ringApps.findIndex((a) => a.id === selectedApp.id);
    if (index === -1) return null;

    const ringDef = ringDefinitions.find((r) => r.level === selectedApp.ring);
    const radius = ringDef ? ringDef.radius : 180;
    const step = 360 / ringApps.length;
    const angle = index * step + rotationOffset;

    return getCoordinates(radius, angle);
  }, [selectedApp, appsByRing, ringDefinitions, rotationOffset]);

  return (
    <div className="relative w-full aspect-square max-w-[820px] mx-auto select-none flex items-center justify-center">
      {/* Ambient background glow layers */}
      <div className="absolute inset-0 rounded-full bg-radial from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div
        className="absolute inset-[15%] rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-40"
        style={{
          backgroundColor: selectedApp?.color || '#06b6d4',
        }}
      />

      <svg
        viewBox="0 0 900 900"
        className="w-full h-full overflow-visible drop-shadow-2xl"
        style={{ transformOrigin: 'center center' }}
      >
        <defs>
          {/* Obsidian dark radial gradients */}
          <radialGradient id="obsidianCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f1422" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#080a10" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#040508" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Compass Ticks (48 micro ticks) */}
        <g opacity="0.35">
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 360) / 72;
            const isMajor = i % 6 === 0;
            const rIn = isMajor ? 425 : 432;
            const rOut = 440;
            const p1 = getCoordinates(rIn, angle);
            const p2 = getCoordinates(rOut, angle);
            return (
              <line
                key={`tick-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isMajor ? '#38bdf8' : '#475569'}
                strokeWidth={isMajor ? 1.5 : 0.75}
              />
            );
          })}
        </g>

        {/* Concentric Guide Circles for each ring */}
        {ringDefinitions.map((ringDef) => {
          const isActive = ringDef.level === activeRing;
          return (
            <g key={`ring-track-${ringDef.level}`}>
              {/* Outer boundary track */}
              <circle
                cx={center}
                cy={center}
                r={ringDef.radius}
                fill="none"
                stroke={ringDef.color}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? 'none' : '4 6'}
                opacity={isActive ? 0.75 : 0.25}
                className="transition-all duration-300"
              />

              {/* Faint concentric zone band */}
              <circle
                cx={center}
                cy={center}
                r={ringDef.radius - 20}
                fill="none"
                stroke="#334155"
                strokeWidth={0.5}
                strokeDasharray="2 8"
                opacity={0.3}
              />
              <circle
                cx={center}
                cy={center}
                r={ringDef.radius + 20}
                fill="none"
                stroke="#334155"
                strokeWidth={0.5}
                strokeDasharray="2 8"
                opacity={0.3}
              />
            </g>
          );
        })}

        {/* Reticle Crosshairs / Cardinal Guides */}
        <g stroke="#334155" strokeWidth="0.75" opacity="0.25" strokeDasharray="3 6">
          <line x1={center} y1={25} x2={center} y2={875} />
          <line x1={25} y1={center} x2={875} y2={center} />
          <line x1={150} y1={150} x2={750} y2={750} />
          <line x1={150} y1={750} x2={750} y2={150} />
        </g>

        {/* Reticle Apex Cursor (12 o'clock targeting pointer) */}
        <g>
          <path
            d={`M ${center - 8} 38 L ${center} 48 L ${center + 8} 38 Z`}
            fill="#38bdf8"
            opacity="0.9"
            filter="url(#glowFilter)"
          />
          <text
            x={center}
            y={28}
            fill="#38bdf8"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            letterSpacing="2"
            opacity="0.8"
          >
            NEXUS · 000°
          </text>
        </g>

        {/* Laser Targeting Beam from Center to Selected App */}
        {activeCoordinates && selectedApp && (
          <g>
            <line
              x1={center}
              y1={center}
              x2={activeCoordinates.x}
              y2={activeCoordinates.y}
              stroke={selectedApp.color}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.85"
              filter="url(#intenseGlow)"
            />
            <circle
              cx={activeCoordinates.x}
              cy={activeCoordinates.y}
              r={32}
              fill="none"
              stroke={selectedApp.color}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.8"
              className="animate-spin-slow"
              style={{
                transformOrigin: `${activeCoordinates.x}px ${activeCoordinates.y}px`,
              }}
            />
          </g>
        )}

        {/* RINGS & APPS NODES */}
        {ringDefinitions.map((ringDef) => {
          const ringApps = appsByRing[ringDef.level] || [];
          const step = 360 / (ringApps.length || 1);

          return (
            <g key={`ring-items-${ringDef.level}`}>
              {ringApps.map((app, index) => {
                const angle = index * step + rotationOffset;
                const coords = getCoordinates(ringDef.radius, angle);
                const isSelected = selectedApp?.id === app.id;
                const isHovered = hoveredAppId === app.id;
                const isRingActive = ringDef.level === activeRing;

                return (
                  <g
                    key={app.id}
                    className="cursor-pointer transition-transform duration-200"
                    style={{
                      transformOrigin: `${coords.x}px ${coords.y}px`,
                      transform: isSelected || isHovered ? 'scale(1.15)' : 'scale(1)',
                    }}
                    onMouseEnter={() => {
                      setHoveredAppId(app.id);
                      soundFx.tick(1400);
                    }}
                    onMouseLeave={() => setHoveredAppId(null)}
                    onClick={() => {
                      soundFx.selectLock();
                      onSelectApp(app);
                    }}
                    onDoubleClick={(e) => onLaunchApp(app, e)}
                  >
                    {/* Node Aura Glow */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={28}
                        fill={app.color}
                        opacity={isSelected ? 0.35 : 0.2}
                        filter="url(#intenseGlow)"
                      />
                    )}

                    {/* Obsidian Node Background Circle */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={24}
                      fill={isSelected ? '#141a2b' : '#0c0f18'}
                      stroke={isSelected ? app.color : isHovered ? '#64748b' : '#1e293b'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-colors duration-200"
                    />

                    {/* Inner Accent Ring on Node */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={20}
                      fill="none"
                      stroke={app.color}
                      strokeWidth={0.75}
                      opacity={isSelected ? 0.9 : 0.3}
                    />

                    {/* Icon ForeignObject */}
                    <foreignObject
                      x={coords.x - 12}
                      y={coords.y - 12}
                      width={24}
                      height={24}
                      className="pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <AppIcon
                          name={app.icon}
                          className="w-5 h-5 transition-transform duration-200"
                          color={isSelected || isHovered ? app.color : '#94a3b8'}
                        />
                      </div>
                    </foreignObject>

                    {/* Hotkey Badge Pill (Top-Right of Node) - Clickable to Rebind */}
                    <g
                      transform={`translate(${coords.x + 10}, ${coords.y - 20})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.tick(1500);
                        onOpenRebind?.(app);
                      }}
                      className="cursor-pointer"
                    >
                      <title>Click to rebind quick keystroke</title>
                      <rect
                        x="-3"
                        y="-2"
                        width="18"
                        height="14"
                        rx="3"
                        fill="#090d16"
                        stroke={isSelected ? app.color : '#334155'}
                        strokeWidth="1"
                        className="hover:stroke-cyan-400 transition-colors"
                      />
                      <text
                        x="6"
                        y="9"
                        fill={isSelected ? app.color : '#cbd5e1'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {app.hotkey}
                      </text>
                    </g>

                    {/* Text Label Below/Above based on angle */}
                    {(() => {
                      const labelRadius = ringDef.radius + (ringDef.level === 3 ? 34 : 30);
                      const labelCoords = getCoordinates(labelRadius, angle);
                      return (
                        <text
                          x={labelCoords.x}
                          y={labelCoords.y + 4}
                          fill={isSelected ? '#ffffff' : isHovered ? '#e2e8f0' : isRingActive ? '#cbd5e1' : '#64748b'}
                          fontSize={isSelected ? '11' : '10'}
                          fontWeight={isSelected ? '700' : '500'}
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          letterSpacing="0.3"
                          className="pointer-events-none transition-colors duration-150"
                        >
                          {app.name}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Center Nexus Obsidian Core (Cutout Hole) */}
        <circle
          cx={center}
          cy={center}
          r={105}
          fill="url(#obsidianCore)"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <circle
          cx={center}
          cy={center}
          r={98}
          fill="none"
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>
    </div>
  );
};
