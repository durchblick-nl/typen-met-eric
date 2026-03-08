'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CrystalType, getCrystalConfig } from '@/lib/data/crystalTypes';

// Lane positions as percentage from left edge
export const LANE_POSITIONS_5 = [12, 28, 50, 72, 88];
export const LANE_POSITIONS_3 = [22, 50, 78];

interface LaneCrystalProps {
  id: string;
  letter: string;
  lane: number;
  duration: number;
  crystalType: CrystalType;
  colorClass?: string;
  laneCount: number;
  onMiss: (id: string, type: CrystalType) => void;
}

export function LaneCrystal({
  id,
  letter,
  lane,
  duration,
  crystalType,
  colorClass,
  laneCount,
  onMiss,
}: LaneCrystalProps) {
  const config = getCrystalConfig(crystalType);
  const gradientClass = colorClass || config.colors[0];
  const isDanger = config.special === 'danger';
  const isPowerup = config.special === 'powerup';
  const isSpecial = crystalType !== 'normal';
  const missCalledRef = useRef(false);

  // Progress from 0 (horizon) to 1 (hit zone)
  const progress = useMotionValue(0);

  // Lane target X position
  const lanePositions = laneCount === 3 ? LANE_POSITIONS_3 : LANE_POSITIONS_5;
  const targetX = lanePositions[lane] ?? 50;

  // Derived transforms from progress
  const y = useTransform(progress, [0, 1], [-10, 82]); // vh units (horizon to hit zone)
  const scale = useTransform(progress, [0, 0.3, 1], [0.15, 0.4, 1.0]);
  const opacity = useTransform(progress, [0, 0.15, 0.8, 1], [0, 0.6, 1, 1]);
  const blur = useTransform(progress, [0, 0.4, 1], [3, 0.5, 0]);
  const xPos = useTransform(progress, [0, 0.5, 1], [50, (50 + targetX) / 2, targetX]);

  // 3D rotation for tumbling effect
  const rotateY = useTransform(progress, [0, 1], [0, 720]);

  // Animate progress over duration
  useEffect(() => {
    const controls = animate(progress, 1, {
      duration,
      ease: [0.2, 0, 0.8, 1], // Custom ease: slow start, fast end (approaching feel)
    });

    return () => controls.stop();
  }, [progress, duration]);

  // Detect when crystal reaches the end
  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      if (v >= 0.99 && !missCalledRef.current) {
        missCalledRef.current = true;
        onMiss(id, crystalType);
      }
    });
    return unsub;
  }, [progress, id, crystalType, onMiss]);

  return (
    <motion.div
      data-crystal-id={id}
      data-letter={letter}
      data-type={crystalType}
      className="absolute z-10 pointer-events-none"
      style={{
        left: useTransform(xPos, (v) => `${v}%`),
        top: useTransform(y, (v) => `${v}vh`),
        scale,
        opacity,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
        transform: 'translateX(-50%) translateY(-50%)',
      }}
    >
      {/* Glow trail behind crystal */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -z-10 rounded-full"
        style={{
          width: '130%',
          height: '200%',
          top: '-50%',
          background: `radial-gradient(ellipse, ${config.glowColor}40 0%, transparent 70%)`,
          filter: 'blur(8px)',
          opacity: useTransform(progress, [0, 0.3, 0.8], [0, 0.3, 0.7]),
        }}
      />

      {/* Crystal body with 3D rotation */}
      <motion.div
        className="relative"
        style={{
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Bomb wobble */}
        {crystalType === 'bomb' && (
          <motion.div
            className="relative"
            animate={{
              rotate: [-3, 3, -3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <CrystalShape
              gradientClass={gradientClass}
              config={config}
              crystalType={crystalType}
              letter={letter}
              isDanger={isDanger}
              isPowerup={isPowerup}
              isSpecial={isSpecial}
            />
          </motion.div>
        )}

        {/* Rainbow color cycling */}
        {crystalType === 'rainbow' && (
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <CrystalShape
              gradientClass={gradientClass}
              config={config}
              crystalType={crystalType}
              letter={letter}
              isDanger={isDanger}
              isPowerup={isPowerup}
              isSpecial={isSpecial}
            />
          </motion.div>
        )}

        {/* Gold sparkle */}
        {crystalType === 'gold' && (
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <CrystalShape
              gradientClass={gradientClass}
              config={config}
              crystalType={crystalType}
              letter={letter}
              isDanger={isDanger}
              isPowerup={isPowerup}
              isSpecial={isSpecial}
            />
          </motion.div>
        )}

        {/* Default crystals (normal, ice, shield, slowmo, magnet) */}
        {crystalType !== 'bomb' && crystalType !== 'rainbow' && crystalType !== 'gold' && (
          <motion.div
            animate={isPowerup ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <CrystalShape
              gradientClass={gradientClass}
              config={config}
              crystalType={crystalType}
              letter={letter}
              isDanger={isDanger}
              isPowerup={isPowerup}
              isSpecial={isSpecial}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Extracted crystal visual shape (same hexagon look but cleaner)
function CrystalShape({
  gradientClass,
  config,
  crystalType,
  letter,
  isDanger,
  isPowerup,
  isSpecial,
}: {
  gradientClass: string;
  config: ReturnType<typeof getCrystalConfig>;
  crystalType: CrystalType;
  letter: string;
  isDanger: boolean;
  isPowerup: boolean;
  isSpecial: boolean;
}) {
  return (
    <div className="relative">
      {/* Main crystal hexagon */}
      <div
        className={`
          w-14 h-[4.25rem] flex items-center justify-center relative
          bg-gradient-to-br ${gradientClass}
          ${isDanger ? 'animate-pulse' : ''}
          ${isPowerup ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
        `}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: `0 0 20px ${config.glowColor}60, 0 0 40px ${config.glowColor}30`,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-2 bg-white/30"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        />

        {/* Rainbow animation overlay */}
        {crystalType === 'rainbow' && (
          <motion.div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(45deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Bomb tick */}
        {crystalType === 'bomb' && (
          <motion.div
            className="absolute inset-0 bg-red-500/50"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* Letter or Icon */}
        <div className="relative z-10 flex flex-col items-center">
          {config.icon && (
            <span className="text-base leading-none mb-0.5">{config.icon}</span>
          )}
          <span
            className={`
              font-mono text-lg font-bold
              ${isDanger ? 'text-red-200' : 'text-gray-900'}
            `}
            style={{
              textShadow: isDanger
                ? '0 0 10px rgba(239,68,68,0.8)'
                : '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
            }}
          >
            {letter}
          </span>
        </div>
      </div>

      {/* Outer glow */}
      <div
        className={`absolute inset-0 -z-10 blur-md bg-gradient-to-br ${gradientClass}`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          transform: 'scale(1.3)',
          opacity: isSpecial ? 0.7 : 0.4,
        }}
      />
    </div>
  );
}
