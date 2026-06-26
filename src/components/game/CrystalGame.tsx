'use client';

import { useState, useEffect, useCallback, useRef, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceObstacle } from './RaceObstacle';
import { RacePlayer, PlayerState } from './RacePlayer';
import { AbilityBar } from './AbilityBar';
import { Eric } from '@/components/eric/Eric';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { Sparkles } from '@/components/ui/Sparkles';
import { LaneRunnerBackground } from './LaneRunnerBackground';
import { GameHUD } from './GameHUD';
import { ScorePopup } from './ScorePopup';
import { AchievementPopup } from './AchievementPopup';
import { HitZone, HitResult } from './HitZone';
import { ParticleCanvas, ParticleCanvasHandle } from './ParticleCanvas';
import { CameraShake } from './CameraShake';
import { useGameStore, GAME_CONFIG, getLessonScoreThresholds } from '@/lib/stores/gameStore';
import {
  getRaceConfig,
  LANE_POSITIONS,
  LANE_COUNT,
  ObstacleType,
} from '@/lib/data/raceAbilities';

interface ScorePopupData {
  id: string;
  score: number;
  x: number;
  y: number;
  color: string;
  isSpecial: boolean;
}

interface ObstacleData {
  id: string;
  lane: number;
  type: ObstacleType;
  letter?: string;
  duration: number;
  spawnAt: number;
  destroyed: boolean;
}

interface CrystalGameProps {
  lessonId: string;
  availableLetters: string[];
  onComplete: () => void;
}

const LANE_LABELS = ['links', 'midden', 'rechts'] as const;
const isTypingObstacle = (obstacle: ObstacleData) =>
  obstacle.type === 'letter' || obstacle.type === 'gold' || obstacle.type === 'ice';

