'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crystal } from './Crystal';
import { Eric } from '@/components/eric/Eric';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { Sparkles } from '@/components/ui/Sparkles';
import { ArcadeBackground } from './ArcadeBackground';
import { GameHUD } from './GameHUD';
import { ScorePopup } from './ScorePopup';
import { AchievementPopup } from './AchievementPopup';
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
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'gameover' | 'complete'>('intro');
  const [gameResult, setGameResult] = useState<{ newHighScore: boolean; gemsEarned: number; stars: number } | null>(null);
  const [frozenUntil, setFrozenUntil] = useState(0); // Ice crystal freeze effect
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null); // Flash color
  const [isInitialized, setIsInitialized] = useState(false); // Prevent premature win check

  const crystalIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevComboTierRef = useRef(0);
  const wasFeverModeRef = useRef(false);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const {
    energy,
    score,
    combo,
    isFeverMode,
    feverMeter,
    isSlowMo,
    hasShield,
    activePowerUp,
    achievementQueue,
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
    popAchievementQueue,
  } = useGameStore();

  // Sound effects
  const {
    soundEnabled,
    musicEnabled,
    startMusic,
    stopMusic,
    toggleSound,
    toggleMusic,
    playCollect,
    playWrong,
    playMiss,
    playBomb,
    playPowerUp,
    playComboNice,
    playComboSuper,
    playComboAwesome,
    playComboMega,
    playFeverStart,
    playFeverEnd,
    playGameOver,
    playVictory,
    playAchievement,
  } = useGameSounds();

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

  // Tracked setTimeout to prevent memory leaks
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

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
    safeTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popupId));
    }, 1000);
  }, [safeTimeout]);

  // Show screen flash
  const showScreenFlash = useCallback((color: string) => {
    setScreenFlash(color);
    safeTimeout(() => setScreenFlash(null), 150);
  }, [safeTimeout]);

  // Reset game on mount (but don't start yet - show intro first)
  useEffect(() => {
    resetGame();
    return () => {
      stopMusic();
      // Clear all tracked timeouts to prevent memory leaks
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, [resetGame, stopMusic]);

  // Handle Escape key for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Start the game from intro
  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setIsInitialized(true);
    startMusic();
  }, [startMusic]);

  // Play combo milestone sounds
  useEffect(() => {
    const comboTier = getCurrentComboTier();
    const currentTierIndex = comboTier.multiplier;

    if (currentTierIndex > prevComboTierRef.current) {
      // Tier increased - play sound
      if (currentTierIndex === 2) playComboNice();
      else if (currentTierIndex === 3) playComboSuper();
      else if (currentTierIndex === 4) playComboAwesome();
      else if (currentTierIndex === 5) playComboMega();
    }

    prevComboTierRef.current = currentTierIndex;
  }, [combo, getCurrentComboTier, playComboNice, playComboSuper, playComboAwesome, playComboMega]);

  // Play fever start/end sounds
  useEffect(() => {
    if (isFeverMode && !wasFeverModeRef.current) {
      playFeverStart();
    } else if (!isFeverMode && wasFeverModeRef.current) {
      playFeverEnd();
    }
    wasFeverModeRef.current = isFeverMode;
  }, [isFeverMode, playFeverStart, playFeverEnd]);

  // Play achievement unlock sound when new achievement added to queue
  useEffect(() => {
    if (achievementQueue.length > 0) {
      playAchievement();
    }
  }, [achievementQueue.length, playAchievement]);

  // Check for fever activation
  useEffect(() => {
    if (feverMeter >= 100 && !isFeverMode && gameState === 'playing') {
      activateFever();
      setEricMood('celebrating');
      setEricMessage('KOORTS MODUS!');
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
      playGameOver();
      setEricMood('worried');
      setEricMessage('Geen energie meer...');

      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    }
  }, [energy, gameState, endGame, lessonId, playGameOver]);

  // Check for 3-star completion (only after game is initialized)
  useEffect(() => {
    if (!isInitialized) return; // Don't check until game is properly reset

    if (score >= GAME_CONFIG.star3Threshold && gameState === 'playing') {
      setGameState('complete');
      const result = endGame(lessonId);
      setGameResult(result);
      playVictory();
      setEricMood('celebrating');
      setEricMessage('FANTASTISCH! 3 Sterne!');

      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }

      setTimeout(onComplete, 3000);
    }
  }, [score, gameState, endGame, lessonId, onComplete, isInitialized, playVictory]);

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
      playBomb();
      showScreenFlash('#ef4444'); // Red flash
      setEricMood('worried');
      setEricMessage('BOEM! Niet de bom!');
      safeTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
      }, 1500);
      return;
    }

    // Handle power-ups
    if (type === 'shield' || type === 'slowmo' || type === 'magnet') {
      activatePowerUp(type);
      playPowerUp();
      showScreenFlash(config.glowColor); // Power-up color flash

      if (type === 'magnet') {
        // Collect ALL crystals on screen (except bombs)
        // Use functional update to get current crystals state and avoid race condition
        setCrystals(prev => {
          const crystalsToCollect = prev.filter(c => c.crystalType !== 'bomb' && c.id !== id);

          // Calculate total score and trigger hitCrystal for each after render
          if (crystalsToCollect.length > 0) {
            safeTimeout(() => {
              let totalScore = 0;
              const multiplier = getCurrentComboTier().multiplier * (isFeverMode ? 2 : 1);
              crystalsToCollect.forEach(c => {
                const cfg = getCrystalConfig(c.crystalType);
                totalScore += Math.round(GAME_CONFIG.baseScore * cfg.scoreMultiplier * multiplier);
                hitCrystal(cfg.scoreMultiplier, cfg.feverBonus);
              });
              showScorePopup(50, totalScore, '#ec4899', true);
            }, 0);
          }

          // Return only bombs
          return prev.filter(c => c.crystalType === 'bomb');
        });

        setEricMessage('MAGNEET! Alles verzameld!');
      } else if (type === 'shield') {
        setEricMessage('Schild geactiveerd!');
      } else if (type === 'slowmo') {
        setEricMessage('Slow-mo!');
      }

      setEricMood('celebrating');
      safeTimeout(() => {
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
    playCollect(combo);

    // Special messages for special crystals
    if (type === 'gold') {
      setEricMood('celebrating');
      setEricMessage('GOUD! Dubbele punten!');
    } else if (type === 'rainbow') {
      setEricMood('celebrating');
      setEricMessage('REGENBOOG! Koorts-boost!');
    } else {
      // Update Eric's mood based on combo
      const comboTier = getCurrentComboTier();
      if (comboTier.multiplier >= 5) {
        setEricMood('celebrating');
        setEricMessage('MEGA! Ongelooflijk!');
      } else if (comboTier.multiplier >= 3) {
        setEricMood('celebrating');
        const messages = ['Super!', 'Fantastisch!', 'Ga zo door!'];
        setEricMessage(messages[Math.floor(Math.random() * messages.length)]);
      } else {
        setEricMood('encouraging');
        const messages = ['Mooi!', 'Ja!', 'Top!', 'Yes!'];
        setEricMessage(messages[Math.floor(Math.random() * messages.length)]);
      }
    }
  }, [hitCrystal, hitBomb, activatePowerUp, getCurrentComboTier, gameState, combo, isFeverMode, playBomb, playPowerUp, playCollect, crystals, showScorePopup, showScreenFlash, safeTimeout]);

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
      setEricMessage('Bevroren!');
      safeTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
        setEricMessage('Weer ontdooid!');
      }, 3000);
      return;
    }

    missedCrystal();
    playMiss();
    setEricMood('worried');
    setEricMessage('Oeps, gemist!');
    safeTimeout(() => {
      if (gameState === 'playing') {
        setEricMood('encouraging');
      }
    }, 1000);
  }, [missedCrystal, playMiss, safeTimeout, gameState]);

  // Handle wrong key press
  const handleWrongKey = useCallback(() => {
    wrongKey();
    playWrong();
    setEricMood('worried');
    setEricMessage(hasShield ? 'Schild heeft beschermd!' : 'Verkeerde toets!');
    safeTimeout(() => {
      if (gameState === 'playing') {
        setEricMood('encouraging');
      }
    }, 800);
  }, [wrongKey, playWrong, safeTimeout, gameState, hasShield]);

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

      {/* Sound controls */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        {/* Mute All button */}
        <button
          onClick={() => {
            if (soundEnabled || musicEnabled) {
              if (soundEnabled) toggleSound();
              if (musicEnabled) toggleMusic();
            } else {
              toggleSound();
              toggleMusic();
            }
          }}
          className={`h-10 px-3 rounded-full flex items-center justify-center gap-1 transition-all ${
            !soundEnabled && !musicEnabled
              ? 'bg-red-600/80 hover:bg-red-500/80'
              : 'bg-gray-700/80 hover:bg-gray-600/80'
          }`}
          title={!soundEnabled && !musicEnabled ? 'Geluid aan' : 'Lautlos'}
        >
          <span className="text-lg">{!soundEnabled && !musicEnabled ? '🔇' : '🔈'}</span>
          <span className="text-white text-xs font-medium">
            {!soundEnabled && !musicEnabled ? 'Aan' : 'Stil'}
          </span>
        </button>
      </div>

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
                {activePowerUp === 'shield' ? 'Schild actief' : 'Slow-mo'}
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

      {/* Intro Screen */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-indigo-900/95 to-purple-900/95 rounded-2xl p-8 text-center shadow-2xl max-w-lg mx-4 border border-cyan-500/30"
              style={{ boxShadow: '0 0 60px rgba(6, 182, 212, 0.3)' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <motion.h2
                className="text-4xl font-black text-cyan-300 mb-4"
                style={{ textShadow: '0 0 30px currentColor' }}
              >
                💎 KRISTAL CHAOS 💎
              </motion.h2>

              <div className="text-left text-white/90 space-y-3 mb-6">
                <p className="flex items-center gap-3">
                  <span className="text-2xl">⌨️</span>
                  <span>Druk de juiste letter om kristallen te vangen</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span>Houd je energie op peil - mis geen kristallen!</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <span>Bouw combo&apos;s op voor KOORTS MODUS</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">💣</span>
                  <span>Pas op voor bommen - niet typen!</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span>Haal {GAME_CONFIG.star3Threshold.toLocaleString()} punten voor 3 sterren</span>
                </p>
              </div>

              <div className="text-purple-300/70 text-sm mb-4">
                Druk op <kbd className="bg-black/50 px-2 py-1 rounded text-white">ESC</kbd> om te pauzeren
              </div>

              <motion.button
                onClick={handleStartGame}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-xl text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 border border-slate-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring' }}
            >
              <motion.h2
                className="text-4xl font-black text-white mb-2"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
              >
                ⏸️ PAUZE
              </motion.h2>

              <p className="text-slate-300 mb-6">
                Druk op <kbd className="bg-black/50 px-2 py-1 rounded text-white">ESC</kbd> of klik om verder te spelen
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Verder ▶️
                </motion.button>
                <motion.button
                  onClick={onComplete}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl font-bold text-white hover:from-slate-500 hover:to-slate-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stoppen
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    NIEUW RECORD!
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
                  Opnieuw spelen
                </button>
                {gameState === 'complete' && (
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/30"
                  >
                    Verder
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

      {/* Achievement popup */}
      <AnimatePresence>
        {achievementQueue.length > 0 && (
          <AchievementPopup
            achievementId={achievementQueue[0]}
            onClose={popAchievementQueue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
