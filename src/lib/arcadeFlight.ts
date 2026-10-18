import { t } from '@/lib/i18n';
import { REGIONS } from "./data/regions";
export const ARCADE_DURATION_MS = 75000;
export const ARCADE_TARGET_DEPTH = 0.72;
export type ArcadeChallenge = "gem" | "rock";
export interface ArcadeObject {
  id: number;
  lane: number;
  kind: "letter";
  challenge: ArcadeChallenge;
  depth: number;
  key: string;
}
export interface ArcadeCourse {
  lessonId: number;
  title: string;
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
  laneFrom: number;
  laneChangedAt: number;
  score: number;
  streak: number;
  bestStreak: number;
  hits: number;
  attempts: number;
  collected: number;
  turboUntil: number;
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
    title: lessons.find((lesson) => lesson.id === lessonId)?.title || "",
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
    laneFrom: 1,
    laneChangedAt: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hits: 0,
    attempts: 0,
    collected: 0,
    turboUntil: 0,
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
        challenge: "gem",
        depth: 0.16,
        key: course.focusKeys[0] || course.keys[0],
      },
    ],
    feedback: null,
    shot: null,
  };
}
/** Automatic travel uses the simulation clock, so pausing freezes the whole flight. */
export function arcadePlayerLane(state: ArcadeState): number {
  const progress = Math.min(1, Math.max(0, (state.elapsedMs - state.laneChangedAt) / 240));
  const eased = progress * progress * (3 - 2 * progress);
  return state.laneFrom + (state.lane - state.laneFrom) * eased;
}

/** Stable coaching: the oldest visible target stays available until it is typed. */
export function nextArcadeTarget(objects: ArcadeObject[]): ArcadeObject | undefined {
  return objects.reduce<ArcadeObject | undefined>((first, object) =>
    !first || object.id < first.id ? object : first, undefined);
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
        object.depth <= ARCADE_TARGET_DEPTH,
    )
    .sort((a, b) => b.depth - a.depth)[0];
  if (!target)
    return {
      ...state,
      attempts: state.attempts + 1,
      streak: 0,
      feedback: {
        text: t("Probeer het zichtbare teken nog eens. Je kunt het!"),
        kind: "hint",
        until: state.elapsedMs + 1100,
      },
    };
  const streak = state.streak + 1;
  const points =
    150 *
    Math.min(3, 1 + Math.floor(streak / 4)) *
    (arcadeTurbo(state) ? 2 : 1);
  const triggerTurbo = streak % 6 === 0;
  return {
    ...state,
    laneFrom: arcadePlayerLane(state),
    lane: target.lane,
    laneChangedAt: state.elapsedMs,
    score: state.score + points,
    collected: state.collected + (target.challenge === "gem" ? 1 : 0),
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
        ? t("TURBO! Je tekens geven dubbele punten!")
        : target.challenge === "rock"
          ? t("Rots opgelost! +{points}", { points })
          : t("Kristal gepakt! +{points}", { points }),
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
  // Targets approach and wait. Neither a pause, a wrong key nor slow typing
  // can discard a target or award points through passive survival/collisions.
  next.objects = state.objects.map(object => ({
    ...object,
    depth: Math.min(ARCADE_TARGET_DEPTH, object.depth + (delta / course.travelMs) * speed),
  }));
  next.ended = next.elapsedMs >= ARCADE_DURATION_MS;
  if (!next.ended && next.elapsedMs >= next.nextSpawn) {
    const occupiedKeys = new Set(next.objects.map(object => object.key));
    const occupiedLanes = new Set(next.objects.map(object => object.lane));
    const lanes = [0, 1, 2].filter(lane => !occupiedLanes.has(lane));
    const preferred = [...course.focusKeys, ...course.keys].filter(key => !occupiedKeys.has(key));
    if (next.objects.length < 3 && preferred.length && lanes.length) {
      const lane = lanes[Math.floor(random(next) * lanes.length)];
      const key = preferred[Math.floor(random(next) * preferred.length)];
      next.objects.push({
        id: next.nextId++, lane, kind: "letter", key, depth: 0,
        // Introduce the crystal target first; rocks are also resolved by typing.
        challenge: next.wave < 3 || next.wave % 3 === 0 ? "gem" : "rock",
      });
      next.wave++;
    }
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
