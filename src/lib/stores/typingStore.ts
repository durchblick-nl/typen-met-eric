import { create } from "zustand";

export interface KeyStat {
  attempts: number;
  errors: number;
}
export function getStars(correct: number, attempts: number): number {
  const accuracy = attempts > 0 ? correct / attempts : 0;
  return accuracy >= 0.95 ? 3 : accuracy >= 0.85 ? 2 : 1;
}

interface TypingState {
  targetText: string;
  currentIndex: number;
  typedChars: string[];
  errors: number[]; // Target positions at which a wrong attempt occurred (including retries).
  keyStats: Record<string, KeyStat>;
  lastWrong: boolean;
  startTime: number | null;
  lastKeyTime: number | null;
  activeMs: number;
  wpm: number | null;
  accuracy: number;
  isActive: boolean;
  isComplete: boolean;
  isPaused: boolean;
  setTargetText: (text: string) => void;
  handleKeyPress: (key: string) => void;
  setPaused: (paused: boolean) => void;
  reset: () => void;
}
const initial = {
  currentIndex: 0,
  typedChars: [] as string[],
  errors: [] as number[],
  keyStats: {} as Record<string, KeyStat>,
  lastWrong: false,
  startTime: null,
  lastKeyTime: null,
  activeMs: 0,
  wpm: null,
  accuracy: 100,
  isActive: false,
  isComplete: false,
  isPaused: false,
};
export const useTypingStore = create<TypingState>((set, get) => ({
  ...initial,
  targetText: "",
  setTargetText: (text) => set({ ...initial, targetText: text }),
  handleKeyPress: (key) => {
    const state = get();
    if (state.isComplete || state.isPaused || !state.targetText) return;
    const now = Date.now();
    const expected = state.targetText[state.currentIndex];
    const correct = key === expected;
    const previous = state.keyStats[expected] || { attempts: 0, errors: 0 };
    const delta =
      state.lastKeyTime === null ? 0 : Math.max(0, now - state.lastKeyTime);
    // Long idle gaps and explicit pauses are excluded from active typing time.
    const activeMs = state.activeMs + (delta <= 10000 ? delta : 0);
    const currentIndex = state.currentIndex + (correct ? 1 : 0);
    const typedChars = [...state.typedChars, key];
    const complete = currentIndex >= state.targetText.length;
    set({
      typedChars,
      currentIndex,
      activeMs,
      lastKeyTime: now,
      startTime: state.startTime ?? now,
      lastWrong: !correct,
      errors: correct ? state.errors : [...state.errors, state.currentIndex],
      keyStats: {
        ...state.keyStats,
        [expected]: {
          attempts: previous.attempts + 1,
          errors: previous.errors + (correct ? 0 : 1),
        },
      },
      isComplete: complete,
      isActive: !complete,
      accuracy: (currentIndex / typedChars.length) * 100,
      wpm:
        activeMs >= 15000 && currentIndex >= 20
          ? Math.round(currentIndex / 5 / (activeMs / 60000))
          : null,
    });
  },
  setPaused: (isPaused) =>
    set({
      isPaused,
      lastKeyTime: null,
      isActive: !isPaused && get().currentIndex > 0 && !get().isComplete,
    }),
  reset: () => set({ ...initial }),
}));
