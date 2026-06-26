'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GAME_CONFIG, COMBO_TIERS } from '@/lib/stores/gameStore';
import { useEffect, useState } from 'react';

interface GameHUDProps {
  lessonId: string;
}

export function GameHUD({ lessonId }: GameHUDProps) {
  const {
    energy,
    score,
    combo,
    feverMeter,
    isFeverMode,
    feverTimeLeft,
    highScores,
    totalGems,
    getCurrentComboTier,
    getScoreMultiplier,
  } = useGameStore();

  const [showComboPopup, setShowComboPopup] = useState<string | null>(null);
  const [prevComboTier, setPrevComboTier] = useState(0);

  const comboTier = getCurrentComboTier();
  const multiplier = getScoreMultiplier();
  const highScore = highScores[lessonId] || 0;

  // Detect combo tier changes for popup
  useEffect(() => {
    const currentTierIndex = COMBO_TIERS.findIndex(t => t.threshold === comboTier.threshold);
    if (currentTierIndex > prevComboTier && comboTier.name) {
      setShowComboPopup(comboTier.name);
      setTimeout(() => setShowComboPopup(null), 1500);
    }
    setPrevComboTier(currentTierIndex);
  }, [comboTier, prevComboTier]);

  // Energy bar color based on level
  const getEnergyColor = () => {
    if (energy > 60) return 'from-green-400 to-emerald-500';
    if (energy > 30) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  // Energy bar glow
  const getEnergyGlow = () => {
    if (energy > 60) return 'shadow-green-500/50';
    if (energy > 30) return 'shadow-yellow-500/50';
    return 'shadow-red-500/50';
  };

  return (
    <>
      {/* Top bar container */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-cyan-300/20 bg-black/30 p-3 backdrop-blur-md"
          style={{ boxShadow: 'inset 0 0 24px rgba(6,182,212,0.08), 0 12px 40px rgba(0,0,0,0.22)' }}>
          {/* Left side: Energy + Fever */}
          <div className="flex-1 max-w-md space-y-2">
            {/* Energy bar */}
            <div className="relative">
              <div className="text-xs text-cyan-300 font-black mb-1 tracking-[0.22em]"
                style={{ textShadow: '0 0 10px currentColor' }}>
                ENERGIE
              </div>
              <div className={`h-4 bg-black/50 rounded-full overflow-hidden border border-white/20 shadow-lg ${getEnergyGlow()}`}>
                <motion.div
                  className={`h-full bg-gradient-to-r ${getEnergyColor()} rounded-full`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${energy}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
                {/* Animated shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </div>
            </div>

            {/* Fever bar */}
            <div className="relative">
              <div className="text-xs font-black mb-1 tracking-[0.22em] flex items-center gap-2"
                style={{
                  color: isFeverMode ? '#f472b6' : '#a855f7',
                  textShadow: '0 0 10px currentColor'
                }}>
                {isFeverMode ? (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    TURBO!
                  </motion.span>
                ) : 'TURBO'}
                {isFeverMode && (
                  <span className="text-white/80">
                    {Math.ceil(feverTimeLeft / 1000)}s
                  </span>
                )}
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/20">
                <motion.div
                  className={`h-full rounded-full ${
                    isFeverMode
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%]'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: isFeverMode ? '100%' : `${feverMeter}%`,
                    backgroundPosition: isFeverMode ? ['0% 0%', '100% 0%'] : '0% 0%',
                  }}
                  transition={isFeverMode ? {
                    backgroundPosition: { duration: 1, repeat: Infinity, ease: 'linear' },
                    width: { type: 'spring', stiffness: 100 }
                  } : {
                    type: 'spring', stiffness: 100
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right side: Gems + Score + Combo */}
          <div className="text-right">
            {/* Gems display */}
            <div className="flex items-center justify-end gap-1 mb-2">
              <span
                className="w-4 h-4 rounded-full border border-amber-200 bg-gradient-to-br from-yellow-300 to-amber-500"
                style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}
              />
              <span
                className="font-mono font-black text-amber-200"
                style={{ textShadow: '0 0 10px currentColor' }}
              >
                {totalGems.toLocaleString()}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-100/60">munten</span>
            </div>

            {/* Score display - LED style */}
            <div className="bg-black/75 rounded-xl px-4 py-2 border border-cyan-300/35"
              style={{ boxShadow: '0 0 24px rgba(6, 182, 212, 0.32), inset 0 0 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              <div className="text-xs text-cyan-400/70 tracking-widest mb-1">SCORE</div>
              <motion.div
                className="font-mono text-3xl font-bold text-cyan-300"
                style={{ textShadow: '0 0 20px currentColor, 0 0 40px currentColor' }}
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {score.toLocaleString()}
              </motion.div>
              {highScore > 0 && (
                <div className="text-xs text-purple-400/70 mt-1">
                  BEST: {highScore.toLocaleString()}
                </div>
              )}
            </div>

            {/* Combo & Multiplier */}
            {combo > 0 && (
              <motion.div
                className="mt-2 bg-black/70 rounded-lg px-3 py-1 border border-purple-500/30 inline-block"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 text-sm">COMBO</span>
                  <motion.span
                    className="font-mono text-xl font-bold text-yellow-300"
                    style={{ textShadow: '0 0 10px currentColor' }}
                    key={combo}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                  >
                    {combo}
                  </motion.span>
                  <span
                    className="text-pink-400 font-bold"
                    style={{ textShadow: '0 0 10px currentColor' }}
                  >
                    x{multiplier}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Combo tier popup (center screen) */}
      <AnimatePresence>
        {showComboPopup && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl md:text-8xl font-black"
              style={{
                color: comboTier.multiplier >= 5 ? '#fbbf24' : comboTier.multiplier >= 4 ? '#f472b6' : '#a855f7',
                textShadow: `0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor`,
                WebkitTextStroke: '2px rgba(255,255,255,0.3)',
              }}
              initial={{ scale: 0, rotate: -10, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {showComboPopup}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low energy warning */}
      <AnimatePresence>
        {energy <= 20 && energy > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 border-8 border-red-500/50 rounded-lg"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                borderColor: ['rgba(239,68,68,0.3)', 'rgba(239,68,68,0.7)', 'rgba(239,68,68,0.3)'],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
