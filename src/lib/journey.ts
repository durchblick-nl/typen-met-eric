import { REGIONS } from "./data/regions";

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
        ? "Jonge draak"
        : stage === "teen"
          ? "Groeiende draak"
          : "Grote draak",
    remaining: next === null ? 0 : next - earned,
    progress: next === null ? 100 : ((earned - start) / (next - start)) * 100,
  };
}

export function arcadeLandscape(regionId: string) {
  return `/images/game/${regionId === "zee" ? "arcade-coast" : regionId === "toppen" ? "arcade-mountains" : "arcade-track"}.webp`;
}
