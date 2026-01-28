'use client';

import { motion } from 'framer-motion';

interface ScorePopupProps {
  score: number;
  x: number;
  y: number;
  color?: string;
  isSpecial?: boolean;
}

export function ScorePopup({ score, x, y, color = '#67e8f9', isSpecial = false }: ScorePopupProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-30 font-mono font-black"
      style={{
        left: `${x}%`,
        top: y,
        transform: 'translateX(-50%)',
        color: color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 2px 2px 0 rgba(0,0,0,0.5)`,
        fontSize: isSpecial ? '2rem' : '1.5rem',
      }}
      initial={{
        opacity: 1,
        y: 0,
        scale: isSpecial ? 1.5 : 1.2,
      }}
      animate={{
        opacity: 0,
        y: -80,
        scale: isSpecial ? 2 : 1,
      }}
      transition={{
        duration: 1,
        ease: 'easeOut',
      }}
    >
      +{score.toLocaleString()}
    </motion.div>
  );
}
