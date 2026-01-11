import { create } from 'zustand';

interface TypingState {
  // Current exercise
  targetText: string;
  currentIndex: number;
  typedChars: string[];
  errors: number[];

  // Stats
  startTime: number | null;
  wpm: number;
  accuracy: number;

  // State
  isActive: boolean;
  isComplete: boolean;

  // Actions
  setTargetText: (text: string) => void;
  handleKeyPress: (key: string) => void;
  reset: () => void;
  calculateStats: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  targetText: '',
  currentIndex: 0,
  typedChars: [],
  errors: [],
  startTime: null,
  wpm: 0,
  accuracy: 100,
  isActive: false,
  isComplete: false,

  setTargetText: (text: string) => {
    set({
      targetText: text,
      currentIndex: 0,
      typedChars: [],
      errors: [],
      startTime: null,
      wpm: 0,
      accuracy: 100,
      isActive: false,
      isComplete: false,
    });
  },

  handleKeyPress: (key: string) => {
    const state = get();

    if (state.isComplete) return;

    // Start timer on first keypress
    if (!state.startTime) {
      set({ startTime: Date.now(), isActive: true });
    }

    const expectedChar = state.targetText[state.currentIndex];
    const isCorrect = key === expectedChar;

    const newTypedChars = [...state.typedChars, key];
    const newErrors = isCorrect
      ? state.errors
      : [...state.errors, state.currentIndex];

    const newIndex = state.currentIndex + 1;
    const isComplete = newIndex >= state.targetText.length;

    set({
      typedChars: newTypedChars,
      errors: newErrors,
      currentIndex: newIndex,
      isComplete,
      isActive: !isComplete,
    });

    // Calculate stats after update
    get().calculateStats();
  },

  calculateStats: () => {
    const state = get();

    if (!state.startTime || state.typedChars.length === 0) return;

    const elapsedMinutes = (Date.now() - state.startTime) / 60000;
    const wordsTyped = state.typedChars.length / 5; // Standard: 5 chars = 1 word
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;

    const correctChars = state.typedChars.length - state.errors.length;
    const accuracy = state.typedChars.length > 0
      ? Math.round((correctChars / state.typedChars.length) * 100)
      : 100;

    set({ wpm, accuracy });
  },

  reset: () => {
    const state = get();
    set({
      currentIndex: 0,
      typedChars: [],
      errors: [],
      startTime: null,
      wpm: 0,
      accuracy: 100,
      isActive: false,
      isComplete: false,
    });
  },
}));
