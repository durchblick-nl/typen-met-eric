'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LANE_POSITIONS } from '@/lib/data/raceAbilities';

export type PlayerState = 'running' | 'jumping' | 'dashing' | 'hit' | 'sprinting';

interface RacePlayerProps {
  lane: number; // 0, 1, 2
  state: PlayerState;
  isFeverMode: boolean;
}

function getEricSrc(state: PlayerState, isFeverMode: boolean): string {
  if (isFeverMode) return '/images/eric/eric-celebrating.png';
  switch (state) {
    case 'jumping':  return '/images/eric/eric-celebrating.png';
    case 'hit':      return '/images/eric/eric-worried.png';
    case 'sprinting':
    case 'dashing':  return '/images/eric/eric-encouraging.png';
    default:         return '/images/eric/eric-happy.png';
  }
}

export function RacePlayer({ lane, state, isFeverMode }: RacePlayerProps) {
  const targetX = LANE_POSITIONS[lane] ?? 50;
  const yOffset = state === 'jumping' ? -50 : 0;
  const neonColor = isFeverMode ? '#f472b6' : '#06b6d4';
  const ericSrc = getEricSrc(state, isFeverMode);

  const glowFilter = isFeverMode
    ? 'drop-shadow(0 0 10px #f472b6) drop-shadow(0 0 22px #a855f760)'
    : state === 'hit'
      ? 'drop-shadow(0 0 10px #ef4444) drop-shadow(0 0 20px #ef444460)'
      : `drop-shadow(0 0 8px ${neonColor}90) drop-shadow(0 0 18px ${neonColor}40)`;

  return (
    <motion.div
      className="absolute z-15 pointer-events-none"
      style={{ bottom: '16%', left: 0, right: 0 }}
    >
      {/* Jump shadow — stays on the ground as player rises */}
      <AnimatePresence>
        {state === 'jumping' && (
          <motion.div
            className="absolute -translate-x-1/2 rounded-full"
            style={{ left: `${targetX}%`, bottom: -4, width: 48, height: 10,
              background: 'rgba(0,0,0,0.45)', filter: 'blur(6px)' }}
            initial={{ opacity: 0.5, scaleX: 1 }}
            animate={{ opacity: 0.12, scaleX: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>

      {/* Player — moves with lane + jump */}
      <motion.div
        className="absolute -translate-x-1/2"
        animate={{ left: `${targetX}%`, y: yOffset }}
        transition={
          state === 'dashing'
            ? { type: 'spring', stiffness: 800, damping: 20 }
            : { type: 'spring', stiffness: 400, damping: 25 }
        }
      >
        {/* Dash trail */}
        {state === 'dashing' && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-full"
            initial={{ opacity: 0.7, scaleX: 2.5 }}
            animate={{ opacity: 0, scaleX: 3.5 }}
            transition={{ duration: 0.35 }}
            style={{
              background: `radial-gradient(ellipse, ${neonColor}50 0%, transparent 70%)`,
              filter: 'blur(12px)',
            }}
          />
        )}

        {/* Sprinting speed lines */}
        {state === 'sprinting' && (
          <>
            <motion.div className="absolute w-5 h-0.5 bg-yellow-300 rounded-full"
              style={{ right: '100%', top: '30%' }}
              animate={{ x: [-4, -14], opacity: [0.9, 0] }}
              transition={{ duration: 0.28, repeat: Infinity }}
            />
            <motion.div className="absolute w-7 h-0.5 bg-yellow-200 rounded-full"
              style={{ right: '100%', top: '55%' }}
              animate={{ x: [-2, -16], opacity: [0.7, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, delay: 0.08 }}
            />
            <motion.div className="absolute w-5 h-0.5 bg-yellow-300 rounded-full"
              style={{ left: '100%', top: '42%' }}
              animate={{ x: [4, 14], opacity: [0.8, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: 0.04 }}
            />
          </>
        )}

        {/* Eric sprite with state-matched mood */}
        <motion.div
          animate={
            state === 'hit'
              ? { opacity: [1, 0.2, 1, 0.2, 1], x: [-4, 4, -3, 3, 0] }
              : state === 'sprinting'
                ? { scaleX: [0.94, 1, 0.94], scaleY: [1.06, 1, 1.06] }
                : {}
          }
          transition={
            state === 'hit'      ? { duration: 0.4 } :
            state === 'sprinting' ? { duration: 0.22, repeat: Infinity } : {}
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={ericSrc}
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 0.9 }}
              transition={{ duration: 0.12 }}
            >
              <Image
                src={ericSrc}
                alt="Eric"
                width={80}
                height={80}
                className="object-contain select-none"
                style={{ filter: glowFilter }}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Fever aura */}
        {isFeverMode && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.4, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              background: 'radial-gradient(ellipse, rgba(244,114,182,0.45) 0%, transparent 70%)',
              filter: 'blur(14px)',
            }}
          />
        )}

        {/* Ground glow */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-5 -z-10 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${neonColor}55 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
