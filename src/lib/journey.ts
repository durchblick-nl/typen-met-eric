import { t } from '@/lib/i18n';
import { REGIONS, getLessonById, type Lesson } from "./data/regions";

export interface BonusCoursePreview {
  lessonId: number;
  lessonNumber: number;
  title: string;
  focusKeys: string[];
}

export interface BonusJourney {
  current: BonusCoursePreview;
  currentMastered: boolean;
  suggested: BonusCoursePreview | null;
}

function bonusPreview(lesson: Lesson): BonusCoursePreview {
  return { lessonId: lesson.id, lessonNumber: lesson.id + 1, title: lesson.title, focusKeys: [...lesson.newKeys] };
}

/** Derived from best lesson results, never from the latest attempt or game scores. */
export function bonusJourney(lessonId: number, lessonStars: Record<number, number>): BonusJourney | undefined {
  const current = getLessonById(lessonId)?.lesson;
  if (!current) return undefined;
  const suggested = nextJourneyLesson(lessonStars)?.lesson;
  return {
    current: bonusPreview(current),
    currentMastered: (lessonStars[lessonId] || 0) >= 3,
    suggested: suggested ? bonusPreview(suggested) : null,
  };
}

export function nextJourneyLesson(lessonStars: Record<number, number>) {
  for (const region of REGIONS) {
    const lesson = region.lessons.find(
      (lesson) => (lessonStars[lesson.id] || 0) < 3,
    );
    if (lesson) return { region, lesson };
  }
  return null;
}

export function ericGrowth(stars: number) {
  const earned = Math.max(0, stars);
  const stage: "baby" | "teen" | "adult" =
    earned < 18 ? "baby" : earned < 45 ? "teen" : "adult";
  const start = stage === "baby" ? 0 : stage === "teen" ? 18 : 45;
  const next = stage === "baby" ? 18 : stage === "teen" ? 45 : null;
  return {
    stage,
    name:
      stage === "baby"
        ? t("Jonge draak")
        : stage === "teen"
          ? t("Groeiende draak")
          : t("Grote draak"),
    remaining: next === null ? 0 : next - earned,
    progress: next === null ? 100 : ((earned - start) / (next - start)) * 100,
  };
}

export function arcadeLandscape(regionId: string) {
  return `/images/game/${regionId === "zee" ? "arcade-coast" : regionId === "toppen" ? "arcade-mountains" : "arcade-track"}.webp`;
}
