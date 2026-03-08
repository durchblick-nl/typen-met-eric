'use client';

import { motion } from 'framer-motion';
import { LANE_POSITIONS } from '@/lib/data/raceAbilities';

interface LaneRunnerBackgroundProps {
  isFeverMode?: boolean;
  intensity?: number; // 0-1, combo/fever intensity
  laneCount?: number;
  speedMultiplier?: number; // 1 = normal, <1 = slow-mo, >1 = sprint
}

// Synthwave city silhouette at the horizon — buildings as {x, w, top} in SVG units (0-100)
// Bottom of every building = VP_Y (22). top = how far above the horizon it reaches.
const BUILDINGS = [
  { x: 0,  w: 4, top: 16 }, { x: 5,  w: 3, top: 12 }, { x: 9,  w: 5, top: 15 },
  { x: 15, w: 3, top: 9  }, { x: 19, w: 4, top: 14 }, { x: 24, w: 2, top: 18 },
  { x: 27, w: 4, top: 11 }, { x: 32, w: 3, top: 16 }, { x: 36, w: 5, top: 8  },
  { x: 42, w: 3, top: 14 }, { x: 46, w: 4, top: 10 },
  { x: 50, w: 4, top: 10 }, { x: 55, w: 3, top: 14 },
  { x: 58, w: 5, top: 8  }, { x: 64, w: 3, top: 16 }, { x: 68, w: 4, top: 11 },
  { x: 73, w: 2, top: 18 }, { x: 76, w: 4, top: 14 }, { x: 81, w: 3, top: 9  },
  { x: 85, w: 5, top: 15 }, { x: 91, w: 3, top: 12 }, { x: 95, w: 4, top: 16 },
] as const;

// Pre-compute mid-ground parallax objects that drift horizontally.
// Higher Y (closer to bottom) = closer to player = larger + faster.
const PARALLAX_OBJECTS = Array.from({ length: 18 }, (_, i) => {
  const t = i / 17; // 0 = near horizon, 1 = near player
  const fromLeft = i % 2 === 0;
  return {
    startX: fromLeft ? -5 : 107,
    endX:   fromLeft ? 109 : -7,
    y:        26 + t * 36,          // 26% → 62% screen height
    size:      5 + t * 11,          // 5px → 16px
    duration: 18 - t * 10,          // 18s (slow/far) → 8s (fast/near)
    delay:    (i * 2.1) % 14,
    opacity:  0.04 + t * 0.13,
    rotate:   i * 40,               // hex rotation offset
  };
});

// Pre-compute starfield (deterministic, no Math.random in render)
const STARS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const endRadius = 50 + (i % 3) * 15;
  const endX = 50 + Math.cos(angle) * endRadius;
  const endY = 22 + Math.sin(angle) * (endRadius * 0.8);
  return {
    endX: Math.max(-5, Math.min(105, endX)),
    endY: Math.max(-5, Math.min(105, endY)),
    size: 1 + (i % 3),
    delay: (i * 0.12) % 2.8,
    duration: 1.2 + (i % 4) * 0.3,
  };
});

// Vanishing point — where obstacles originate from
const VP_X = 50;
const VP_Y = 22;

// Lane divider positions at the bottom of screen
const laneGap = LANE_POSITIONS[1] - LANE_POSITIONS[0];
const DIVIDERS = [
  LANE_POSITIONS[0] - laneGap / 2,  // ~8%
  (LANE_POSITIONS[0] + LANE_POSITIONS[1]) / 2,  // ~36%
  (LANE_POSITIONS[1] + LANE_POSITIONS[2]) / 2,  // ~64%
  LANE_POSITIONS[2] + laneGap / 2,  // ~92%
];

