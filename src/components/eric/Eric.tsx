'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles } from '@/components/ui/Sparkles';

type EricMood = 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'worried';

interface EricProps {
  mood?: EricMood;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const MOOD_IMAGES: Record<EricMood, string> = {
  happy: '/images/eric/eric-happy.png',
  encouraging: '/images/eric/eric-encouraging.png',
  thinking: '/images/eric/eric-thinking.png',
  celebrating: '/images/eric/eric-celebrating.png',
  worried: '/images/eric/eric-worried.png',
};

const MOOD_EMOJIS: Record<EricMood, string> = {
  happy: '😊',
  encouraging: '💪',
  thinking: '🤔',
  celebrating: '🎉',
  worried: '😟',
};

export function Eric({ mood = 'happy', message, size = 'medium' }: EricProps) {
  const sizes = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 180, height: 180 },
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-end gap-4">
      {/* Eric the Dragon */}
      <motion.div
        className="relative select-none"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Magical Sparkles for positive moods */}
        {(mood === 'happy' || mood === 'celebrating' || mood === 'encouraging' || mood === 'thinking') && (
          <div className="absolute inset-0 -z-10 scale-150">
            <Sparkles
              color={mood === 'celebrating' ? '#FFD700' : '#A8D5A2'}
              count={mood === 'celebrating' ? 8 : 3}
              overflow
            />
          </div>
        )}

        <Image
          src={MOOD_IMAGES[mood]}
          alt={`Eric de draak - ${mood}`}
          width={currentSize.width}
          height={currentSize.height}
          priority
        />
      </motion.div>

      {/* Speech bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="relative bg-white rounded-2xl rounded-bl-none px-5 py-4 shadow-lg max-w-sm"
        >
          {/* Mood indicator */}
          <span className="absolute -top-3 -right-3 text-2xl">
            {MOOD_EMOJIS[mood]}
          </span>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium">{message}</p>

          {/* Speech bubble tail */}
          <div className="absolute bottom-0 -left-2 w-4 h-4 bg-white transform rotate-45" />
        </motion.div>
      )}
    </div>
  );
}
