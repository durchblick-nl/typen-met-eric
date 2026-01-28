'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crystal } from './Crystal';
import { Eric } from '@/components/eric/Eric';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { Sparkles } from '@/components/ui/Sparkles';
import { ArcadeBackground } from './ArcadeBackground';
import { GameHUD } from './GameHUD';
import { ScorePopup } from './ScorePopup';
import { useGameStore, GAME_CONFIG } from '@/lib/stores/gameStore';
import { CrystalType, getRandomCrystalType, getCrystalConfig, getRandomNormalColor } from '@/lib/data/crystalTypes';

interface ScorePopupData {
  id: string;
  score: number;
  x: number;
  y: number;
  color: string;
  isSpecial: boolean;
}

interface CrystalData {
  id: string;
  letter: string;
  x: number;
  duration: number;
  crystalType: CrystalType;
  colorClass?: string;
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
  const [frozenUntil, setFrozenUntil] = useState(0); // Ice crystal freeze effect
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null); // Flash color
  const [isInitialized, setIsInitialized] = useState(false); // Prevent premature win check

  const crystalIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    energy,
    score,
    combo,
    isFeverMode,
    feverMeter,
    isSlowMo,
    hasShield,
    activePowerUp,
    resetGame,
    hitCrystal,
    missedCrystal,
    wrongKey,
    hitBomb,
    activateFever,
    tickFever,
    activatePowerUp,
    tickPowerUp,
    endGame,
    getCurrentComboTier,
  } = useGameStore();

  // Check if player is frozen (ice crystal effect)
  const isFrozen = Date.now() < frozenUntil;

  // Calculate intensity for visual effects (0-1)
  const intensity = Math.min(1, (combo / 30) + (isFeverMode ? 0.5 : 0));

  // Calculate difficulty based on progress
  const getMaxCrystals = useCallback(() => {
    if (score >= 20000) return 5;
    if (score >= 10000) return 4;
    if (score >= 5000) return 3;
    return 2;
  }, [score]);

  const getSpawnInterval = useCallback(() => {
    let base = isFeverMode ? 800 : 1500;
    const reduction = Math.min(500, Math.floor(score / 5000) * 100);
    base = base - reduction;
    // Slow-mo power-up increases interval
    if (isSlowMo) base *= 1.5;
    return Math.max(500, base);
  }, [score, isFeverMode, isSlowMo]);

  const getFallDuration = useCallback(() => {
    let duration = 6;
    if (isFeverMode) duration = 4;
    else if (score >= 20000) duration = 4;
    else if (score >= 10000) duration = 5;
    // Slow-mo power-up increases fall duration
    if (isSlowMo) duration *= 1.5;
    // Frozen state slows everything
    if (isFrozen) duration *= 2;
    return duration;
  }, [score, isFeverMode, isSlowMo, isFrozen]);

  // Show score popup
  const showScorePopup = useCallback((x: number, earnedScore: number, color: string, isSpecial: boolean) => {
    const popupId = `popup-${Date.now()}-${Math.random()}`;
    setScorePopups(prev => [...prev, {
      id: popupId,
      score: earnedScore,
      x,
      y: 200,
      color,
      isSpecial,
    }]);
    // Remove popup after animation
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popupId));
    }, 1000);
  }, []);

  // Show screen flash
  const showScreenFlash = useCallback((color: string) => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash(null), 150);
  }, []);

  // Reset game on mount
  useEffect(() => {
    resetGame();
    // Small delay to ensure state is reset before enabling win checks
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
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

  // Power-up timer
  useEffect(() => {
    if (isSlowMo && gameState === 'playing') {
      powerUpIntervalRef.current = setInterval(() => {
        tickPowerUp(100);
      }, 100);

      return () => {
        if (powerUpIntervalRef.current) {
          clearInterval(powerUpIntervalRef.current);
        }
      };
    }
  }, [isSlowMo, tickPowerUp, gameState]);

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

  // Check for 3-star completion (only after game is initialized)
  useEffect(() => {
    if (!isInitialized) return; // Don't check until game is properly reset

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
  }, [score, gameState, endGame, lessonId, onComplete, isInitialized]);

  // Spawn a new crystal
  const spawnCrystal = useCallback(() => {
    if (gameState !== 'playing') return;

    const crystalType = getRandomCrystalType();
    const config = getCrystalConfig(crystalType);

    // For bombs, use a different (wrong) letter
    let letter: string;
    if (crystalType === 'bomb') {
      // Pick a random letter NOT in availableLetters
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const unusedLetters = allLetters.filter(l => !availableLetters.map(a => a.toLowerCase()).includes(l));
      letter = unusedLetters.length > 0
        ? unusedLetters[Math.floor(Math.random() * unusedLetters.length)]
        : availableLetters[Math.floor(Math.random() * availableLetters.length)];
    } else {
      letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    }

    const x = 10 + Math.random() * 80;
    const id = `crystal-${crystalIdRef.current++}`;
    const duration = getFallDuration();
    const colorClass = crystalType === 'normal' ? getRandomNormalColor() : undefined;

    const newCrystal: CrystalData = { id, letter, x, duration, crystalType, colorClass };

    setCrystals(prev => {
      if (prev.length >= getMaxCrystals()) return prev;
      return [...prev, newCrystal];
    });
  }, [availableLetters, gameState, getMaxCrystals, getFallDuration]);

  // Handle crystal collection
  const handleCollect = useCallback((id: string, type: CrystalType) => {
    // Get crystal position before removing
    const crystal = crystals.find(c => c.id === id);
    const crystalX = crystal?.x || 50;

    setCrystals(prev => prev.filter(c => c.id !== id));

    const config = getCrystalConfig(type);

    // Handle bombs (player shouldn't collect these!)
    if (type === 'bomb') {
      hitBomb();
      showScreenFlash('#ef4444'); // Red flash
      setEricMood('worried');
      setEricMessage('BOOM! Nicht die Bombe!');
      setTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
      }, 1500);
      return;
    }

    // Handle power-ups
    if (type === 'shield' || type === 'slowmo' || type === 'magnet') {
      activatePowerUp(type);
      showScreenFlash(config.glowColor); // Power-up color flash

      if (type === 'magnet') {
        // Collect ALL crystals on screen (except bombs)
        const crystalsToCollect = crystals.filter(c => c.crystalType !== 'bomb' && c.id !== id);

        // Remove collected crystals from state
        setCrystals(prev => prev.filter(c => c.crystalType === 'bomb'));

        // Score each collected crystal (delayed to avoid setState during render)
        setTimeout(() => {
          let totalScore = 0;
          crystalsToCollect.forEach(c => {
            const cfg = getCrystalConfig(c.crystalType);
            const multiplier = getCurrentComboTier().multiplier * (isFeverMode ? 2 : 1);
            totalScore += Math.round(GAME_CONFIG.baseScore * cfg.scoreMultiplier * multiplier);
            hitCrystal(cfg.scoreMultiplier, cfg.feverBonus);
          });
          if (totalScore > 0) {
            showScorePopup(50, totalScore, '#ec4899', true);
          }
        }, 0);

        setEricMessage('MAGNET! Alles eingesammelt!');
      } else if (type === 'shield') {
        setEricMessage('Schild aktiviert!');
      } else if (type === 'slowmo') {
        setEricMessage('Zeitlupe!');
      }

      setEricMood('celebrating');
      setTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
      }, 1500);
      return;
    }

    // Calculate score for popup
    const multiplier = getCurrentComboTier().multiplier * (isFeverMode ? 2 : 1);
    const earnedScore = Math.round(GAME_CONFIG.baseScore * config.scoreMultiplier * multiplier);

    // Show score popup
    const isSpecial = type === 'gold' || type === 'rainbow';
    showScorePopup(crystalX, earnedScore, config.glowColor, isSpecial);

    // Screen flash for special crystals
    if (isSpecial) {
      showScreenFlash(config.glowColor);
    }

    // Normal crystal collection
    hitCrystal(config.scoreMultiplier, config.feverBonus);

    // Special messages for special crystals
    if (type === 'gold') {
      setEricMood('celebrating');
      setEricMessage('GOLD! Doppelte Punkte!');
    } else if (type === 'rainbow') {
      setEricMood('celebrating');
      setEricMessage('REGENBOGEN! Fieber-Boost!');
    } else {
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
    }
  }, [hitCrystal, hitBomb, activatePowerUp, getCurrentComboTier, gameState]);

  // Handle missed crystal
  const handleMiss = useCallback((id: string, type: CrystalType) => {
    setCrystals(prev => prev.filter(c => c.id !== id));

    // Bombs are good to miss!
    if (type === 'bomb') {
      return; // No penalty for missing bombs
    }

    // Ice crystal freeze effect
    if (type === 'ice') {
      setFrozenUntil(Date.now() + 3000); // Freeze for 3 seconds
      setEricMood('worried');
      setEricMessage('Eingefroren!');
      setTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
        setEricMessage('Wieder aufgetaut!');
      }, 3000);
      return;
    }

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
    setEricMessage(hasShield ? 'Schild hat geschützt!' : 'Falsche Taste!');
    setTimeout(() => {
      if (gameState === 'playing') {
        setEricMood('encouraging');
      }
    }, 800);
  }, [wrongKey, gameState, hasShield]);

  // Keyboard handler
  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;
    if (isFrozen) return; // Can't type while frozen

    const lowerKey = key.toLowerCase();

    // Check if key matches any crystal
    const matchingCrystal = crystals.find(c => c.letter.toLowerCase() === lowerKey);

    if (matchingCrystal) {
      handleCollect(matchingCrystal.id, matchingCrystal.crystalType);
    } else {
      // Check if it's a valid letter we're watching
      if (availableLetters.map(l => l.toLowerCase()).includes(lowerKey)) {
        handleWrongKey();
      }
    }
  }, [gameState, crystals, availableLetters, handleCollect, handleWrongKey, isFrozen]);

  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: gameState === 'playing',
    allowedKeys: [...availableLetters.map(l => l.toLowerCase()), ...crystals.map(c => c.letter.toLowerCase())],
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
    setIsInitialized(false); // Prevent premature win check
    resetGame();
    setCrystals([]);
    setScorePopups([]);
    setGameState('playing');
    setGameResult(null);
    setEricMood('happy');
    setEricMessage('Vang de kristallen!');
    setFrozenUntil(0);
    crystalIdRef.current = 0;
    // Re-enable win checks after reset
    setTimeout(() => setIsInitialized(true), 100);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Arcade Background with Parallax */}
      <ArcadeBackground isFeverMode={isFeverMode} intensity={intensity} />

      {/* Screen flash effect */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            style={{ backgroundColor: screenFlash }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Score popups */}
      <AnimatePresence>
        {scorePopups.map(popup => (
          <ScorePopup
            key={popup.id}
            score={popup.score}
            x={popup.x}
            y={popup.y}
            color={popup.color}
            isSpecial={popup.isSpecial}
          />
        ))}
      </AnimatePresence>

      {/* Frozen overlay */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div
            className="absolute inset-0 z-25 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'radial-gradient(circle, rgba(125,211,252,0.3) 0%, rgba(125,211,252,0.5) 100%)',
            }}
          >
            {/* Floating snowflakes */}
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl text-white/70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                ❄️
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game HUD */}
      <GameHUD lessonId={lessonId} />

      {/* Active power-up indicator */}
      <AnimatePresence>
        {activePowerUp && activePowerUp !== 'magnet' && (
          <motion.div
            className="absolute top-24 left-4 z-20 bg-black/70 rounded-lg px-4 py-2 border border-purple-500/50"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {activePowerUp === 'shield' ? '🛡️' : '⏱️'}
              </span>
              <span className="text-white font-bold">
                {activePowerUp === 'shield' ? 'Schild aktiv' : 'Zeitlupe'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
