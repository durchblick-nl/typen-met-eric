'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles } from '@/components/ui/Sparkles';
import { CrystalType, getCrystalConfig, getRandomNormalColor } from '@/lib/data/crystalTypes';

interface CrystalProps {
  id: string;
  letter: string;
  x: number;              // 0-100% horizontal position
  duration: number;       // Fall duration in seconds
  crystalType: CrystalType;
  colorClass?: string;    // Override color for normal crystals
  onCollect: (id: string, type: CrystalType) => void;
  onMiss: (id: string, type: CrystalType) => void;
}

export function Crystal({
  id,
  letter,
  x,
  duration,
  crystalType,
  colorClass,
  onCollect,
  onMiss,
}: CrystalProps) {
  const [collected, setCollected] = useState(false);
  const config = getCrystalConfig(crystalType);

  // Use provided color or get from config
  const gradientClass = colorClass || (
    crystalType === 'normal'
      ? getRandomNormalColor()
      : config.colors[0]
  );

  const handleCollect = () => {
    if (collected) return;
    setCollected(true);
    onCollect(id, crystalType);
  };

  // Determine if this is a special crystal
  const isDanger = config.special === 'danger';
  const isPowerup = config.special === 'powerup';
  const isSpecial = crystalType !== 'normal';

  return (
    <motion.div
      data-crystal-id={id}
      data-letter={letter}
      data-type={crystalType}
      className="absolute z-10"
      style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
      initial={{ y: -100 }}
      animate={collected ? {
        scale: [1, 1.8, 0],
        opacity: [1, 1, 0],
        y: 0,
      } : {
        y: 'calc(100vh + 100px)',
      }}
      transition={collected ? {
        duration: 0.5,
        ease: 'easeOut',
      } : {
        duration: duration,
        ease: 'linear',
      }}
      onAnimationComplete={() => {
        if (!collected) {
          onMiss(id, crystalType);
        }
      }}
    >
      {/* Crystal container with animations */}
      <motion.div
        className="relative"
        animate={isSpecial ? {
          scale: [1, 1.1, 1],
          rotate: crystalType === 'rainbow' ? [0, 5, -5, 0] : 0,
        } : {}}
        transition={{
          duration: crystalType === 'rainbow' ? 0.5 : 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {/* Main crystal hexagon */}
        <div
          className={`
            w-16 h-20 flex items-center justify-center relative
            bg-gradient-to-br ${gradientClass}
            shadow-lg
            ${isDanger ? 'animate-pulse' : ''}
            ${isPowerup ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
          `}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: `0 0 20px ${config.glowColor}40, 0 0 40px ${config.glowColor}20`,
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

          {/* Bomb tick animation */}
          {crystalType === 'bomb' && (
            <motion.div
              className="absolute inset-0 bg-red-500/50"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
              animate={{
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
          )}

          {/* Letter or Icon */}
          <div className="relative z-10 flex flex-col items-center">
            {config.icon && (
              <span className="text-lg leading-none mb-0.5">{config.icon}</span>
            )}
            <span
              className={`
                font-mono text-xl font-bold
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

        {/* Outer glow effect */}
        <div
          className={`
            absolute inset-0 -z-10 blur-md
            bg-gradient-to-br ${gradientClass}
          `}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            transform: 'scale(1.3)',
            opacity: isSpecial ? 0.7 : 0.4,
          }}
        />

        {/* Sparkle effect for special crystals */}
        {(crystalType === 'gold' || crystalType === 'rainbow' || isPowerup) && !collected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Sparkles color={config.glowColor} count={4} />
          </div>
        )}

        {/* Collection explosion effect */}
        {collected && (
          <>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
                }}
              />
            </motion.div>
            <Sparkles color={config.glowColor} count={12} />
          </>
        )}

        {/* Ice crystal snowflakes */}
        {crystalType === 'ice' && !collected && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs text-white/60"
                style={{
                  left: `${20 + i * 30}%`,
                  top: '-10px',
                }}
                animate={{
                  y: [0, 30],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                ❄
              </motion.span>
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
