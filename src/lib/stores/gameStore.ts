import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Power-up types
export type PowerUpType = 'shield' | 'slowmo' | 'magnet' | null;

// Combo thresholds and multipliers
export const COMBO_TIERS = [
  { threshold: 0, multiplier: 1, name: null },
  { threshold: 5, multiplier: 2, name: 'Nice!' },
  { threshold: 10, multiplier: 3, name: 'Super!' },
  { threshold: 20, multiplier: 4, name: 'Awesome!' },
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

  // Stars (score thresholds)
  star1Threshold: 5000,
  star2Threshold: 15000,
  star3Threshold: 30000,
} as const;

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

  // Power-ups
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number;
  hasShield: boolean;
  isSlowMo: boolean;

  // Persistent progression
  highScores: Record<string, number>; // lessonId -> highScore
  totalGems: number;
  totalScore: number;

  // Actions
  resetGame: () => void;
  hitCrystal: (scoreMultiplier?: number, feverBonus?: number) => void;
  missedCrystal: () => void;
  wrongKey: () => void;
  hitBomb: () => void;
  activateFever: () => void;
  tickFever: (deltaMs: number) => void;
  activatePowerUp: (type: PowerUpType) => void;
  tickPowerUp: (deltaMs: number) => void;
  useShield: () => boolean; // Returns true if shield was used
  endGame: (lessonId: string) => { newHighScore: boolean; gemsEarned: number; stars: number };

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

      // Power-ups
      activePowerUp: null,
      powerUpTimeLeft: 0,
      hasShield: false,
      isSlowMo: false,

      // Persistent state
      highScores: {},
      totalGems: 0,
      totalScore: 0,

      resetGame: () => set({
        energy: GAME_CONFIG.startEnergy,
        score: 0,
        combo: 0,
        feverMeter: 0,
        isFeverMode: false,
        feverTimeLeft: 0,
        wrongKeyCount: 0,
        activePowerUp: null,
        powerUpTimeLeft: 0,
        hasShield: false,
        isSlowMo: false,
      }),

      hitCrystal: (scoreMultiplier = 1, feverBonus = 0) => set((state) => {
        const comboMultiplier = get().getScoreMultiplier();
        const earnedPoints = Math.round(GAME_CONFIG.baseScore * scoreMultiplier * comboMultiplier);

        // Fever meter fills faster with higher combos
        const comboTier = get().getCurrentComboTier();
        const baseFeverGain = 3 + (comboTier.multiplier * 2);
        const totalFeverGain = baseFeverGain + feverBonus;

        return {
          score: state.score + earnedPoints,
          combo: state.combo + 1,
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
        };
      }),

      activateFever: () => set({
        isFeverMode: true,
        feverTimeLeft: GAME_CONFIG.feverDuration,
        feverMeter: 0,
      }),

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

      activatePowerUp: (type) => set(() => {
        if (type === 'shield') {
          return { hasShield: true, activePowerUp: 'shield', powerUpTimeLeft: 0 };
        }
        if (type === 'slowmo') {
          return { isSlowMo: true, activePowerUp: 'slowmo', powerUpTimeLeft: 5000 }; // 5 seconds
        }
        if (type === 'magnet') {
          // Magnet is instant, no duration
          return { activePowerUp: null, powerUpTimeLeft: 0 };
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

        // Calculate stars
        let stars = 0;
        if (state.score >= GAME_CONFIG.star1Threshold) stars = 1;
        if (state.score >= GAME_CONFIG.star2Threshold) stars = 2;
        if (state.score >= GAME_CONFIG.star3Threshold) stars = 3;

        // Calculate gems earned
        let gemsEarned = Math.floor(state.score / 1000);
        if (newHighScore) gemsEarned += 5;
        if (stars === 3) gemsEarned += 10;

        set((s) => ({
          highScores: newHighScore
            ? { ...s.highScores, [lessonId]: state.score }
            : s.highScores,
          totalGems: s.totalGems + gemsEarned,
          totalScore: s.totalScore + state.score,
        }));

        return { newHighScore, gemsEarned, stars };
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
      }),
    }
  )
);