export function CrystalGame({
  lessonId,
  availableLetters,
  onComplete,
}: CrystalGameProps) {
  // Race config: splits letters into abilities vs obstacle letters
  const raceConfig = useRef(getRaceConfig(availableLetters, lessonId));

  // Player state
  const [playerLane, setPlayerLane] = useState(1); // start in middle
  const [playerState, setPlayerState] = useState<PlayerState>('running');

  // Obstacle state
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);

  // Speed modifiers
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isSlowing, setIsSlowing] = useState(false);
  // Refs so timed callbacks always read the latest value without stale closures
  const isSprintingRef = useRef(false);
  const isSlowingRef = useRef(false);

  // Ability cooldowns (key -> timestamp when ready)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [activeAbility, setActiveAbility] = useState<string | null>(null);

  // UI state
  const [ericMood, setEricMood] = useState<'happy' | 'encouraging' | 'celebrating' | 'worried'>('happy');
  const [ericMessage, setEricMessage] = useState('Klaar voor de race!');
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'gameover' | 'complete'>('intro');
  const [gameResult, setGameResult] = useState<{ newHighScore: boolean; gemsEarned: number; stars: number } | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Visual feedback
  const [hitResult, setHitResult] = useState<HitResult>(null);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [zoomPulse, setZoomPulse] = useState(false);

  // Refs
  const obstacleIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevComboTierRef = useRef(0);
  const wasFeverModeRef = useRef(false);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const particleRef = useRef<ParticleCanvasHandle>(null);
  const playerStateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const gameFinalizedRef = useRef(false);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spawnWaveRef = useRef<() => void>(() => {});
  const getSpawnIntervalRef = useRef<() => number>(() => 1800);
  const gameStateRef = useRef(gameState);

  // Game store
  const {
    energy,
    score,
    combo,
    isFeverMode,
    feverMeter,
    wrongKeyCount,
    missedCount,
    bombHitCount,
    achievementQueue,
    resetGame,
    addScore,
    hitCrystal,
    missedCrystal,
    wrongKey,
    hitBomb,
    activateFever,
    tickFever,
    endGame,
    getCurrentComboTier,
    popAchievementQueue,
  } = useGameStore();

  // Sounds
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

  const intensity = Math.min(1, (combo / 30) + (isFeverMode ? 0.5 : 0));
  const scoreTargets = getLessonScoreThresholds(lessonId);
  const isAssistMode = energy <= 35 || bombHitCount >= 2 || (wrongKeyCount + missedCount) >= 8;

  // --- Helpers ---

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const triggerHitResult = useCallback((result: HitResult) => {
    setHitResult(result);
    safeTimeout(() => setHitResult(null), 300);
  }, [safeTimeout]);

  const triggerShake = useCallback((intensity: number, durationMs: number = 300) => {
    setShakeIntensity(intensity);
    safeTimeout(() => setShakeIntensity(0), durationMs);
  }, [safeTimeout]);

  const triggerZoomPulse = useCallback(() => {
    setZoomPulse(true);
    safeTimeout(() => setZoomPulse(false), 200);
  }, [safeTimeout]);

  const showScorePopup = useCallback((x: number, earnedScore: number, color: string, isSpecial: boolean) => {
    const popupId = `popup-${Date.now()}-${Math.random()}`;
    setScorePopups(prev => [...prev, {
      id: popupId, score: earnedScore, x,
      y: typeof window !== 'undefined' ? window.innerHeight * 0.82 : 500,
      color, isSpecial,
    }]);
    safeTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popupId));
    }, 1000);
  }, [safeTimeout]);

  const showScreenFlash = useCallback((color: string) => {
    setScreenFlash(color);
    safeTimeout(() => setScreenFlash(null), 150);
  }, [safeTimeout]);

  const blockTouchPointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const blockTouchEvent = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const burstAtLane = useCallback((lane: number, color: string, count: number) => {
    const x = LANE_POSITIONS[lane] ?? 50;
    const y = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 500;
    particleRef.current?.burst(x, y, color, count);
  }, []);

  const getObstacleProgress = useCallback((obstacle: ObstacleData) => {
    const elapsed = Date.now() - obstacle.spawnAt;
    const total = Math.max(1, obstacle.duration * 1000);
    return Math.max(0, Math.min(1, elapsed / total));
  }, []);

  // Set player state with auto-reset
  const setPlayerStateTemporary = useCallback((state: PlayerState, durationMs: number) => {
    if (playerStateTimerRef.current) clearTimeout(playerStateTimerRef.current);
    setPlayerState(state);
    playerStateTimerRef.current = setTimeout(() => {
      setPlayerState(isSprintingRef.current ? 'sprinting' : 'running');
    }, durationMs);
  }, []);

  // Flash an ability as active
  const flashAbility = useCallback((key: string) => {
    setActiveAbility(key);
    safeTimeout(() => setActiveAbility(null), 400);
  }, [safeTimeout]);

  // --- Spawn system ---

  const getGameAge = useCallback(() => {
    return gameStartTimeRef.current > 0 ? (Date.now() - gameStartTimeRef.current) / 1000 : 0;
  }, []);

  const getBaseDuration = useCallback(() => {
    const age = getGameAge();
    let duration = age < 8 ? 6.5 : 5.8;
    if (isFeverMode) duration = 4.2;
    else if (score >= 15000) duration = 4.6;
    else if (score >= 8000) duration = 5.0;
    else if (score >= 3000) duration = 5.4;
    // Speed modifiers
    if (isSlowing) duration *= 1.5;
    if (isSprinting) duration *= 0.7;
    if (isAssistMode) duration *= 1.18;
    return duration;
  }, [score, isFeverMode, isSlowing, isSprinting, getGameAge, isAssistMode]);

  const getSpawnInterval = useCallback(() => {
    const age = getGameAge();
    let base = isFeverMode ? 1400 : age < 8 ? 2700 : 2200;
    const reduction = Math.min(350, Math.floor(score / 4000) * 50);
    base = base - reduction;
    if (isAssistMode) base += 450;
    return Math.max(1350, base);
  }, [score, isFeverMode, getGameAge, isAssistMode]);

  const spawnWave = useCallback(() => {
    if (gameState !== 'playing') return;

    const { obstacleLetters } = raceConfig.current;
    const duration = getBaseDuration();
    const age = getGameAge();
    const isSafeStart = age < 4;
    const isTutorialLetters = age >= 4 && age < 8;
    const isTutorialMix = age >= 8 && age < 12;
    const activeTypingLetters = new Set(
      obstacles
        .filter(o => !o.destroyed && isTypingObstacle(o) && o.letter)
        .map(o => o.letter!.toLowerCase())
    );
    const plannedTypingLetters = new Set<string>();
    const pickTypingLetter = () => {
      const candidates = obstacleLetters.filter((candidate) => {
        const lower = candidate.toLowerCase();
        return !activeTypingLetters.has(lower) && !plannedTypingLetters.has(lower);
      });
      if (candidates.length === 0) return undefined;
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      plannedTypingLetters.add(picked.toLowerCase());
      return picked;
    };

    // Wave size: max 2 so there is always at least 1 free lane to stand in
    const maxWaveSize = isAssistMode ? 1 : 2;
    const waveSize = age < 4 ? 1 : Math.min(maxWaveSize, 1 + Math.floor(score / 10000));
    const usedLanes = new Set<number>();
    const newObstacles: ObstacleData[] = [];

    for (let i = 0; i < waveSize; i++) {
      const availableLanes = [0, 1, 2].filter(l => !usedLanes.has(l));
      if (availableLanes.length === 0) break;
      const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
      usedLanes.add(lane);

      const roll = Math.random() * 100;
      let type: ObstacleType;
      let letter: string | undefined;

      if (isSafeStart) {
        // Safe start: only gems (no bombs, no hard obstacles)
        type = 'gem';
      } else if (isTutorialLetters) {
        type = 'letter';
        letter = pickTypingLetter();
        if (!letter) type = 'gem';
      } else if (isTutorialMix) {
        if (obstacleLetters.length === 0) {
          type = roll < (isAssistMode ? 10 : 18) ? 'bomb' : 'gem';
        } else if (roll < (isAssistMode ? 3 : 5)) {
          type = 'bomb';
        } else if (roll < (isAssistMode ? 30 : 25)) {
          type = 'gem';
        } else {
          type = 'letter';
          letter = pickTypingLetter();
          if (!letter) type = 'gem';
        }
      } else if (obstacleLetters.length === 0) {
        // No obstacle letters (lesson 0) — bombs and gems, but fewer bombs
        if (roll < (isAssistMode ? 12 : 22)) {
          type = 'bomb';
        } else {
          type = 'gem';
        }
      } else if (roll < (isAssistMode ? 6 : 10)) {
        type = 'bomb';
      } else if (roll < (isAssistMode ? 44 : 38)) {
        type = 'gem';
      } else if (roll < (isAssistMode ? 50 : 46)) {
        type = 'gold';
        letter = pickTypingLetter();
        if (!letter) type = 'gem';
      } else if (roll < (isAssistMode ? 54 : 52)) {
        type = 'ice';
        letter = pickTypingLetter();
        if (!letter) type = 'gem';
      } else {
        type = 'letter';
        letter = pickTypingLetter();
        if (!letter) type = 'gem';
      }

      // Safety: never put a bomb in the only free lane
      if (type === 'bomb' && waveSize >= 2 && availableLanes.length === 1) {
        type = 'gem';
      }

      newObstacles.push({
        id: `obs-${obstacleIdRef.current++}`,
        lane,
        type,
        letter,
        duration: duration + (Math.random() * 1.6 - 0.8),
        spawnAt: Date.now(),
        destroyed: false,
      });
    }

    const addObstacle = (obs: ObstacleData) => {
      setObstacles(prev => {
        if (gameStateRef.current !== 'playing') return prev;
        const activeObstacles = prev.filter(o => !o.destroyed);
        if (activeObstacles.length >= 7) return prev;

        const typingCount = activeObstacles.filter(isTypingObstacle).length;
        const activeLetters = new Set(
          activeObstacles
            .filter(o => isTypingObstacle(o) && o.letter)
            .map(o => o.letter!.toLowerCase())
        );
        const wouldDuplicate = !!obs.letter && activeLetters.has(obs.letter.toLowerCase());
        const adjusted = isTypingObstacle(obs) && (typingCount >= 3 || wouldDuplicate)
          ? { ...obs, type: 'gem' as const, letter: undefined }
          : obs;

        return [...prev, adjusted];
      });
    };

    // Spawn first obstacle immediately; stagger second by 550-800ms so they
    // don't arrive at the player at exactly the same time.
    if (newObstacles[0]) addObstacle(newObstacles[0]);
    if (newObstacles[1]) {
      safeTimeout(() => addObstacle(newObstacles[1]), 550 + Math.random() * 250);
    }
  }, [gameState, score, obstacles, getBaseDuration, getGameAge, isAssistMode, safeTimeout]);

  // --- Collision handling ---
  // IMPORTANT: side effects (store updates, sounds) are deferred via queueMicrotask
  // to avoid "Cannot update a component while rendering another" React error.

  const handleObstacleReachEnd = useCallback((obstacleId: string) => {
    // Read obstacle data synchronously before removing
    const obstacle = obstacles.find(o => o.id === obstacleId);
    if (!obstacle || obstacle.destroyed) {
      setObstacles(prev => prev.filter(o => o.id !== obstacleId));
      return;
    }

    // Remove obstacle immediately
    setObstacles(prev => prev.filter(o => o.id !== obstacleId));

    // Defer all side effects to avoid setState-during-render
    queueMicrotask(() => {
      const inPlayerLane = obstacle.lane === playerLane;
      const isInvincible = playerState === 'jumping' || playerState === 'dashing';

      if (!inPlayerLane) return; // different lane, flies by harmlessly

      if (obstacle.type === 'gem') {
        hitCrystal(1.5, 3); // Coins are worth 150 base + fever bonus.
        playCollect(combo);
        const gemMultiplier = getCurrentComboTier().multiplier * (isFeverMode ? 2 : 1);
        showScorePopup(LANE_POSITIONS[obstacle.lane], Math.round(150 * gemMultiplier), '#fbbf24', false);
        triggerHitResult('hit');
        burstAtLane(obstacle.lane, '#fbbf24', 15);
        setEricMood('encouraging');
        setEricMessage('Munt gepakt!');
        safeTimeout(() => { if (gameState === 'playing') setEricMood('happy'); }, 800);
      } else if (obstacle.type === 'bomb') {
        if (!isInvincible) {
          hitBomb();
          playBomb();
          showScreenFlash('#ef4444');
          triggerHitResult('bomb');
          triggerShake(8, 400);
          burstAtLane(obstacle.lane, '#ef4444', 40);
          setPlayerStateTemporary('hit', 500);
          setEricMood('worried');
          setEricMessage('BOEM! Ontwijk de bom!');
          safeTimeout(() => { if (gameState === 'playing') setEricMood('encouraging'); }, 1500);
        }
      } else if (obstacle.type === 'ice') {
        if (!isInvincible) {
          missedCrystal();
          playMiss();
          triggerHitResult('miss');
          setPlayerStateTemporary('hit', 400);
          setIsSlowing(true);
          setSpeedMultiplier(0.5);
          setEricMood('worried');
          setEricMessage('Bevroren!');
          safeTimeout(() => {
            setIsSlowing(false);
            setSpeedMultiplier(isSprintingRef.current ? 1.5 : 1);
            if (gameState === 'playing') setEricMood('encouraging');
            setEricMessage('Weer ontdooid!');
          }, 2000);
        }
      } else {
        // Letter or gold — collision (not typed in time)
        if (!isInvincible) {
          missedCrystal();
          playMiss();
          triggerHitResult('miss');
          setPlayerStateTemporary('hit', 300);
          setEricMood('worried');
          setEricMessage('Oeps, gemist!');
          safeTimeout(() => { if (gameState === 'playing') setEricMood('encouraging'); }, 1000);
        }
      }
    });
  }, [obstacles, playerLane, playerState, isFeverMode, combo, gameState, hitCrystal, missedCrystal, hitBomb, playCollect, playMiss, playBomb, getCurrentComboTier, showScorePopup, showScreenFlash, triggerHitResult, triggerShake, burstAtLane, setPlayerStateTemporary, safeTimeout]);

  // --- Ability handlers ---

  const handleMoveLeft = useCallback(() => {
    setPlayerLane(prev => Math.max(0, prev - 1));
    flashAbility('f');
  }, [flashAbility]);

  const handleMoveRight = useCallback(() => {
    setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1));
    flashAbility('j');
  }, [flashAbility]);

  const handleDashLeft = useCallback(() => {
    setPlayerLane(prev => Math.max(0, prev - 1));
    setPlayerStateTemporary('dashing', 400);
    flashAbility('d');
    playPowerUp();
  }, [setPlayerStateTemporary, flashAbility, playPowerUp]);

  const handleDashRight = useCallback(() => {
    setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1));
    setPlayerStateTemporary('dashing', 400);
    flashAbility('k');
    playPowerUp();
  }, [setPlayerStateTemporary, flashAbility, playPowerUp]);

  const handleJump = useCallback(() => {
    setPlayerStateTemporary('jumping', 600);
    flashAbility(' ');
    playPowerUp();
  }, [setPlayerStateTemporary, flashAbility, playPowerUp]);

  const handleSlow = useCallback(() => {
    const now = Date.now();
    if ((cooldowns['s'] || 0) > now) return; // on cooldown

    setIsSlowing(true);
    setSpeedMultiplier(0.5);
    flashAbility('s');
    playPowerUp();
    setEricMessage('Slow-mo!');

    safeTimeout(() => {
      setIsSlowing(false);
      setSpeedMultiplier(isSprintingRef.current ? 1.5 : 1);
    }, 2000);

    setCooldowns(prev => ({ ...prev, 's': now + 8000 }));
  }, [cooldowns, flashAbility, playPowerUp, safeTimeout]);

  const handleSprint = useCallback(() => {
    const now = Date.now();
    if ((cooldowns['l'] || 0) > now) return; // on cooldown

    setIsSprinting(true);
    setSpeedMultiplier(1.5);
    setPlayerState('sprinting');
    flashAbility('l');
    playPowerUp();
    setEricMessage('Snel!');

    safeTimeout(() => {
      setIsSprinting(false);
      setSpeedMultiplier(isSlowingRef.current ? 0.5 : 1);
      setPlayerState('running');
    }, 2000);

    setCooldowns(prev => ({ ...prev, 'l': now + 8000 }));
  }, [cooldowns, flashAbility, playPowerUp, safeTimeout]);

  // --- Letter typing (destroy obstacles) ---

  const handleTypeLetter = useCallback((key: string) => {
    const lowerKey = key.toLowerCase();

    // Target the closest matching obstacle so duplicate legacy state stays predictable.
    const matchingObstacle = obstacles
      .filter(o => !o.destroyed && o.letter?.toLowerCase() === lowerKey && isTypingObstacle(o))
      .sort((a, b) => getObstacleProgress(b) - getObstacleProgress(a))[0];

    if (matchingObstacle) {
      // Destroy the obstacle
      setObstacles(prev =>
        prev.map(o => o.id === matchingObstacle.id ? { ...o, destroyed: true } : o)
      );

      // Clean up destroyed obstacles after animation
      safeTimeout(() => {
        setObstacles(prev => prev.filter(o => o.id !== matchingObstacle.id));
      }, 350);

      // Score
      const isGold = matchingObstacle.type === 'gold';
      const scoreMultiplier = isGold ? 2 : 1;
      const feverBonus = isGold ? 5 : 0;
      const multiplier = getCurrentComboTier().multiplier * (isFeverMode ? 2 : 1);
      const earnedScore = Math.round(GAME_CONFIG.baseScore * scoreMultiplier * multiplier);

      hitCrystal(scoreMultiplier, feverBonus);
      playCollect(combo);

      const obstacleX = LANE_POSITIONS[matchingObstacle.lane] ?? 50;
      showScorePopup(obstacleX, earnedScore, isGold ? '#fbbf24' : '#06b6d4', isGold);
      triggerHitResult('hit');
      burstAtLane(matchingObstacle.lane, isGold ? '#fbbf24' : '#06b6d4', isGold ? 30 : 15);

      if (isGold) {
        showScreenFlash('#fbbf24');
        triggerShake(3, 200);
        setEricMood('celebrating');
        setEricMessage('2x-blok geraakt!');
      } else if (matchingObstacle.type === 'ice') {
        setEricMood('encouraging');
        setEricMessage('IJs vernietigd!');
      } else {
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

      safeTimeout(() => {
        if (gameState === 'playing') setEricMood('happy');
      }, 1200);
    } else {
      // No matching obstacle — wrong key
      wrongKey();
      playWrong();
      triggerHitResult('miss');
      setEricMood('worried');
      setEricMessage('Verkeerde toets!');
      safeTimeout(() => {
        if (gameState === 'playing') setEricMood('encouraging');
      }, 800);
    }
  }, [obstacles, isFeverMode, combo, gameState, hitCrystal, wrongKey, getCurrentComboTier, playCollect, playWrong, showScorePopup, showScreenFlash, triggerHitResult, triggerShake, burstAtLane, getObstacleProgress, safeTimeout]);

  // --- Main keyboard handler ---

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    const lowerKey = key.toLowerCase();
    const { abilities } = raceConfig.current;

    // Check if it's an unlocked movement key
    if (lowerKey in abilities) {
      const action = abilities[lowerKey].action;
      switch (action) {
        case 'move_left': handleMoveLeft(); break;
        case 'move_right': handleMoveRight(); break;
        case 'dash_left': handleDashLeft(); break;
        case 'dash_right': handleDashRight(); break;
        case 'jump': handleJump(); break;
        case 'slow': handleSlow(); break;
        case 'sprint': handleSprint(); break;
      }
      return;
    }

    // Check if it's a letter that could destroy an obstacle
    const { obstacleLetters } = raceConfig.current;
    if (obstacleLetters.includes(lowerKey) || obstacles.some(o => o.letter?.toLowerCase() === lowerKey)) {
      handleTypeLetter(key);
      return;
    }

    // Unknown key — ignore silently (don't punish for keys outside the lesson)
  }, [gameState, obstacles, handleMoveLeft, handleMoveRight, handleDashLeft, handleDashRight, handleJump, handleSlow, handleSprint, handleTypeLetter]);

  // Build allowed keys for useKeyboard
  const allowedKeys = useRef<string[]>([]);
  useEffect(() => {
    const { abilities, obstacleLetters } = raceConfig.current;
    allowedKeys.current = [
      ...Object.keys(abilities),
      ...obstacleLetters,
    ];
  }, []);

  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: gameState === 'playing',
    allowedKeys: allowedKeys.current,
  });

  // --- Cooldown timer ---
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => forceUpdate(n => n + 1), 500);
    return () => clearInterval(interval);
  }, [gameState]);

  // Compute remaining cooldowns for display
  const displayCooldowns: Record<string, number> = {};
  const now = Date.now();
  for (const [key, readyAt] of Object.entries(cooldowns)) {
    const remaining = readyAt - now;
    if (remaining > 0) displayCooldowns[key] = remaining;
  }

  // --- Game lifecycle ---

  // Reset on mount
  useEffect(() => {
    resetGame();
    raceConfig.current = getRaceConfig(availableLetters, lessonId);
    return () => {
      stopMusic();
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = null;
      }
      if (playerStateTimerRef.current) {
        clearTimeout(playerStateTimerRef.current);
        playerStateTimerRef.current = null;
      }
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, [resetGame, stopMusic, availableLetters, lessonId]);

  // Escape for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleStartGame = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    gameFinalizedRef.current = false;
    setGameState('playing');
    setIsInitialized(true);
    startMusic();
  }, [startMusic]);

  const handleContinueFromComplete = useCallback(() => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    onComplete();
  }, [onComplete]);

  const finalizeRun = useCallback((nextState: 'gameover' | 'complete') => {
    if (gameFinalizedRef.current) return null;
    gameFinalizedRef.current = true;
    if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    const result = endGame(lessonId);
    setGameResult(result);
    setGameState(nextState);
    return result;
  }, [endGame, lessonId]);

  // Combo milestone sounds
  useEffect(() => {
    const comboTier = getCurrentComboTier();
    const currentTierIndex = comboTier.multiplier;
    if (currentTierIndex > prevComboTierRef.current) {
      if (currentTierIndex === 2) playComboNice();
      else if (currentTierIndex === 3) playComboSuper();
      else if (currentTierIndex === 4) playComboAwesome();
      else if (currentTierIndex === 5) playComboMega();
      triggerZoomPulse();
    }
    prevComboTierRef.current = currentTierIndex;
  }, [combo, getCurrentComboTier, playComboNice, playComboSuper, playComboAwesome, playComboMega, triggerZoomPulse]);

  // Fever sounds
  useEffect(() => {
    if (isFeverMode && !wasFeverModeRef.current) playFeverStart();
    else if (!isFeverMode && wasFeverModeRef.current) playFeverEnd();
    wasFeverModeRef.current = isFeverMode;
  }, [isFeverMode, playFeverStart, playFeverEnd]);

  // Achievement sound
  useEffect(() => {
    if (achievementQueue.length > 0) playAchievement();
  }, [achievementQueue.length, playAchievement]);

  // Fever activation
  useEffect(() => {
    if (feverMeter >= 100 && !isFeverMode && gameState === 'playing') {
      activateFever();
      setEricMood('celebrating');
      setEricMessage('TURBO MODUS!');
    }
  }, [feverMeter, isFeverMode, activateFever, gameState]);

  // Fever timer
  useEffect(() => {
    if (isFeverMode && gameState === 'playing') {
      feverIntervalRef.current = setInterval(() => tickFever(100), 100);
      return () => { if (feverIntervalRef.current) clearInterval(feverIntervalRef.current); };
    }
  }, [isFeverMode, tickFever, gameState]);

  // Distance scoring — steady points for surviving
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      const basePoints = 5; // 5 points per tick (every 500ms = 10pts/sec)
      const sprintBonus = isSprinting ? 2 : 0;
      addScore(basePoints + sprintBonus);
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, isSprinting, addScore]);

  // Game over check
  useEffect(() => {
    if (energy <= 0 && gameState === 'playing') {
      const result = finalizeRun('gameover');
      if (result) {
        playGameOver();
        setEricMood('worried');
        setEricMessage('Geen energie meer...');
      }
    }
  }, [energy, gameState, playGameOver, finalizeRun]);

  // 3-star completion check
  useEffect(() => {
    if (!isInitialized) return;
    if (score >= scoreTargets.star3 && gameState === 'playing') {
      const result = finalizeRun('complete');
      if (!result) return;
      playVictory();
      setEricMood('celebrating');
      setEricMessage('FANTASTISCH! 3 Sterren!');
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = setTimeout(() => {
        completeTimeoutRef.current = null;
        onComplete();
      }, 3000);
    }
  }, [score, gameState, onComplete, isInitialized, playVictory, finalizeRun, scoreTargets.star3]);

  // Sync refs each render so timed callbacks always read the latest values.
  spawnWaveRef.current = spawnWave;
  getSpawnIntervalRef.current = getSpawnInterval;
  isSprintingRef.current = isSprinting;
  isSlowingRef.current = isSlowing;
  gameStateRef.current = gameState;

  // Spawn loop — uses recursive setTimeout so the interval dynamically adjusts
  // with score. Only restarts when gameState changes, not on every score tick.
  useEffect(() => {
    if (gameState !== 'playing') {
      if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
      return;
    }
    spawnWaveRef.current();
    const scheduleNext = () => {
      spawnIntervalRef.current = setTimeout(() => {
        spawnWaveRef.current();
        scheduleNext();
      }, getSpawnIntervalRef.current());
    };
    scheduleNext();
    return () => { if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current); };
  }, [gameState]);

  // Restart
  const handleRestart = useCallback(() => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    gameFinalizedRef.current = false;
    setIsInitialized(false);
    resetGame();
    setObstacles([]);
    setScorePopups([]);
    setPlayerLane(1);
    setPlayerState('running');
    setSpeedMultiplier(1);
    setIsSprinting(false);
    setIsSlowing(false);
    setCooldowns({});
    setActiveAbility(null);
    gameStartTimeRef.current = Date.now();
    startMusic();
    setGameState('playing');
    setGameResult(null);
    setEricMood('happy');
    setEricMessage('Klaar voor de race!');
    setHitResult(null);
    setShakeIntensity(0);
    setZoomPulse(false);
    obstacleIdRef.current = 0;
    raceConfig.current = getRaceConfig(availableLetters, lessonId);
    setTimeout(() => setIsInitialized(true), 100);
  }, [resetGame, startMusic, availableLetters, lessonId]);

  useEffect(() => {
    const handleMenuKeys = (e: KeyboardEvent) => {
      if (gameState === 'playing') return;

      if ((e.key === 'Enter' || e.key === ' ') && gameState === 'intro') {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (e.key === 'Enter' && gameState === 'paused') {
        e.preventDefault();
        setGameState('playing');
        return;
      }

      if (e.key === 'Enter' && gameState === 'gameover') {
        e.preventDefault();
        handleRestart();
        return;
      }

      if (e.key === 'Enter' && gameState === 'complete') {
        e.preventDefault();
        handleContinueFromComplete();
      }
    };

    window.addEventListener('keydown', handleMenuKeys);
    return () => window.removeEventListener('keydown', handleMenuKeys);
  }, [gameState, handleStartGame, handleContinueFromComplete, handleRestart]);

  // --- Build intro ability list ---
  const { abilities: introAbilities } = raceConfig.current;
  const liveObstacles = obstacles.filter(o => !o.destroyed);
  const threats = liveObstacles
    .map(o => ({ obstacle: o, progress: getObstacleProgress(o) }))
    .sort((a, b) => b.progress - a.progress);
  const urgentBomb = threats.find(t => t.obstacle.type === 'bomb' && t.obstacle.lane === playerLane && t.progress > 0.62);
  const urgentLetter = threats.find(t =>
    isTypingObstacle(t.obstacle) &&
    !!t.obstacle.letter &&
    t.progress > 0.42
  );
  const typingThreats = threats
    .filter(t => isTypingObstacle(t.obstacle) && !!t.obstacle.letter)
    .slice(0, 3);

  const coachHint = gameState !== 'playing'
    ? null
    : urgentBomb
      ? {
          tone: 'danger' as const,
          text: `BOM ${LANE_LABELS[urgentBomb.obstacle.lane]}! Verplaats nu.`,
        }
        : urgentLetter
          ? {
            tone: 'focus' as const,
            text: `Typ ${urgentLetter.obstacle.letter?.toUpperCase()} nu`,
          }
        : energy < 30
          ? {
            tone: 'info' as const,
            text: 'Pak gouden munten voor energie',
          }
          : isAssistMode
            ? {
                tone: 'info' as const,
                text: 'Rustig ritme: kijk 1 obstakel vooruit',
              }
            : {
                tone: 'info' as const,
                text: 'Munt = pakken, letter = typen',
              };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ touchAction: 'none' }}
      onPointerDownCapture={blockTouchPointer}
      onPointerMoveCapture={blockTouchPointer}
      onPointerUpCapture={blockTouchPointer}
      onTouchStartCapture={blockTouchEvent}
      onTouchMoveCapture={blockTouchEvent}
      onTouchEndCapture={blockTouchEvent}
    >
      {/* Camera shake wrapper */}
      <CameraShake
        shakeIntensity={shakeIntensity}
        zoomPulse={zoomPulse}
        isFeverMode={isFeverMode}
        continuousShake={combo >= 20 && gameState === 'playing'}
        lane={playerLane}
        speedMultiplier={speedMultiplier}
        playerState={playerState}
      >
        {/* 3D Lane Runner Background */}
        <LaneRunnerBackground
          isFeverMode={isFeverMode}
          intensity={intensity}
          laneCount={LANE_COUNT}
          speedMultiplier={speedMultiplier}
        />

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(obstacle => (
            <RaceObstacle
              key={obstacle.id}
              {...obstacle}
              onReachEnd={handleObstacleReachEnd}
            />
          ))}
        </AnimatePresence>

        {/* Hit Zone with player marker */}
        <HitZone
          hitResult={hitResult}
          combo={combo}
          isFeverMode={isFeverMode}
          playerLane={playerLane}
        />

        {/* Player */}
        <RacePlayer
          lane={playerLane}
          state={playerState}
          isFeverMode={isFeverMode}
        />

        {/* Particle Canvas */}
        <ParticleCanvas ref={particleRef} />

        {/* Eric character */}
        <motion.div
          className="absolute bottom-4 left-4 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Eric mood={ericMood} message={ericMessage} size="medium" />
        </motion.div>
      </CameraShake>

      {/* Screen flash (outside camera shake) */}
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

      {/* Game HUD */}
      <GameHUD lessonId={lessonId} />

      {/* Ability Bar */}
      <AbilityBar
        abilities={introAbilities}
        cooldowns={displayCooldowns}
        activeAbility={activeAbility}
      />

      {/* Live coach guidance */}
      <AnimatePresence mode="wait">
        {coachHint && (
          <motion.div
            key={coachHint.text}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className={`px-4 py-2 rounded-xl border text-sm font-black tracking-wide backdrop-blur-md ${
                coachHint.tone === 'danger'
                  ? 'bg-red-950/75 border-red-300/60 text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
                  : coachHint.tone === 'focus'
                    ? 'bg-cyan-950/75 border-cyan-300/60 text-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/75 border-slate-300/40 text-slate-100 shadow-[0_0_20px_rgba(15,23,42,0.5)]'
              }`}
            >
              {coachHint.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current typing targets: at most three, ordered by urgency. */}
      <AnimatePresence>
        {gameState === 'playing' && typingThreats.length > 0 && (
          <motion.div
            className="absolute top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              className="rounded-2xl border border-cyan-300/35 bg-black/65 px-4 py-3 shadow-2xl backdrop-blur-md"
              style={{ boxShadow: '0 0 28px rgba(6,182,212,0.2), inset 0 0 18px rgba(255,255,255,0.06)' }}
            >
              <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                Typ deze letters
              </div>
              <div className="flex items-center justify-center gap-3">
                {typingThreats.map(({ obstacle, progress }) => (
                  <motion.div
                    key={obstacle.id}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-xl border-2 font-mono text-3xl font-black text-white shadow-lg ${
                      obstacle.type === 'gold'
                        ? 'border-amber-200 bg-gradient-to-br from-amber-400 to-orange-500'
                        : obstacle.type === 'ice'
                          ? 'border-sky-200 bg-gradient-to-br from-sky-400 to-cyan-600'
                          : 'border-cyan-200 bg-gradient-to-br from-cyan-500 to-blue-700'
                    }`}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: progress > 0.72 ? [1, 1.08, 1] : 1 }}
                    transition={{ duration: 0.35, repeat: progress > 0.72 ? Infinity : 0 }}
                  >
                    {obstacle.letter?.toUpperCase()}
                    {obstacle.type === 'gold' && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-amber-200">
                        2x
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound controls */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
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
          title={!soundEnabled && !musicEnabled ? 'Geluid aan' : 'Stil'}
        >
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-200">
            {!soundEnabled && !musicEnabled ? 'MUTE' : 'AUDIO'}
          </span>
          <span className="text-white text-xs font-medium">
            {!soundEnabled && !musicEnabled ? 'Aan' : 'Stil'}
          </span>
        </button>
      </div>

      {/* Sprint/Slow indicator */}
      <AnimatePresence>
        {(isSprinting || isSlowing) && (
          <motion.div
            className="absolute top-24 left-4 z-20 bg-black/70 rounded-lg px-4 py-2 border border-purple-500/50"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">
                {isSprinting ? 'Sprint!' : 'Slow-mo'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="relative overflow-hidden bg-gradient-to-b from-slate-950/95 via-indigo-950/95 to-purple-950/95 rounded-3xl p-8 text-center shadow-2xl max-w-lg mx-4 border border-cyan-300/35"
              style={{ boxShadow: '0 0 70px rgba(6, 182, 212, 0.32), inset 0 0 36px rgba(255,255,255,0.06)' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
              <motion.h2
                className="relative text-4xl font-black text-cyan-200 mb-4 tracking-[0.12em]"
                style={{ textShadow: '0 0 18px currentColor, 0 0 48px rgba(6,182,212,0.5)' }}
              >
                ERIC&apos;S RACE
              </motion.h2>

              <div className="relative text-left text-white/90 space-y-3 mb-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="uppercase tracking-wider text-cyan-300/90 text-xs">Doelen Deze Run</p>
                <p>- Pak gouden munten met Eric: die geven energie en punten.</p>
                <p>- Typ letterblokken weg. Niet vangen, want dan verlies je energie.</p>
                <p>- Er staan maximaal 3 letters tegelijk op het scherm.</p>
                <p>- Ontwijk bommen met de bewegings-toetsen.</p>
                <p className="text-cyan-200">
                  Doel: {scoreTargets.star3.toLocaleString()} punten voor 3 sterren.
                </p>
              </div>

              {/* Show available abilities */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-xs text-cyan-400/70 tracking-widest mb-2">BEWEGINGS-VAARDIGHEDEN</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(introAbilities).map(([key, config]) => {
                    const displayKey = key === ' ' ? 'SPC' : key.toUpperCase();
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-cyan-900/50 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{config.icon}</span>
                        <span>{displayKey}</span>
                        <span className="text-[10px] opacity-60">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
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
                START RACE
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
                PAUZE
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
                  Verder
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
                    {star <= gameResult.stars ? '\u2B50' : '\u2606'}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div
                className="text-purple-300 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-2xl">+{gameResult.gemsEarned}</span>
                <span className="text-lg ml-1">munten</span>
              </motion.div>

              {gameState === 'gameover' && (
                <div className="mb-6 rounded-lg bg-black/30 border border-white/10 p-3 text-left text-sm text-slate-200">
                  <div>Gemiste letters: {missedCount}</div>
                  <div>Bommen geraakt: {bombHitCount}</div>
                  <div>Verkeerde toetsen: {wrongKeyCount}</div>
                  <div className="mt-2 text-cyan-200">
                    Tip: {
                      bombHitCount >= missedCount && bombHitCount >= wrongKeyCount
                        ? 'Kijk 1 baan vooruit en verplaats eerder met F/J.'
                        : wrongKeyCount >= missedCount
                          ? 'Typ rustiger: alleen letters die je op het scherm ziet.'
                          : 'Focus op de dichtstbijzijnde letter en negeer de rest.'
                    }
                  </div>
                </div>
              )}

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
                    onClick={handleContinueFromComplete}
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

      {/* Sparkles for complete */}
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
