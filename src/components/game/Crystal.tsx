'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles } from '@/components/ui/Sparkles';

// Crystal colors matching Lettoria regions
const CRYSTAL_COLORS = [
  'from-yellow-300 to-amber-500',      // Gold (Grot)
  'from-amber-200 to-orange-300',      // Warm (Dorp)
  'from-yellow-200 to-yellow-400',     // Gelb (Velden)
  'from-emerald-400 to-green-600',     // Groen (Woud)
  'from-cyan-300 to-teal-400',         // Cyan (Toppen)
  'from-blue-400 to-blue-600',         // Blauw (Zee)
  'from-purple-400 to-violet-600',     // Paars (Kasteel)
];

interface CrystalProps {
  id: string;
  letter: string;
  x: number;              // 0-100% horizontal position
  duration: number;       // Fall duration in seconds
  onCollect: (id: string) => void;
  onMiss: (id: string) => void;
  colorIndex?: number;
}

export function Crystal({
  id,
  letter,
  x,
  duration,
  onCollect,
  onMiss,
  colorIndex = 0
}: CrystalProps) {
  const [collected, setCollected] = useState(false);
  const color = CRYSTAL_COLORS[colorIndex % CRYSTAL_COLORS.length];

  const handleCollect = () => {
    if (collected) return;
    setCollected(true);
    onCollect(id);
  };

  // Expose collect method via data attribute for parent to call
  if (typeof window !== 'undefined') {
    const element = document.querySelector(`[data-crystal-id="${id}"]`);
    if (element) {
      (element as HTMLElement).dataset.collect = handleCollect.toString();
    }
  }

  return (
    <motion.div
      data-crystal-id={id}
      data-letter={letter}
      className="absolute z-10"
      style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
      initial={{ y: -80 }}
      animate={collected ? {
        scale: [1, 1.5, 0],
        opacity: [1, 1, 0],
        y: 0
      } : {
        y: 'calc(100vh + 80px)'
      }}
      transition={collected ? {
        duration: 0.4,
        ease: 'easeOut'
      } : {
        duration: duration,
        ease: 'linear'
      }}
      onAnimationComplete={() => {
        if (!collected) {
          onMiss(id);
        }
      }}
    >
      {/* Crystal hexagon shape */}
      <div className="relative">
        <div
          className={`
            w-16 h-20 flex items-center justify-center
            bg-gradient-to-br ${color}
            shadow-lg shadow-current/30
            transition-transform hover:scale-110
          `}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-2 bg-white/40"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          />

          {/* Letter - dark color with white outline for readability */}
          <span
            className="relative z-10 font-mono text-2xl font-bold text-gray-900"
            style={{
              textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {letter}
          </span>
        </div>

        {/* Sparkle effect when collected */}
        {collected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles color="#FFD700" count={8} />
          </div>
        )}

        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 -z-10 blur-md opacity-50
            bg-gradient-to-br ${color}
          `}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            transform: 'scale(1.2)',
          }}
        />
      </div>
    </motion.div>
  );
}
