import { REGIONS } from "./data/regions";
export const FLIGHT_DURATION_MS = 60000;
export const FLIGHT_GOAL = 40;
export const MAGIC_WORDS = [
  "jas",
  "sla",
  "als",
  "las",
  "laf",
  "sjaal",
  "alfa",
  "dak",
  "kas",
  "dal",
  "lak",
  "kaal",
  "kaas",
  "klas",
  "slak",
  "daad",
  "kalk",
  "dag",
  "had",
  "haas",
  "glas",
  "glad",
  "laag",
  "hals",
  "slag",
  "hal",
  "haag",
  "de",
  "die",
  "held",
  "heks",
  "dijk",
  "ik",
  "eis",
  "gids",
  "gek",
  "leid",
  "hak",
  "hei",
  "deur",
  "rug",
  "uur",
  "ruil",
  "ruis",
  "hier",
  "reis",
  "dier",
  "draak",
  "huis",
  "tuin",
  "uit",
  "tijd",
  "tot",
  "paard",
  "poes",
  "poot",
  "oor",
  "loop",
  "warm",
  "water",
  "woud",
  "zee",
  "zon",
  "maan",
  "man",
  "naam",
  "mix",
  "taxi",
  "nee",
  "niet",
  "kan",
  "komen",
  "kom",
  "vuur",
  "magie",
  "vlieg",
  "boom",
  "bos",
  "boek",
  "kasteel",
  "toets",
  "drie",
  "zes",
  "acht",
  "type",
  "yoga",
  "pyjama",
  "quiz",
] as const;
export interface FlightState {
  correct: number;
  attempts: number;
  streak: number;
  bestStreak: number;
  score: number;
  tokenIndex: number;
  charIndex: number;
  wrong: boolean;
}
export const initialFlight: FlightState = {
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  score: 0,
  tokenIndex: 0,
  charIndex: 0,
  wrong: false,
};
export function flightTargets(lessonId: number): string[] {
  const lessons = REGIONS.flatMap((region) => region.lessons).filter(
    (lesson) => lesson.id <= lessonId,
  );
  const letters = [...new Set(lessons.flatMap((lesson) => lesson.newKeys))];
  const focusKeys =
    lessons.find((lesson) => lesson.id === lessonId)?.newKeys || [];
  // Letter drills such as "jjff" are not words. Keep the word pool explicitly Dutch.
  const words = MAGIC_WORDS.filter((word) =>
    [...word].every((key) => letters.includes(key)),
  );
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return Array.from({ length: FLIGHT_GOAL }, (_, i) =>
    lessonId >= 2 && words.length && i % 3 === 2
      ? words[Math.floor(Math.random() * words.length)]
      : focusKeys.length && i % 4 < 2
        ? focusKeys[i % focusKeys.length]
        : shuffled[i % shuffled.length],
  );
}
export function typeFlight(
  state: FlightState,
  key: string,
  targets: string[],
): FlightState {
  if (state.correct >= FLIGHT_GOAL) return state;
  if (key !== targets[state.tokenIndex]?.[state.charIndex])
    return { ...state, attempts: state.attempts + 1, streak: 0, wrong: true };
  const streak = state.streak + 1;
  const completedToken =
    state.charIndex + 1 === targets[state.tokenIndex].length;
  return {
    ...state,
    correct: state.correct + 1,
    attempts: state.attempts + 1,
    streak,
    bestStreak: Math.max(streak, state.bestStreak),
    score: state.score + 10 + Math.min(10, Math.floor(streak / 5) * 2),
    tokenIndex: state.tokenIndex + (completedToken ? 1 : 0),
    charIndex: completedToken ? 0 : state.charIndex + 1,
    wrong: false,
  };
}
export function flightReward(correct: number): number {
  return (
    Math.floor(Math.min(FLIGHT_GOAL, Math.max(0, correct)) / 5) +
    (correct >= FLIGHT_GOAL ? 2 : 0)
  );
}
export function flightElapsed(
  elapsed: number,
  previous: number,
  now: number,
): number {
  return Math.min(FLIGHT_DURATION_MS, elapsed + Math.max(0, now - previous));
}
export const GROT_DECORATIONS = [
  { id: "plant", name: "Magische plant", icon: "🌿", cost: 8 },
  { id: "lantern", name: "Gouden lantaarn", icon: "🏮", cost: 16 },
  { id: "stars", name: "Sterrenhemel", icon: "✨", cost: 24 },
] as const;
