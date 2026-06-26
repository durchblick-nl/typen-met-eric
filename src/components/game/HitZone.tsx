'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LANE_POSITIONS } from '@/lib/data/raceAbilities';

export type HitResult = 'hit' | 'miss' | 'bomb' | null;

interface HitZoneProps {
  hitResult: HitResult;
  combo: number;
  isFeverMode: boolean;
  playerLane?: number; // highlight active lane
}

export function HitZone({ hitResult, combo, isFeverMode, playerLane }: HitZoneProps) {
  // Bar thickness scales with combo
  const barHeight = Math.min(6, 2 + combo * 0.1);
  const glowIntensity = Math.min(30, 8 + combo * 0.5);

  const baseColor = isFeverMode ? '#f472b6' : '#06b6d4';
  const baseColorAlt = isFeverMode ? '#a855f7' : '#3b82f6';

  return (
    <div
      className="absolute left-0 right-0 z-15 pointer-events-none"
      style={{ bottom: '15%' }}
    >
      {/* Physical collection gate */}
      <div
        className="absolute left-4 right-4 -top-5 h-10 rounded-full"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${baseColor}18 0%, transparent 62%)`,
          boxShadow: `inset 0 0 20px ${baseColor}18`,
        }}
      />

      {/* Main neon line */}
      <div
        className="relative mx-4"
        style={{
          height: `${barHeight}px`,
          background: `linear-gradient(90deg, transparent 0%, ${baseColor} 10%, ${baseColorAlt} 50%, ${baseColor} 90%, transparent 100%)`,
          boxShadow: `0 0 ${glowIntensity}px ${baseColor}80, 0 0 ${glowIntensity * 2}px ${baseColor}40, 0 -2px ${glowIntensity}px ${baseColor}30, 0 2px ${glowIntensity}px ${baseColor}30`,
          borderRadius: '2px',
        }}
      />

      {/* Lane markers */}
      {LANE_POSITIONS.map((pos, i) => {
        const isPlayerLane = playerLane === i;
        return (
          <div
            key={`marker-${i}`}
            className="absolute -translate-x-1/2"
            style={{
              left: `${pos}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: isPlayerLane ? '14px' : '10px',
              height: isPlayerLane ? '14px' : '10px',
              borderRadius: '50%',
              background: isPlayerLane
                ? `radial-gradient(circle, #ffffff 0%, ${baseColor} 60%, transparent 100%)`
                : `radial-gradient(circle, ${baseColor} 0%, ${baseColor}60 60%, transparent 100%)`,
              boxShadow: isPlayerLane
                ? `0 0 12px ${baseColor}, 0 0 24px ${baseColor}60`
                : `0 0 8px ${baseColor}80`,
              transition: 'all 0.2s ease',
            }}
          />
        );
      })}

      {/* Short vertical gate posts */}
      {LANE_POSITIONS.map((pos, i) => {
        const isPlayerLane = playerLane === i;
        return (
          <div
            key={`gate-post-${i}`}
            className="absolute -translate-x-1/2"
            style={{
              left: `${pos}%`,
              top: '-18px',
              width: isPlayerLane ? 3 : 2,
              height: isPlayerLane ? 42 : 30,
              borderRadius: 999,
              background: isPlayerLane
                ? `linear-gradient(to bottom, transparent, #ffffff, ${baseColor}, transparent)`
                : `linear-gradient(to bottom, transparent, ${baseColor}90, transparent)`,
              boxShadow: isPlayerLane ? `0 0 18px ${baseColor}` : `0 0 10px ${baseColor}60`,
              opacity: isPlayerLane ? 0.95 : 0.5,
            }}
          />
        );
      })}

      {/* Hit feedback ripple */}
      <AnimatePresence>
        {hitResult === 'hit' && (
          <motion.div
            key="hit-ripple"
            className="absolute left-0 right-0"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleY: 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="mx-4"
              style={{
                height: '4px',
                background: `linear-gradient(90deg, transparent 0%, #ffffff 20%, #67e8f9 50%, #ffffff 80%, transparent 100%)`,
                boxShadow: '0 0 20px #67e8f9, 0 0 40px #67e8f980',
                borderRadius: '2px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Miss feedback - red flash */}
      <AnimatePresence>
        {hitResult === 'miss' && (
          <motion.div
            key="miss-flash"
            className="absolute left-0 right-0"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="mx-4"
              style={{
                height: '6px',
                background: '#ef4444',
                boxShadow: '0 0 20px #ef4444, 0 0 40px #ef444480',
                borderRadius: '2px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bomb feedback - red pulse */}
      <AnimatePresence>
        {hitResult === 'bomb' && (
          <motion.div
            key="bomb-pulse"
            className="absolute left-0 right-0"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleY: 6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="mx-4"
              style={{
                height: '6px',
                background: '#ef4444',
                boxShadow: '0 0 30px #ef4444, 0 0 60px #ef444480',
                borderRadius: '2px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
