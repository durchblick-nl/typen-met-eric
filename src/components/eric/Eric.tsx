'use client';

import { motion } from 'framer-motion';

type EricMood = 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'worried';

interface EricProps {
  mood?: EricMood;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const MOOD_EMOJIS: Record<EricMood, string> = {
  happy: '😊',
  encouraging: '💪',
  thinking: '🤔',
  celebrating: '🎉',
  worried: '😟',
};

export function Eric({ mood = 'happy', message, size = 'medium' }: EricProps) {
  const sizeClasses = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-8xl',
  };

  return (
    <div className="flex items-end gap-4">
      {/* Eric the Dragon */}
      <motion.div
        className={`${sizeClasses[size]} select-none`}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🐉
      </motion.div>

      {/* Speech bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="relative bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-lg max-w-xs"
        >
          {/* Mood indicator */}
          <span className="absolute -top-2 -right-2 text-lg">
            {MOOD_EMOJIS[mood]}
          </span>

          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>

          {/* Speech bubble tail */}
          <div className="absolute bottom-0 -left-2 w-4 h-4 bg-white transform rotate-45" />
        </motion.div>
      )}
    </div>
  );
}
