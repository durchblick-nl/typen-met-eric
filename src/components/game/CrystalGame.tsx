'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crystal } from './Crystal';
import { Eric } from '@/components/eric/Eric';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { Sparkles } from '@/components/ui/Sparkles';
import { ArcadeBackground } from './ArcadeBackground';
import { GameHUD } from './GameHUD';
import { useGameStore, GAME_CONFIG } from '@/lib/stores/gameStore';

interface CrystalData {
  id: string;
  letter: string;
  x: number;
  duration: number;
  colorIndex: number;
}

interface CrystalGameProps {
  lessonId: string;
  availableLetters: string[];
  onComplete: () => void;
}

export function CrystalGame({
  lessonId,
  availableLetters,
  onComplete,
}: CrystalGameProps) {
  const [crystals, setCrystals] = useState<CrystalData[]>([]);
  const [ericMood, setEricMood] = useState<'happy' | 'encouraging' | 'celebrating' | 'worried'>('happy');
  const [ericMessage, setEricMessage] = useState('Vang de kristallen!');
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'complete'>('playing');
  const [gameResult, setGameResult] = useState<{ newHighScore: boolean; gemsEarned: number; stars: number } | null>(null);

  const crystalIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    energy,
    score,
    combo,
    isFeverMode,
    feverMeter,
    resetGame,
    hitCrystal,
    missedCrystal,
    wrongKey,
    activateFever,
    tickFever,
    endGame,
    getCurrentComboTier,
  } = useGameStore();

  // Calculate intensity for visual effects (0-1)
  const intensity = Math.min(1, (combo / 30) + (isFeverMode ? 0.5 : 0));

  // Calculate difficulty based on progress
  const getMaxCrystals = useCallback(() => {
    if (score >= 20000) return 4;
    if (score >= 10000) return 3;
    if (score >= 5000) return 2;
    return 1;
  }, [score]);

  const getSpawnInterval = useCallback(() => {
    const base = isFeverMode ? 800 : 1500;
    const reduction = Math.min(500, Math.floor(score / 5000) * 100);
    return base - reduction;
  }, [score, isFeverMode]);

  const getFallDuration = useCallback(() => {
    if (isFeverMode) return 3;
    if (score >= 20000) return 4;
    if (score >= 10000) return 5;
    return 6;
  }, [score, isFeverMode]);

  // Reset game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Check for fever activation
  useEffect(() => {
    if (feverMeter >= 100 && !isFeverMode && gameState === 'playing') {
      activateFever();
      setEricMood('celebrating');
      setEricMessage('FIEBER MODUS!');
    }
  }, [feverMeter, isFeverMode, activateFever, gameState]);

  // Fever timer
  useEffect(() => {
    if (isFeverMode && gameState === 'playing') {
      feverIntervalRef.current = setInterval(() => {
        tickFever(100);
      }, 100);

      return () => {
        if (feverIntervalRef.current) {
          clearInterval(feverIntervalRef.current);
        }
      };
    }
  }, [isFeverMode, tickFever, gameState]);

  // Check for game over (energy depleted)
  useEffect(() => {
    if (energy <= 0 && gameState === 'playing') {
      setGameState('gameover');
      const result = endGame(lessonId);
      setGameResult(result);
      setEricMood('worried');
      setEricMessage('Keine Energie mehr...');

      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    }
  }, [energy, gameState, endGame, lessonId]);

  // Check for 3-star completion
  useEffect(() => {
    if (score >= GAME_CONFIG.star3Threshold && gameState === 'playing') {
      setGameState('complete');
      const result = endGame(lessonId);
      setGameResult(result);
      setEricMood('celebrating');
      setEricMessage('FANTASTISCH! 3 Sterne!');

      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }

      setTimeout(onComplete, 3000);
    }
  }, [score, gameState, endGame, lessonId, onComplete]);

  // Spawn a new crystal
  const spawnCrystal = useCallback(() => {
    if (gameState !== 'playing') return;

    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    const x = 10 + Math.random() * 80;
    const id = `crystal-${crystalIdRef.current++}`;
    const colorIndex = Math.floor(Math.random() * 7);
    const duration = getFallDuration();

    const newCrystal: CrystalData = { id, letter, x, duration, colorIndex };

    setCrystals(prev => {
      if (prev.length >= getMaxCrystals()) return prev;
      return [...prev, newCrystal];
    });
  }, [availableLetters, gameState, getMaxCrystals, getFallDuration]);

  // Handle crystal collection
  const handleCollect = useCallback((id: string) => {
    setCrystals(prev => prev.filter(c => c.id !== id));
    hitCrystal();

    // Update Eric's mood based on combo
    const comboTier = getCurrentComboTier();
    if (comboTier.multiplier >= 5) {
      setEricMood('celebrating');
      setEricMessage('MEGA! Unglaublich!');
    } else if (comboTier.multiplier >= 3) {
      setEricMood('celebrating');
      const messages = ['Super!', 'Fantastisch!', 'Weiter so!'];
      setEricMessage(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      setEricMood('encouraging');
      const messages = ['Mooi!', 'Ja!', 'Top!', 'Yes!'];
      setEricMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [hitCrystal, getCurrentComboTier]);

  // Handle missed crystal
  const handleMiss = useCallback((id: string) => {
    setCrystals(prev => prev.filter(c => c.id !== id));
    missedCrystal();
    setEricMood('worried');
    setEricMessage('Oje, verpasst!');
    setTimeout(() => {
      if (gameState === 'playing') {
        setEricMood('encouraging');
      }
    }, 1000);
  }, [missedCrystal, gameState]);

  // Handle wrong key press
  const handleWrongKey = useCallback(() => {
    wrongKey();
    setEricMood('worried');
    setEricMessage('Falsche Taste!');
    setTimeout(() => {
      if (gameState === 'playing') {
        setEricMood('encouraging');
      }
    }, 800);
  }, [wrongKey, gameState]);

  // Keyboard handler
  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    const lowerKey = key.toLowerCase();

    // Check if key matches any crystal
    const matchingCrystal = crystals.find(c => c.letter.toLowerCase() === lowerKey);

    if (matchingCrystal) {
      handleCollect(matchingCrystal.id);
    } else if (availableLetters.map(l => l.toLowerCase()).includes(lowerKey)) {
      // Wrong key but valid letter - penalize
      handleWrongKey();
    }
  }, [gameState, crystals, availableLetters, handleCollect, handleWrongKey]);

  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: gameState === 'playing',
    allowedKeys: availableLetters.map(l => l.toLowerCase()),
  });

  // Spawn crystals periodically
  useEffect(() => {
    if (gameState !== 'playing') {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
      return;
    }

    // Initial spawn
    spawnCrystal();

    spawnIntervalRef.current = setInterval(() => {
      spawnCrystal();
    }, getSpawnInterval());

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [spawnCrystal, getSpawnInterval, gameState]);

  // Restart game
  const handleRestart = () => {
    resetGame();
    setCrystals([]);
    setGameState('playing');
    setGameResult(null);
    setEricMood('happy');
    setEricMessage('Vang de kristallen!');
    crystalIdRef.current = 0;
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Arcade Background with Parallax */}
      <ArcadeBackground isFeverMode={isFeverMode} intensity={intensity} />

      {/* Game HUD */}
      <GameHUD lessonId={lessonId} />

      {/* Crystals */}
      <AnimatePresence>
        {crystals.map(crystal => (
          <Crystal
            key={crystal.id}
            {...crystal}
            onCollect={handleCollect}
            onMiss={handleMiss}
          />
        ))}
      </AnimatePresence>

      {/* Eric */}
      <motion.div
        className="absolute bottom-4 left-4 z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Eric
          mood={ericMood}
          message={ericMessage}
          size="medium"
        />
      </motion.div>

      {/* Screen shake on high combo */}
      {combo >= 20 && gameState === 'playing' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, -2, 2, -1, 1, 0],
            y: [0, 1, -1, 2, -2, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        />
      )}

      {/* Game Over / Complete overlay */}
      <AnimatePresence>
        {(gameState === 'gameover' || gameState === 'complete') && gameResult && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-indigo-900/95 to-purple-900/95 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4 border border-purple-500/30"
              style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {/* Title */}
              <motion.h2
                className={`text-4xl font-black mb-4 ${
                  gameState === 'complete' ? 'text-yellow-300' : 'text-purple-300'
                }`}
                style={{ textShadow: '0 0 30px currentColor' }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {gameState === 'complete' ? 'GEWELDIG!' : 'GAME OVER'}
              </motion.h2>

              {/* Score */}
              <motion.div
                className="mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <div className="text-cyan-400/70 text-sm tracking-widest">SCORE</div>
                <div
                  className="font-mono text-5xl font-bold text-cyan-300"
                  style={{ textShadow: '0 0 20px currentColor' }}
                >
                  {score.toLocaleString()}
                </div>
                {gameResult.newHighScore && (
                  <motion.div
                    className="text-yellow-400 text-sm mt-1 font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    NEUER REKORD!
                  </motion.div>
                )}
              </motion.div>

              {/* Stars */}
              <motion.div
                className="flex justify-center gap-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[1, 2, 3].map((star) => (
                  <motion.span
                    key={star}
                    className={`text-4xl ${star <= gameResult.stars ? '' : 'opacity-30 grayscale'}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + star * 0.1 }}
                  >
                    {star <= gameResult.stars ? '⭐' : '☆'}
                  </motion.span>
                ))}
              </motion.div>

              {/* Gems earned */}
              <motion.div
                className="text-purple-300 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-2xl">+{gameResult.gemsEarned}</span>
                <span className="text-lg ml-1">💎</span>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="flex gap-3 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/30"
                >
                  Nochmal spielen
                </button>
                {gameState === 'complete' && (
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/30"
                  >
                    Weiter
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles overlay for complete */}
      {gameState === 'complete' && (
        <div className="absolute inset-0 pointer-events-none z-40">
          <Sparkles color="#FFD700" count={20} />
        </div>
      )}
    </div>
  );
}
