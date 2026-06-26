'use client';

import { motion } from 'framer-motion';
import { getAchievement } from '@/lib/data/achievements';
import { useEffect } from 'react';

interface AchievementPopupProps {
  achievementId: string;
  onClose: () => void;
}

export function AchievementPopup({ achievementId, onClose }: AchievementPopupProps) {
  const achievement = getAchievement(achievementId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-yellow-900/95 to-amber-900/95 rounded-2xl p-6 shadow-2xl border-2 border-yellow-500/50 pointer-events-auto max-w-sm mx-4"
        style={{
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.4)',
        }}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClose}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-yellow-400 text-sm font-bold tracking-widest mb-1">
            ACHIEVEMENT ONTGRENDELD!
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          className="text-6xl text-center mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {achievement.icon}
        </motion.div>

        {/* Name */}
        <motion.h3
          className="text-2xl font-black text-yellow-300 text-center mb-2"
          style={{ textShadow: '0 0 20px currentColor' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {achievement.name}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-yellow-100/80 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {achievement.description}
        </motion.p>

        {/* Reward */}
        <motion.div
          className="flex items-center justify-center gap-2 bg-black/30 rounded-lg py-2 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-yellow-400 font-bold">+{achievement.coinReward}</span>
          <span className="text-2xl">🪙</span>
        </motion.div>

        {/* Tap to close hint */}
        <motion.p
          className="text-yellow-500/50 text-xs text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Druk op Enter om verder te gaan
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
