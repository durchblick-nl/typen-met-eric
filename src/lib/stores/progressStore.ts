import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  // Completed lessons
  completedLessons: number[];
  currentLesson: number;

  // Stats
  totalStars: number;
  lessonStars: Record<number, number>; // lessonId -> stars (1-3)

  // Streak
  currentStreak: number;
  lastPlayedDate: string | null;

  // Actions
  completeLesson: (lessonId: number, stars: number) => void;
  setCurrentLesson: (lessonId: number) => void;
  updateStreak: () => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      currentLesson: 0,
      totalStars: 0,
      lessonStars: {},
      currentStreak: 0,
      lastPlayedDate: null,

      completeLesson: (lessonId: number, stars: number) => {
        const state = get();
        const alreadyCompleted = state.completedLessons.includes(lessonId);
        const previousStars = state.lessonStars[lessonId] || 0;

        // Only add stars if better than before
        const starDiff = Math.max(0, stars - previousStars);

        set({
          completedLessons: alreadyCompleted
            ? state.completedLessons
            : [...state.completedLessons, lessonId],
          lessonStars: {
            ...state.lessonStars,
            [lessonId]: Math.max(previousStars, stars),
          },
          totalStars: state.totalStars + starDiff,
          currentLesson: lessonId + 1,
        });

        // Update streak
        get().updateStreak();
      },

      setCurrentLesson: (lessonId: number) => {
        set({ currentLesson: lessonId });
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastPlayed = state.lastPlayedDate;

        if (lastPlayed === today) {
          // Already played today
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPlayed === yesterday.toDateString()) {
          // Played yesterday, increment streak
          set({
            currentStreak: state.currentStreak + 1,
            lastPlayedDate: today,
          });
        } else {
          // Streak broken or first time
          set({
            currentStreak: 1,
            lastPlayedDate: today,
          });
        }
      },

      reset: () => {
        set({
          completedLessons: [],
          currentLesson: 0,
          totalStars: 0,
          lessonStars: {},
          currentStreak: 0,
          lastPlayedDate: null,
        });
      },
    }),
    {
      name: 'typen-met-eric-progress',
    }
  )
);
