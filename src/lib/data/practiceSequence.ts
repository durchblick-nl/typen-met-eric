import type { CourseId } from '../course';
import type { Region } from './regions';
import { finalStory } from './finalStory';

export type PracticeKind = 'movement' | 'mix' | 'practice' | 'review' | 'story';
export interface PracticeStep {
  kind: PracticeKind;
  /** Introduction being revisited; this is lesson spacing, not elapsed days. */
  reviewOf?: number;
}

// Editorial spacing choices, not experimentally established mastery thresholds.
export const REVIEW_GAPS = [2, 5, 9] as const;

function reviewVisits(introduction: number, last: number): number[] {
  const visits = new Set(REVIEW_GAPS.map(gap => Math.min(last, introduction + gap)));
  for (let position = last; visits.size < 3 && position > introduction; position--) visits.add(position);
  return [...visits].filter(position => position > introduction).sort((a, b) => a - b);
}

const WORDS = {
  nl: ['juf', 'jas', 'dak', 'klas', 'glas', 'hal', 'slak', 'kaas', 'de fee', 'het ei', 'de uil', 'de rust', 'tijd', 'opa', 'de poes', 'quiz', 'quasi', 'water', 'de wolk', 'de maan', 'yoga', 'een baby', 'de lynx', 'een mix', 'de taxi', 'de heks', 'eric', 'vier', 'de beer', 'de boom', 'de zee', 'de zon', 'wij zijn blij.', 'eric vliegt, de magie is terug.'],
  de: ['das', 'fass', 'glas', 'hals', 'die fee', 'das eis', 'die uhr', 'die ruhe', 'zeit', 'die katze', 'opa', 'die tür', 'quark', 'die quelle', 'wasser', 'die wolke', 'yoga', 'das baby', 'der typ', 'max', 'die hexe', 'das taxi', 'die hände', 'die mäuse', 'vier', 'eric', 'der bär', 'das boot', 'die straße', 'groß', 'weiß', 'eric fliegt, die magie ist da.'],
};

/** A short retrieval task: real words when available, explicit drills otherwise.
 * Never alter spelling to force a word onto a different keyboard layout.
 */
export function reviewText(keys: string[], learned: ReadonlySet<string>, course: CourseId, variant = 0): string {
  const german = course === 'de' || course === 'ch';
  const authored = WORDS[german ? 'de' : 'nl'];
  const candidates = [...authored, ...authored.flatMap(text => text.split(' ').map(word => word[0].toUpperCase() + word.slice(1)))];
  const words = [...new Set(candidates)].map(word => course === 'ch' ? word.replace(/ß/g, 'ss') : word)
    .filter(word => [...word].every(char => learned.has(char)));
  const parts = keys.map(key => {
    if (key === ' ') return 'f j';
    const matches = words.filter(word => word.includes(key));
    // Different combinations on later visits, including for digits/punctuation.
    return matches.length ? matches[variant % matches.length] : variant % 2 ? `j${key}f${key}` : `${key}f${key}j`;
  });
  return [...new Set(parts)].join(learned.has(' ') ? ' ' : '');
}

/** Add explicit movement/mixing steps and guaranteed later retrieval without
 * changing lesson identities, introduced keys, stars, or persisted progress.
 */
export function structurePractice(regions: Region[], course: CourseId): Region[] {
  const lessons = regions.flatMap(region => region.lessons);
  const last = lessons.length - 1;
  const learned = new Set<string>();
  let index = 0;
  return regions.map(region => ({ ...region, lessons: region.lessons.map(lesson => {
    const position = index++;
    lesson.newKeys.forEach(key => learned.add(key));
    const exercises: string[] = [];
    const practiceSteps: PracticeStep[] = [];
    const add = (text: string, step: PracticeStep) => {
      exercises.push(text);
      practiceSteps.push(step);
    };
    const separator = learned.has(' ') ? ' ' : '';
    if (lesson.newKeys.length) {
      add(lesson.newKeys.map(key => key === ' ' ? 'f j f j' : key.repeat(3)).join(separator), { kind: 'movement' });
      add(reviewText(lesson.newKeys, learned, course), { kind: 'mix' });
    }
    for (const text of position === last ? [] : lesson.exercises) {
      if (!exercises.includes(text)) add(text, { kind: 'practice' });
    }
    lessons.slice(0, position).forEach((earlier, earlierIndex) => {
      if (!earlier.newKeys.length) return;
      const visits = reviewVisits(earlierIndex, last);
      const variant = visits.indexOf(position);
      if (variant >= 0) add(reviewText(earlier.newKeys, learned, course, variant + 1), { kind: 'review', reviewOf: earlier.id });
    });
    if (position === last) {
      for (const text of finalStory(course)) add(text, { kind: 'story' });
    }
    const german = course === 'de' || course === 'ch';
    return { ...lesson, exercises, practiceSteps,
      storyIntro: position === last
        ? german
          ? 'Dein letztes Abenteuer! Nach einer kurzen Wiederholung tippst du eine ganze Geschichte über Eric. Alle gelernten Buchstaben und die Ziffern 0 bis 9 kommen darin vor. Tippe einen Abschnitt nach dem anderen. Nimm dir Zeit und mach ruhig eine Pause.'
          : 'Je laatste avontuur! Na een korte herhaling typ je een heel verhaal over Eric. Alle geleerde letters en de cijfers 0 tot en met 9 komen erin voor. Typ een stukje na het andere. Neem je tijd en pauzeer gerust.'
        : lesson.storyIntro,
    };
  }) }));
}
