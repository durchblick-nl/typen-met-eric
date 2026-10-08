import { REGIONS } from "./data/regions";
export const ARCADE_DURATION_MS = 75000;
export const ARCADE_HIT_DEPTH = 0.86;
export type ArcadeKind = "letter" | "gem" | "rock";
export interface ArcadeObject {
  id: number;
  lane: number;
  kind: ArcadeKind;
  depth: number;
  key?: string;
}
export interface ArcadeCourse {
  lessonId: number;
  name: string;
  regionId: string;
  keys: string[];
  focusKeys: string[];
  travelMs: number;
  spawnMs: number;
  difficulty: number;
}
export interface ArcadeState {
  elapsedMs: number;
  lane: number;
  hearts: number;
  score: number;
  streak: number;
  bestStreak: number;
  hits: number;
  attempts: number;
  collected: number;
  missed: number;
  turboUntil: number;
  invulnerableUntil: number;
  nextSpawn: number;
  wave: number;
  nextId: number;
  rng: number;
  ended: boolean;
  objects: ArcadeObject[];
  feedback: {
    text: string;
    until: number;
    kind: "good" | "hint" | "hit";
  } | null;
  shot: { lane: number; depth: number; until: number } | null;
}
export function arcadeCourse(lessonId: number): ArcadeCourse {
  const lessons = REGIONS.flatMap((region) => region.lessons).filter(
    (lesson) => lesson.id <= lessonId,
  );
  const region =
    REGIONS.find((region) =>
      region.lessons.some((lesson) => lesson.id === lessonId),
    ) || REGIONS[0];
  const difficulty = Math.min(5, Math.floor(lessonId / 5));
  return {
    lessonId,
    name: region.name,
    regionId: region.id,
    keys: [...new Set(lessons.flatMap((lesson) => lesson.newKeys))],
    focusKeys: lessons.find((lesson) => lesson.id === lessonId)?.newKeys || [],
    travelMs: Math.max(4300, 6200 - lessonId * 70),
    spawnMs: Math.max(1200, 1650 - lessonId * 16),
    difficulty,
  };
}
export function newArcade(
  course: ArcadeCourse,
  seed = Date.now(),
): ArcadeState {
  return {
    elapsedMs: 0,
    lane: 1,
    hearts: 3,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hits: 0,
    attempts: 0,
    collected: 0,
    missed: 0,
    turboUntil: 0,
    invulnerableUntil: 0,
    nextSpawn: 900,
    wave: 0,
    nextId: 2,
    rng: seed >>> 0,
    ended: false,
    objects: [
      {
        id: 1,
        lane: 1,
        kind: "letter",
        depth: 0.16,
        key: course.focusKeys[0] || course.keys[0],
      },
    ],
    feedback: null,
    shot: null,
  };
}
export function moveArcade(state: ArcadeState, direction: -1 | 1): ArcadeState {
  return state.ended
    ? state
    : { ...state, lane: Math.max(0, Math.min(2, state.lane + direction)) };
}
function random(state: ArcadeState): number {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}
export function arcadeTurbo(state: ArcadeState): boolean {
  return state.turboUntil > state.elapsedMs;
}
export function typeArcade(state: ArcadeState, key: string): ArcadeState {
  if (state.ended) return state;
  const target = state.objects
    .filter(
      (object) =>
        object.kind === "letter" &&
        object.key === key &&
        object.depth >= 0 &&
        object.depth < ARCADE_HIT_DEPTH,
    )
    .sort((a, b) => b.depth - a.depth)[0];
  if (!target)
    return {
      ...state,
      attempts: state.attempts + 1,
      streak: 0,
      feedback: {
        text: "Typ een letter die je op de baan ziet.",
        kind: "hint",
        until: state.elapsedMs + 1100,
      },
    };
  const streak = state.streak + 1;
  const perfect = target.depth >= 0.65;
  const points =
    (100 + (perfect ? 50 : 0)) *
    Math.min(3, 1 + Math.floor(streak / 4)) *
    (arcadeTurbo(state) ? 2 : 1);
  const triggerTurbo = streak % 6 === 0;
  return {
    ...state,
    score: state.score + points,
    hits: state.hits + 1,
    attempts: state.attempts + 1,
    streak,
    bestStreak: Math.max(streak, state.bestStreak),
    objects: state.objects.filter((object) => object.id !== target.id),
    turboUntil: triggerTurbo ? state.elapsedMs + 5500 : state.turboUntil,
    shot: {
      lane: target.lane,
      depth: target.depth,
      until: state.elapsedMs + 180,
    },
    feedback: {
      text: triggerTurbo
        ? "TURBO! Dubbele punten en een magisch schild!"
        : perfect
          ? `Perfect! +${points}`
          : `Raak! +${points}`,
      kind: "good",
      until: state.elapsedMs + 1300,
    },
  };
}
export function advanceArcade(
  state: ArcadeState,
  deltaMs: number,
  course: ArcadeCourse,
): ArcadeState {
  if (state.ended || deltaMs <= 0) return state;
  // Limit recovery after a stalled frame. Pause/resume starts with a fresh timestamp.
  const delta = Math.min(250, deltaMs);
  const next: ArcadeState = {
    ...state,
    elapsedMs: Math.min(ARCADE_DURATION_MS, state.elapsedMs + delta),
    objects: [],
  };
  const turbo = arcadeTurbo(next);
  const speed =
    (1 + (next.elapsedMs / ARCADE_DURATION_MS) * 0.35) * (turbo ? 1.22 : 1);
  for (const object of state.objects) {
    const moved = {
      ...object,
      depth: object.depth + (delta / course.travelMs) * speed,
    };
    if (object.depth < ARCADE_HIT_DEPTH && moved.depth >= ARCADE_HIT_DEPTH) {
      if (object.kind === "letter") {
        next.missed++;
        next.streak = 0;
        continue;
      }
      if (object.kind === "gem" && object.lane === next.lane) {
        next.collected++;
        next.score += turbo ? 50 : 25;
        next.feedback = {
          text: turbo ? "Kristal! +50" : "Kristal! +25",
          kind: "good",
          until: next.elapsedMs + 900,
        };
      }
      if (
        object.kind === "rock" &&
        object.lane === next.lane &&
        !turbo &&
        next.elapsedMs >= next.invulnerableUntil
      ) {
        next.hearts--;
        next.streak = 0;
        next.invulnerableUntil = next.elapsedMs + 1800;
        next.feedback = {
          text: "Een rots! Wissel van baan met ← of →.",
          kind: "hit",
          until: next.elapsedMs + 1400,
        };
      }
    }
    if (moved.depth < 1.08) next.objects.push(moved);
  }
  next.ended = next.hearts <= 0 || next.elapsedMs >= ARCADE_DURATION_MS;
  if (!next.ended && next.elapsedMs >= next.nextSpawn) {
    const lane = Math.floor(random(next) * 3);
    const occupiedKeys = new Set(
      next.objects
        .filter(
          (object) =>
            object.kind === "letter" && object.depth < ARCADE_HIT_DEPTH,
        )
        .map((object) => object.key),
    );
    const preferred = [...course.focusKeys, ...course.keys].filter(
      (key) => !occupiedKeys.has(key),
    );
    if (occupiedKeys.size < 3 && preferred.length) {
      const key = preferred[Math.floor(random(next) * preferred.length)];
      next.objects.push({
        id: next.nextId++,
        lane,
        kind: "letter",
        depth: 0,
        key,
      });
    }
    const otherLane = (lane + 1 + Math.floor(random(next) * 2)) % 3;
    // First seconds teach typing and crystal collection; rocks arrive afterwards.
    const kind: ArcadeKind =
      next.wave < 3 || next.wave % 3 === 0 ? "gem" : "rock";
    next.objects.push({ id: next.nextId++, lane: otherLane, kind, depth: 0 });
    next.wave++;
    next.nextSpawn = next.elapsedMs + course.spawnMs;
  }
  return next;
}
export function arcadeReward(
  hits: number,
  completed: boolean,
  collected = 0,
): number {
  return (
    Math.min(24, Math.max(0, collected) + Math.floor(hits / 3)) +
    (completed && hits >= 3 ? 2 : 0)
  );
}
export function arcadePosition(lane: number, depth: number) {
  const perspective = 0.25 + Math.max(0, depth) * 0.75;
  return {
    x: 50 + (lane - 1) * 28 * perspective,
    y: 20 + depth * 70,
    scale: 0.45 + depth * 0.7,
  };
}