export function LaneRunnerBackground({
  isFeverMode = false,
  intensity = 0,
  speedMultiplier = 1,
}: LaneRunnerBackgroundProps) {
  const neonColor = isFeverMode ? '#f472b6' : '#06b6d4';
  const starSpeed = Math.max(0.6, 1.4 / speedMultiplier);
  const gridSpeed = Math.max(0.8, (3 - intensity * 1.5) / speedMultiplier);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0a0a1a' }}>
      {/* CSS animation for scrolling dashes */}
      <style jsx>{`
        @keyframes dashScroll {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes horizonPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>

      {/* Deep space background */}
      <div
        className="absolute inset-0"
        style={{
          background: isFeverMode
            ? 'radial-gradient(ellipse at 50% 20%, #2d1b4e 0%, #1a0a2e 30%, #0a0a1a 70%)'
            : 'radial-gradient(ellipse at 50% 20%, #0c1929 0%, #0a1020 30%, #0a0a1a 70%)',
        }}
      />

      {/* Subtle arcade scanline layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
          opacity: isFeverMode ? 0.1 : 0.07,
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Film grain noise layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 0.6px, transparent 0.6px)',
          backgroundSize: '3px 3px',
          opacity: 0.08,
        }}
      />

      {/* Static background stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`bg-star-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 23 + 7) % 40}%`,
            width: i % 4 === 0 ? 2 : 1,
            height: i % 4 === 0 ? 2 : 1,
            background: 'white',
            opacity: 0.15 + (i % 5) * 0.06,
          }}
        />
      ))}

      {/* === STARFIELD: warp-speed stars from vanishing point outward === */}
      {STARS.map((star, i) => (
        <motion.div
          key={`warp-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: star.size,
            height: star.size,
            background: isFeverMode
              ? i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#fbbf24' : '#a855f7'
              : i % 2 === 0 ? '#ffffff' : '#67e8f9',
          }}
          animate={{
            left: [`${VP_X}%`, `${star.endX}%`],
            top: [`${VP_Y}%`, `${star.endY}%`],
            opacity: [0, 0.8, 0.9, 0],
            scale: [0.2, 0.5, 1.5, 2],
          }}
          transition={{
            duration: starSpeed + star.duration * 0.5,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Warp streak lines from center outward */}
      {[...Array(isFeverMode ? 10 : 5)].map((_, i) => {
        const angle = (i / (isFeverMode ? 10 : 5)) * Math.PI * 2;
        const len = 8 + (i % 3) * 4;
        const endX = 50 + Math.cos(angle) * 55;
        const endY = 22 + Math.sin(angle) * 45;
        const rotation = (angle * 180) / Math.PI + 90;
        return (
          <motion.div
            key={`streak-${i}`}
            className="absolute pointer-events-none"
            style={{
              width: '1px',
              height: `${len}vh`,
              background: `linear-gradient(to bottom, transparent, ${
                isFeverMode
                  ? i % 2 === 0 ? '#f472b680' : '#a855f780'
                  : `${neonColor}50`
              }, transparent)`,
              transformOrigin: 'top center',
              rotate: `${rotation}deg`,
            }}
            animate={{
              left: ['50%', `${endX}%`],
              top: ['22%', `${endY}%`],
              opacity: [0, 0.5, 0],
              scaleY: [0.3, 1.2],
            }}
            transition={{
              duration: starSpeed + 0.3,
              repeat: Infinity,
              delay: (i * 0.25) % 2,
              ease: 'easeIn',
            }}
          />
        );
      })}

      {/* Horizon glow at vanishing point */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '18%',
          width: '50%',
          height: '12%',
          background: `radial-gradient(ellipse, ${neonColor}40 0%, transparent 70%)`,
          animation: 'horizonPulse 2s ease-in-out infinite',
          filter: 'blur(20px)',
        }}
      />

      {/* === ROAD: SVG lines from vanishing point to lane positions === */}
      {/* These match the actual obstacle flight paths exactly */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* City silhouette — synthwave skyline just above the horizon */}
        {BUILDINGS.map((b, i) => (
          <rect
            key={`bld-${i}`}
            x={b.x} y={b.top}
            width={b.w} height={VP_Y - b.top}
            fill={isFeverMode ? 'rgba(45,10,70,0.55)' : 'rgba(6,15,30,0.55)'}
          />
        ))}
        {/* Neon rooftop trim */}
        {BUILDINGS.map((b, i) => (
          <line
            key={`roof-${i}`}
            x1={b.x} y1={b.top} x2={b.x + b.w} y2={b.top}
            stroke={isFeverMode ? '#f472b6' : '#06b6d4'}
            strokeOpacity={0.25}
            strokeWidth={0.18}
          />
        ))}

        {/* Road surface — dark trapezoid from VP to bottom edges */}
        <polygon
          points={`${VP_X},${VP_Y} ${DIVIDERS[0]},100 ${DIVIDERS[3]},100`}
          fill={isFeverMode ? 'rgba(13,5,32,0.6)' : 'rgba(6,10,21,0.6)'}
        />

        {/* Lane divider lines (outer = brighter, inner = subtle) */}
        {DIVIDERS.map((pos, i) => {
          const isEdge = i === 0 || i === DIVIDERS.length - 1;
          return (
            <line
              key={`div-${i}`}
              x1={VP_X} y1={VP_Y}
              x2={pos} y2={100}
              stroke={neonColor}
              strokeOpacity={isEdge ? 0.5 : 0.2}
              strokeWidth={isEdge ? 0.3 : 0.15}
            />
          );
        })}

        {/* Lane center guide lines (dashed, scrolling) */}
        {LANE_POSITIONS.map((pos, i) => (
          <line
            key={`center-${i}`}
            x1={VP_X} y1={VP_Y}
            x2={pos} y2={100}
            stroke={neonColor}
            strokeOpacity={0.12}
            strokeWidth={0.15}
            strokeDasharray="1.5 3"
            style={{
              animation: `dashScroll ${gridSpeed}s linear infinite`,
            }}
          />
        ))}

        {/* Horizontal grid lines for depth feel (spaced closer near VP) */}
        {[35, 48, 58, 67, 75, 82, 88, 93, 97].map((yPos, i) => {
          // Interpolate x positions at this y-level
          const t = (yPos - VP_Y) / (100 - VP_Y); // 0 at VP, 1 at bottom
          const xLeft = VP_X + (DIVIDERS[0] - VP_X) * t;
          const xRight = VP_X + (DIVIDERS[3] - VP_X) * t;
          return (
            <line
              key={`hgrid-${i}`}
              x1={xLeft} y1={yPos}
              x2={xRight} y2={yPos}
              stroke={neonColor}
              strokeOpacity={0.06 + t * 0.06}
              strokeWidth={0.1}
            />
          );
        })}
      </svg>

      {/* Side neon trim lines */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: `${VP_Y}%`, left: `${DIVIDERS[0]}%`, bottom: '0', width: '1px',
          background: `linear-gradient(to bottom, transparent 0%, ${neonColor}30 30%, ${neonColor}60 100%)`,
          boxShadow: `0 0 8px ${neonColor}30`,
          transform: `rotate(${Math.atan2(100 - VP_Y, DIVIDERS[0] - VP_X) * 0}deg)`,
        }}
      />

      {/* Fever mode: extra speed lines */}
      {isFeverMode &&
        [...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const endX = 50 + Math.cos(angle) * 60;
          const endY = 22 + Math.sin(angle) * 50;
          return (
            <motion.div
              key={`fever-streak-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: '2px',
                height: '15vh',
                background: `linear-gradient(to bottom, transparent, ${
                  i % 2 === 0 ? '#f472b6' : '#a855f7'
                }60, transparent)`,
                rotate: `${(angle * 180) / Math.PI + 90}deg`,
                transformOrigin: 'top center',
              }}
              animate={{
                left: ['50%', `${endX}%`],
                top: ['22%', `${endY}%`],
                opacity: [0, 0.7, 0],
                scaleY: [0.5, 1.5],
              }}
              transition={{
                duration: 0.5 + (i % 3) * 0.15,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeIn',
              }}
            />
          );
        })}

      {/* Fever mode: horizon light show */}
      {isFeverMode && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: '10%',
            width: '80%',
            height: '25%',
            background: `conic-gradient(from 0deg at 50% 100%, transparent 0deg, #f472b640 30deg, transparent 60deg, #a855f740 90deg, transparent 120deg, #fbbf2440 150deg, transparent 180deg)`,
            filter: 'blur(30px)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {speedMultiplier > 1.2 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 78%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 40%, transparent 75%)',
          }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Mid-ground parallax crystals — drift across at depth-based speeds */}
      {PARALLAX_OBJECTS.map((obj, i) => (
        <motion.div
          key={`par-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: `${obj.y}%`,
            width: obj.size,
            height: obj.size,
            opacity: isFeverMode ? obj.opacity * 1.6 : obj.opacity,
            background: isFeverMode
              ? i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#a855f7' : '#fbbf24'
              : i % 2 === 0 ? '#06b6d4' : '#818cf8',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            rotate: `${obj.rotate}deg`,
          }}
          animate={{ left: [`${obj.startX}%`, `${obj.endX}%`] }}
          transition={{
            duration: obj.duration / speedMultiplier,
            repeat: Infinity,
            delay: obj.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
