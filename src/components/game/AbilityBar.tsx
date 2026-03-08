'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AbilityConfig } from '@/lib/data/raceAbilities';

interface AbilityBarProps {
  abilities: Record<string, AbilityConfig>; // unlocked
  cooldowns: Record<string, number>; // key -> remaining ms (0 = ready)
  activeAbility: string | null; // currently active ability key (flash)
}

// Display order: left-to-right physically makes sense
const DISPLAY_ORDER = ['f', 'd', 's', ' ', 'l', 'k', 'j'];

export function AbilityBar({ abilities, cooldowns, activeAbility }: AbilityBarProps) {
  const allKeys = DISPLAY_ORDER.filter(k => k in abilities);

  if (allKeys.length === 0) return null;

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
      {allKeys.map((key) => {
        const config = abilities[key];
        const cooldown = cooldowns[key] || 0;
        const isOnCooldown = cooldown > 0;
        const isActive = activeAbility === key;
        const displayKey = key === ' ' ? 'SPATIE' : key.toUpperCase();

        return (
          <motion.div
            key={key}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: DISPLAY_ORDER.indexOf(key) * 0.05 }}
          >
            <div
              className={`
                relative flex flex-col items-center justify-center
                w-14 h-16 sm:w-16 sm:h-[4.5rem] rounded-xl border-2
                font-mono font-bold
                transition-all duration-150
                ${!isOnCooldown
                  ? 'bg-black/80 border-cyan-500/60 text-cyan-300'
                  : 'bg-black/70 border-gray-600/50 text-gray-500'
                }
              `}
              style={
                !isOnCooldown
                  ? { boxShadow: '0 0 12px rgba(6,182,212,0.4)' }
                  : undefined
              }
            >
              {/* Icon — big and clear */}
              <span className="text-xl leading-none">
                {config.icon}
              </span>

              {/* Key letter — prominent */}
              <span className="text-base leading-none mt-1 font-black tracking-wide">
                {displayKey}
              </span>

              {/* Action label — small subtitle */}
              <span className="text-[8px] leading-none mt-0.5 opacity-60 font-normal">
                {config.label}
              </span>

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div className="absolute inset-0 rounded-xl bg-gray-900/60 flex items-center justify-center">
                  <span className="text-sm text-gray-400 font-mono font-bold">
                    {Math.ceil(cooldown / 1000)}s
                  </span>
                </div>
              )}

              {/* Active flash */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-cyan-300"
                    style={{ boxShadow: '0 0 25px rgba(6,182,212,0.7)' }}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
