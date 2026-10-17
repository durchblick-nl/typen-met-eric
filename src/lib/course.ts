/** A course is fixed at export time, so lessons, guidance and saved progress agree. */
export const COURSE_IDS = ['nl', 'be', 'de', 'ch'] as const;
export type CourseId = typeof COURSE_IDS[number];
const requested = process.env.NEXT_PUBLIC_LETTORIA_COURSE;
if (requested && !COURSE_IDS.includes(requested as CourseId)) throw new Error('Unsupported Lettoria course: ' + requested);
export const COURSE: CourseId = COURSE_IDS.includes(requested as CourseId) ? requested as CourseId : 'nl';
export const IS_GERMAN = COURSE === 'de' || COURSE === 'ch';
export const BASE_PATH = COURSE === 'nl' ? '' : `/${COURSE}`;
export const LANGUAGE = IS_GERMAN ? (COURSE === 'ch' ? 'de-CH' : 'de-DE') : (COURSE === 'be' ? 'nl-BE' : 'nl-NL');
export const COURSE_LABELS: Record<CourseId, string> = {
  nl: 'Nederland · QWERTY', be: 'België · AZERTY', de: 'Deutschland · QWERTZ', ch: 'Schweiz · QWERTZ',
};
export const COURSE_LABEL = COURSE_LABELS[COURSE];
export const COURSE_URL = `https://lettoria.nl${BASE_PATH}`;
export function storageKey(original: string): string {
  // Existing Dutch progress stays exactly where it is. Other curricula start separately.
  return COURSE === 'nl' ? original : `${original}-${COURSE}`;
}
export function regionalGerman(text: string): string {
  return COURSE === 'ch' ? text.replace(/ß/g, 'ss').replace(/ẞ/g, 'SS') : text;
}

export const CERTIFICATE_SEAL = IS_GERMAN ? '/images/diploma/lettoria_seal_de.png' : '/images/diploma/lettoria_seal.png';
