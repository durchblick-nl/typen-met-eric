// Race game ability system: maps learned letters to movement abilities

export interface AbilityConfig {
  action: string;
  label: string;
  icon: string;
  minLesson: number;
  cooldown: number; // ms, 0 = no cooldown
  duration: number; // ms, 0 = instant
}

// Movement keys — these letters become abilities instead of obstacle-letters
export const MOVEMENT_KEYS: Record<string, AbilityConfig> = {
  'f': { action: 'move_left', label: 'Links', icon: '←', minLesson: 0, cooldown: 0, duration: 0 },
  'j': { action: 'move_right', label: 'Rechts', icon: '→', minLesson: 0, cooldown: 0, duration: 0 },
  's': { action: 'slow', label: 'Slow', icon: '⏱', minLesson: 2, cooldown: 8000, duration: 2000 },
  'l': { action: 'sprint', label: 'Snel', icon: '⚡', minLesson: 2, cooldown: 8000, duration: 2000 },
  'd': { action: 'dash_left', label: 'Dash ←', icon: '⇐', minLesson: 3, cooldown: 0, duration: 400 },
  'k': { action: 'dash_right', label: 'Dash →', icon: '⇒', minLesson: 3, cooldown: 0, duration: 400 },
  ' ': { action: 'jump', label: 'Spring', icon: '⬆', minLesson: 5, cooldown: 0, duration: 600 },
};

export type ObstacleType = 'letter' | 'bomb' | 'gem' | 'gold' | 'ice';

export interface RaceConfig {
  abilities: Record<string, AbilityConfig>; // unlocked movement abilities
  lockedAbilities: Record<string, AbilityConfig>; // visible but locked
  obstacleLetters: string[]; // letters that appear on obstacles
}

// Extract lesson number from lessonId like "les-1" -> 1, "les-0" -> 0
function getLessonNumber(lessonId: string): number {
  const match = lessonId.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Given the available letters for a lesson, compute:
 * - Which movement abilities are unlocked
 * - Which movement abilities are visible but locked
 * - Which letters become obstacle letters (to appear on blocks)
 */
export function getRaceConfig(availableLetters: string[], lessonId: string): RaceConfig {
  const lessonNum = getLessonNumber(lessonId);
  const lowerLetters = new Set(availableLetters.map(l => l.toLowerCase()));

  const abilities: Record<string, AbilityConfig> = {};
  const lockedAbilities: Record<string, AbilityConfig> = {};
  const movementKeySet = new Set<string>();

  // Check each movement key
  for (const [key, config] of Object.entries(MOVEMENT_KEYS)) {
    if (lessonNum >= config.minLesson && (key === ' ' || lowerLetters.has(key))) {
      abilities[key] = config;
      movementKeySet.add(key);
    } else {
      // Show as locked if the letter is known but lesson too early,
      // or if it's a future ability
      lockedAbilities[key] = config;
    }
  }

  // Obstacle letters = available letters minus movement keys
  const obstacleLetters = availableLetters
    .map(l => l.toLowerCase())
    .filter(l => !movementKeySet.has(l));

  return { abilities, lockedAbilities, obstacleLetters };
}

// Lane positions for the 3-lane system (percentage from left)
export const LANE_POSITIONS = [22, 50, 78];
export const LANE_COUNT = 3;
