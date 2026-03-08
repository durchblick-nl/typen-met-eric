import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Power-up types
export type PowerUpType = 'shield' | 'slowmo' | 'magnet' | null;

// Combo thresholds and multipliers
export const COMBO_TIERS = [
  { threshold: 0, multiplier: 1, name: null },
  { threshold: 5, multiplier: 2, name: 'Mooi!' },
  { threshold: 10, multiplier: 3, name: 'Super!' },
  { threshold: 20, multiplier: 4, name: 'Geweldig!' },
  { threshold: 30, multiplier: 5, name: 'MEGA!' },
] as const;

// Game balance constants
export const GAME_CONFIG = {
  // Energy
  startEnergy: 100,
  maxEnergy: 100,
  energyPerHit: 5,
  energyLostOnMiss: 10,
  energyLostOnWrongKey: 15,
  energyLostOnBomb: 30,

  // Fever
  feverDuration: 10000, // 10 seconds
  feverMultiplier: 2,
  feverEnergyLossReduction: 0.5,

  // Scoring
  baseScore: 100,
  goldMultiplier: 2,

  // Stars (score thresholds) — tuned for race game with combos + distance scoring
  star1Threshold: 5000,
  star2Threshold: 15000,
  star3Threshold: 30000,
} as const;

function getLessonNumber(lessonId: string): number {
  const match = lessonId.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getLessonScoreThresholds(lessonId: string) {
  const lessonNum = getLessonNumber(lessonId);
  const star3 = Math.min(30000, 18000 + lessonNum * 450);
  return {
    star1: Math.round(star3 / 6),
    star2: Math.round(star3 / 2),
    star3,
  };
}

export type ComboTier = typeof COMBO_TIERS[number];

interface GameState {
  // Active game state
  energy: number;
  score: number;
  combo: number;
  feverMeter: number;
  isFeverMode: boolean;
  feverTimeLeft: number;
  wrongKeyCount: number;
  missedCount: number;
  bombHitCount: number;

  // Power-ups
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number;
  hasShield: boolean;
  isSlowMo: boolean;

  // Session stats (for achievements)
  feverCount: number;
  maxCombo: number;
  crystalsCollected: number;
  powerupsCollected: string[];

  // Persistent progression
  highScores: Record<string, number>; // lessonId -> highScore
  totalGems: number;
  totalScore: number;
  gamesPlayed: number;
  unlockedAchievements: string[];
  achievementQueue: string[]; // Queue for popup display (multiple achievements)

  // Actions
  resetGame: () => void;
  popAchievementQueue: () => void; // Remove first from queue
  addScore: (points: number) => void;
  hitCrystal: (scoreMultiplier?: number, feverBonus?: number) => void;
  missedCrystal: () => void;
  wrongKey: () => void;
  hitBomb: () => void;
  activateFever: () => void;
  tickFever: (deltaMs: number) => void;
  activatePowerUp: (type: PowerUpType) => void;
  tickPowerUp: (deltaMs: number) => void;
  useShield: () => boolean; // Returns true if shield was used
  endGame: (lessonId: string) => { newHighScore: boolean; gemsEarned: number; stars: number; newAchievements: string[] };

  // Getters
  getCurrentComboTier: () => ComboTier;
  getScoreMultiplier: () => number;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial game state
      energy: GAME_CONFIG.startEnergy,
      score: 0,
      combo: 0,
      feverMeter: 0,
      isFeverMode: false,
      feverTimeLeft: 0,
      wrongKeyCount: 0,
      missedCount: 0,
      bombHitCount: 0,

      // Power-ups
      activePowerUp: null,
      powerUpTimeLeft: 0,
      hasShield: false,
      isSlowMo: false,

      // Session stats
      feverCount: 0,
      maxCombo: 0,
      crystalsCollected: 0,
      powerupsCollected: [],

      // Persistent state
      highScores: {},
      totalGems: 0,
      totalScore: 0,
      gamesPlayed: 0,
      unlockedAchievements: [],
      achievementQueue: [],

      resetGame: () => set({
        energy: GAME_CONFIG.startEnergy,
        score: 0,
        combo: 0,
        feverMeter: 0,
        isFeverMode: false,
        feverTimeLeft: 0,
        wrongKeyCount: 0,
        missedCount: 0,
        bombHitCount: 0,
        activePowerUp: null,
        powerUpTimeLeft: 0,
        hasShield: false,
        isSlowMo: false,
        // Reset session stats
        feverCount: 0,
        maxCombo: 0,
        crystalsCollected: 0,
        powerupsCollected: [],
      }),

      popAchievementQueue: () => set((state) => ({
        achievementQueue: state.achievementQueue.slice(1),
      })),

      addScore: (points) => set((state) => ({
        score: state.score + points,
      })),

      hitCrystal: (scoreMultiplier = 1, feverBonus = 0) => set((state) => {
        const comboMultiplier = get().getScoreMultiplier();
        const earnedPoints = Math.round(GAME_CONFIG.baseScore * scoreMultiplier * comboMultiplier);

        // Fever meter fills faster with higher combos
        const comboTier = get().getCurrentComboTier();
        const baseFeverGain = 3 + (comboTier.multiplier * 2);
        const totalFeverGain = baseFeverGain + feverBonus;

        const newCombo = state.combo + 1;

        return {
          score: state.score + earnedPoints,
          combo: newCombo,
          maxCombo: Math.max(state.maxCombo, newCombo),
          crystalsCollected: state.crystalsCollected + 1,
          energy: Math.min(GAME_CONFIG.maxEnergy, state.energy + GAME_CONFIG.energyPerHit),
          feverMeter: state.isFeverMode ? state.feverMeter : Math.min(100, state.feverMeter + totalFeverGain),
        };
      }),

      missedCrystal: () => set((state) => {
        // Shield protects from miss penalty
        if (state.hasShield) {
          return { hasShield: false, activePowerUp: null };
        }

        const energyLoss = state.isFeverMode
          ? GAME_CONFIG.energyLostOnMiss * GAME_CONFIG.feverEnergyLossReduction
          : GAME_CONFIG.energyLostOnMiss;

        return {
          combo: 0,
          energy: Math.max(0, state.energy - energyLoss),
          missedCount: state.missedCount + 1,
        };
      }),

      wrongKey: () => set((state) => {
        // Shield protects from wrong key penalty
        if (state.hasShield) {
          return { hasShield: false, activePowerUp: null };
        }

        const energyLoss = state.isFeverMode
          ? GAME_CONFIG.energyLostOnWrongKey * GAME_CONFIG.feverEnergyLossReduction
          : GAME_CONFIG.energyLostOnWrongKey;

        return {
          combo: 0,
          energy: Math.max(0, state.energy - energyLoss),
          wrongKeyCount: state.wrongKeyCount + 1,
        };
      }),

      hitBomb: () => set((state) => {
        // Shield protects from bomb
        if (state.hasShield) {
          return { hasShield: false, activePowerUp: null };
        }

        const energyLoss = state.isFeverMode
          ? GAME_CONFIG.energyLostOnBomb * GAME_CONFIG.feverEnergyLossReduction
          : GAME_CONFIG.energyLostOnBomb;

        return {
          combo: 0,
          energy: Math.max(0, state.energy - energyLoss),
          bombHitCount: state.bombHitCount + 1,
        };
      }),

      activateFever: () => set((state) => ({
        isFeverMode: true,
        feverTimeLeft: GAME_CONFIG.feverDuration,
        feverMeter: 0,
        feverCount: state.feverCount + 1,
      })),

      tickFever: (deltaMs) => set((state) => {
        if (!state.isFeverMode) return state;

        const newTimeLeft = state.feverTimeLeft - deltaMs;
        if (newTimeLeft <= 0) {
          return {
            isFeverMode: false,
            feverTimeLeft: 0,
          };
        }

        return { feverTimeLeft: newTimeLeft };
      }),

      activatePowerUp: (type) => set((state) => {
        const newPowerups = type ? [...state.powerupsCollected, type] : state.powerupsCollected;

        if (type === 'shield') {
          return { hasShield: true, activePowerUp: 'shield', powerUpTimeLeft: 0, powerupsCollected: newPowerups };
        }
        if (type === 'slowmo') {
          return { isSlowMo: true, activePowerUp: 'slowmo', powerUpTimeLeft: 5000, powerupsCollected: newPowerups };
        }
        if (type === 'magnet') {
          return { activePowerUp: null, powerUpTimeLeft: 0, powerupsCollected: newPowerups };
        }
        return {};
      }),

      tickPowerUp: (deltaMs) => set((state) => {
        if (!state.isSlowMo || state.powerUpTimeLeft <= 0) return state;

        const newTimeLeft = state.powerUpTimeLeft - deltaMs;
        if (newTimeLeft <= 0) {
          return {
            isSlowMo: false,
            activePowerUp: null,
            powerUpTimeLeft: 0,
          };
        }

        return { powerUpTimeLeft: newTimeLeft };
      }),

      useShield: () => {
        const state = get();
        if (state.hasShield) {
          set({ hasShield: false, activePowerUp: null });
          return true;
        }
        return false;
      },

      endGame: (lessonId) => {
        const state = get();
        const previousHighScore = state.highScores[lessonId] || 0;
        const newHighScore = state.score > previousHighScore;

        const thresholds = getLessonScoreThresholds(lessonId);

        // Calculate stars
        let stars = 0;
        if (state.score >= thresholds.star1) stars = 1;
        if (state.score >= thresholds.star2) stars = 2;
        if (state.score >= thresholds.star3) stars = 3;

        // Check achievements
        const newAchievements: string[] = [];
        const checkAchievement = (id: string, condition: boolean) => {
          if (condition && !state.unlockedAchievements.includes(id)) {
            newAchievements.push(id);
          }
        };

        // Combo achievements
        checkAchievement('combo_5', state.maxCombo >= 5);
        checkAchievement('combo_10', state.maxCombo >= 10);
        checkAchievement('combo_20', state.maxCombo >= 20);
        checkAchievement('combo_50', state.maxCombo >= 50);

        // Fever achievements
        checkAchievement('fever_first', state.feverCount >= 1);
        checkAchievement('fever_3', state.feverCount >= 3);

        // Score achievements
        checkAchievement('score_5000', state.score >= 5000);
        checkAchievement('score_10000', state.score >= 10000);
        checkAchievement('score_25000', state.score >= 25000);

        // Perfect game (no wrong keys)
        checkAchievement('perfect', state.wrongKeyCount === 0 && state.crystalsCollected >= 10);

        // Power-up achievements
        checkAchievement('shield_first', state.powerupsCollected.includes('shield'));
        checkAchievement('magnet_first', state.powerupsCollected.includes('magnet'));

        // Calculate achievement gem rewards
        const achievementGems = newAchievements.length > 0 ? newAchievements.reduce((sum) => sum + 25, 0) : 0;

        // Calculate base gems earned
        let gemsEarned = Math.floor(state.score / 1000);
        if (newHighScore) gemsEarned += 5;
        if (stars === 3) gemsEarned += 10;
        gemsEarned += achievementGems;

        const newGamesPlayed = state.gamesPlayed + 1;
        const newTotalScore = state.totalScore + state.score;

        // Milestone achievements (check with new totals)
        checkAchievement('total_100000', newTotalScore >= 100000);
        checkAchievement('games_10', newGamesPlayed >= 10);

        set((s) => ({
          highScores: newHighScore
            ? { ...s.highScores, [lessonId]: state.score }
            : s.highScores,
          totalGems: s.totalGems + gemsEarned,
          totalScore: newTotalScore,
          gamesPlayed: newGamesPlayed,
          unlockedAchievements: [...s.unlockedAchievements, ...newAchievements],
          achievementQueue: [...s.achievementQueue, ...newAchievements],
        }));

        return { newHighScore, gemsEarned, stars, newAchievements };
      },

      getCurrentComboTier: () => {
        const combo = get().combo;
        // Find highest tier that matches
        for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
          if (combo >= COMBO_TIERS[i].threshold) {
            return COMBO_TIERS[i];
          }
        }
        return COMBO_TIERS[0];
      },

      getScoreMultiplier: () => {
        const state = get();
        const comboMultiplier = get().getCurrentComboTier().multiplier;
        const feverMultiplier = state.isFeverMode ? GAME_CONFIG.feverMultiplier : 1;
        return comboMultiplier * feverMultiplier;
      },
    }),
    {
      name: 'lettoria-game-store',
      partialize: (state) => ({
        highScores: state.highScores,
        totalGems: state.totalGems,
        totalScore: state.totalScore,
        gamesPlayed: state.gamesPlayed,
        unlockedAchievements: state.unlockedAchievements,
      }),
    }
  )
);
