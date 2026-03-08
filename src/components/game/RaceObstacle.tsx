'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { ObstacleType, LANE_POSITIONS } from '@/lib/data/raceAbilities';

interface RaceObstacleProps {
  id: string;
  lane: number;
  type: ObstacleType;
  letter?: string;
  duration: number;
  destroyed: boolean;
  onReachEnd: (id: string) => void;
}

// Colors and glow per obstacle type
const TYPE_STYLES: Record<ObstacleType, {
  gradient: string;
  glow: string;
}> = {
  letter: {
    gradient: 'from-slate-700 to-slate-900',
    glow: '#38bdf8',
  },
  gold: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glow: '#fb923c',
  },
  bomb: {
    gradient: 'from-gray-700 via-red-900 to-gray-800',
    glow: '#ef4444',
  },
  gem: {
    gradient: 'from-yellow-300 via-amber-400 to-yellow-500',
    glow: '#fbbf24',
  },
  ice: {
    gradient: 'from-sky-200 via-cyan-300 to-sky-400',
    glow: '#7dd3fc',
  },
};

export function RaceObstacle({
  id,
  lane,
  type,
  letter,
  duration,
  destroyed,
  onReachEnd,
}: RaceObstacleProps) {
  const style = TYPE_STYLES[type];
  const reachedEndRef = useRef(false);

  // Generate stable fragment offsets once per obstacle so the destruction
  // animation doesn't repick random values on re-renders.
  const fragmentOffsets = useMemo(
    () => [0, 1, 2, 3].map((i) => ({
      x: (i % 2 === 0 ? -1 : 1) * (20 + Math.random() * 20),
      y: (i < 2 ? -1 : 1) * (15 + Math.random() * 15),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id] // keyed by obstacle id so each obstacle gets its own stable set
  );

  // Progress from 0 (horizon) to 1 (player position)
  const progress = useMotionValue(0);

  const targetX = LANE_POSITIONS[lane] ?? 50;

  // Derived transforms — same depth feeling as LaneCrystal but NO rotateY
  const y = useTransform(progress, [0, 1], [-10, 88]); // vh — matches player at bottom:16% (84vh)
  const scale = useTransform(progress, [0, 0.3, 1], [0.15, 0.4, 1.0]);
  const opacity = useTransform(progress, [0, 0.15, 0.8, 1], [0, 0.6, 1, 1]);
  const blur = useTransform(progress, [0, 0.4, 1], [3, 0.5, 0]);
  // All obstacles converge from center to lane — smooth and consistent
  const xPos = useTransform(progress, [0, 0.5, 1], [50, (50 + targetX) / 2, targetX]);

  // Size per type: bombs and gems are BIGGER for visibility
  const sizeMultiplier = type === 'bomb' ? 1.3 : type === 'gem' ? 1.1 : type === 'gold' ? 1.15 : 1;

  // All useTransform hooks MUST be called unconditionally (before any early return)
  const leftStyle = useTransform(xPos, (v) => `${v}%`);
  const topStyle = useTransform(y, (v) => `${v}vh`);
  const scaleStyle = useTransform(scale, (v) => v * sizeMultiplier);
  const blurStyle = useTransform(blur, (v) => `blur(${v}px)`);
  const glowOpacity = useTransform(progress, [0, 0.3, 0.8], [0, 0.3, 0.7]);

  // Animate progress over duration
  useEffect(() => {
    const controls = animate(progress, 1, {
      duration,
      ease: [0.2, 0, 0.8, 1], // Slow start, fast end (approaching feel)
    });
    return () => controls.stop();
  }, [progress, duration]);

  // Detect when obstacle reaches the end
  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      if (v >= 0.95 && !reachedEndRef.current) {
        reachedEndRef.current = true;
        onReachEnd(id);
      }
    });
    return unsub;
  }, [progress, id, onReachEnd]);

  // Destruction animation
  if (destroyed) {
    return (
      <motion.div
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${targetX}%`,
          top: topStyle,
          transform: 'translateX(-50%) translateY(-50%)',
        }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: [1.3, 0], opacity: [1, 0], rotate: [0, 15] }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Breaking hexagon fragments */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4"
            style={{
              background: `linear-gradient(135deg, ${style.glow}80, transparent)`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            initial={{ x: 0, y: 0 }}
            animate={{
              x: [0, fragmentOffsets[i].x],
              y: [0, fragmentOffsets[i].y],
              opacity: [1, 0],
              rotate: [0, (i % 2 === 0 ? 180 : -180)],
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      data-obstacle-id={id}
      data-type={type}
      className="absolute z-10 pointer-events-none"
      style={{
        left: leftStyle,
        top: topStyle,
        scale: scaleStyle,
        opacity,
        filter: blurStyle,
        transform: 'translateX(-50%) translateY(-50%)',
      }}
    >
      {/* Glow trail */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -z-10 rounded-full"
        style={{
          width: '130%',
          height: '200%',
          top: '-50%',
          background: `radial-gradient(ellipse, ${style.glow}40 0%, transparent 70%)`,
          filter: 'blur(8px)',
          opacity: glowOpacity,
        }}
      />

      {/* Obstacle body — distinct animations per type */}
      {type === 'bomb' ? (
        <motion.div
          animate={{
            rotate: [-5, 5, -5],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <BombShape style={style} />
        </motion.div>
      ) : type === 'gold' ? (
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        >
          <ObstacleShape type={type} letter={letter} style={style} />
        </motion.div>
      ) : type === 'gem' ? (
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <CoinShape style={style} />
        </motion.div>
      ) : (
        <ObstacleShape type={type} letter={letter} style={style} />
      )}
    </motion.div>
  );
}

// Hexagon obstacle shape (letter, gold, ice — NOT bomb)
function ObstacleShape({
  type,
  letter,
  style,
}: {
  type: ObstacleType;
  letter?: string;
  style: { gradient: string; glow: string };
}) {
  const isIce = type === 'ice';

  return (
    <div className="relative">
      {/* Main hexagon */}
      <div
        className={`w-16 h-[5rem] flex items-center justify-center relative bg-gradient-to-br ${style.gradient}`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: `0 0 20px ${style.glow}60, 0 0 40px ${style.glow}30`,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-2 bg-white/30"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        />

        {/* Ice shimmer */}
        {isIce && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Letter or icon */}
        <div className="relative z-10 flex flex-col items-center">
          {type === 'gold' && (
            <span className="text-[10px] px-1.5 py-0.5 mb-0.5 rounded bg-white/20 border border-white/40 leading-none">
              2x
            </span>
          )}
          {type === 'ice' && (
            <span className="w-5 h-5 mb-0.5 rotate-45 border border-white/70" />
          )}
          {letter && (
            <span className="text-[9px] px-1.5 py-0.5 mb-0.5 rounded bg-cyan-400/20 border border-cyan-300/40 tracking-wide leading-none">
              TYP
            </span>
          )}
          {letter && (
            <span
              className="font-mono text-2xl font-black text-white"
              style={{
                textShadow: '2px 2px 0 rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              {letter.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Outer glow */}
      <div
        className={`absolute inset-0 -z-10 blur-md bg-gradient-to-br ${style.gradient}`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          transform: 'scale(1.3)',
          opacity: type === 'gold' ? 0.7 : 0.4,
        }}
      />
    </div>
  );
}

// Bomb — big round danger orb, visually VERY different from letter blocks
function BombShape({ style }: { style: { gradient: string; glow: string } }) {
  return (
    <div className="relative">
      {/* Danger ring */}
      <motion.div
        className="absolute inset-0 -z-5 rounded-full border-2 border-red-500/60"
        style={{ transform: 'scale(1.6)' }}
        animate={{ scale: [1.6, 1.8, 1.6], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />

      {/* Main orb */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center relative"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #7f1d1d 0%, #450a0a 50%, #1c0404 100%)',
          boxShadow: '0 0 25px rgba(239,68,68,0.7), 0 0 50px rgba(239,68,68,0.3), inset 0 0 15px rgba(239,68,68,0.4)',
        }}
      >
        {/* Pulsing red core */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Bomb icon */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="w-2 h-2 rounded-full bg-red-300 mb-1" />
          <span className="text-lg font-black text-red-100 leading-none">!</span>
        </div>
      </div>

      {/* Outer danger glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-lg"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)',
          transform: 'scale(2)',
        }}
      />
    </div>
  );
}

// Coin shape — catchable collectible
function CoinShape({ style }: { style: { gradient: string; glow: string } }) {
  return (
    <div className="relative">
      {/* Ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: -4,
          width: 28,
          height: 6,
          background: `radial-gradient(ellipse, ${style.glow}50 0%, transparent 70%)`,
          filter: 'blur(3px)',
        }}
      />
      {/* Coin body */}
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.gradient} border-2 border-amber-200/80 relative flex items-center justify-center`}
        style={{
          boxShadow: `0 0 18px ${style.glow}90, 0 0 35px ${style.glow}50`,
        }}
      >
        <div className="absolute inset-1 rounded-full border border-amber-50/70" />
        <div className="w-3 h-3 rounded-full border border-amber-50/80" />
      </div>
      {/* Outer glow */}
      <div
        className={`absolute inset-0 -z-10 blur-sm rounded-full bg-gradient-to-br ${style.gradient}`}
        style={{
          transform: 'scale(1.5)',
          opacity: 0.7,
        }}
      />
    </div>
  );
}
