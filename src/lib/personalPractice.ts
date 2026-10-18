import { COURSE, type CourseId } from './course';
import { REGIONS, type Region } from './data/regions';
import { reviewText } from './data/practiceSequence';
import { keyGuidance } from './keyboards';
import type { KeyStat } from './stores/typingStore';

export interface PersonalPracticePlan {
  keys: string[];
  exercises: string[];
  baseline: Record<string, KeyStat>;
}

/** Choose error-bearing keys, not a diagnosis of mastery. Historical aggregates
 * contain no recency or finger-use information. Freeze this plan for one round.
 */
export function personalPractice(
  stats: Record<string, KeyStat>,
  stars: Record<number, number>,
  variant = 0,
  regions: Region[] = REGIONS,
  course: CourseId = COURSE,
): PersonalPracticePlan {
  const learned = new Set<string>();
  for (const lesson of regions.flatMap(region => region.lessons)) {
    lesson.newKeys.forEach(key => learned.add(key));
    // Include the current reachable lesson, but never skip a gap in mastery.
    if ((stars[lesson.id] || 0) < 3) break;
  }
  const keys = Object.keys(stats).filter(key => {
    const stat = stats[key];
    return !!stat && learned.has(key) && !!keyGuidance(key, course)
      && Number.isSafeInteger(stat.attempts) && Number.isSafeInteger(stat.errors)
      && stat.attempts > 0 && stat.errors > 0 && stat.errors <= stat.attempts;
  }).sort((a, b) => stats[b].errors / stats[b].attempts - stats[a].errors / stats[a].attempts
    || stats[b].errors - stats[a].errors || a.localeCompare(b)).slice(0, 3);
  return {
    keys,
    exercises: keys.length ? Array.from({ length: 3 }, (_, index) => reviewText(keys, learned, course, variant + index)) : [],
    baseline: Object.fromEntries(keys.map(key => [key, { ...stats[key] }])),
  };
}

export function mergePracticeStats(a: Record<string, KeyStat>, b: Record<string, KeyStat>): Record<string, KeyStat> {
  const next = { ...a };
  for (const [key, stat] of Object.entries(b)) {
    const old = next[key] || { attempts: 0, errors: 0 };
    next[key] = { attempts: old.attempts + stat.attempts, errors: old.errors + stat.errors };
  }
  return next;
}
