"use client";
import { EricPortrait } from "@/components/eric/EricPortrait";
import Link from "next/link";
import { useProgressStore } from "@/lib/stores/progressStore";
import { nextJourneyLesson, ericGrowth } from "@/lib/journey";

export function JourneyPreview() {
  const { totalStars, lessonStars } = useProgressStore();
  const next = nextJourneyLesson(lessonStars);
  const growth = ericGrowth(totalStars);
  return (
    <section
      aria-labelledby="journey-heading"
      className="mb-6 flex flex-col sm:flex-row items-center gap-5 rounded-3xl border border-eric-gold/30 bg-white/55 px-5 py-4"
    >
      <EricPortrait
        stage={growth.stage}
        label="Eric gaat met je mee"
        className="w-28 sm:w-36"
      />
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-eric-green">
          {next ? "Jouw volgende avontuur" : "Lettoria is weer vol magie!"}
        </p>
        <h2
          id="journey-heading"
          className="text-2xl sm:text-3xl font-bold text-eric-green mt-1"
        >
          {next?.lesson.title || "Alle lessen met drie sterren!"}
        </h2>
        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
          {next?.lesson.newKeys.length ? (
            next.lesson.newKeys.map((key) => (
              <kbd
                key={key}
                className="bg-white border border-eric-green/20 rounded-lg px-3 py-1 font-mono font-bold text-eric-green"
              >
                {key === " " ? "␣" : key.toUpperCase()}
              </kbd>
            ))
          ) : (
            <span className="text-sm text-gray-600">
              {next
                ? "Gebruik je geleerde toetsen."
                : "Eric is trots op je. Je diploma wacht op je."}
            </span>
          )}
        </div>
      </div>
      <Link
        href={next ? `/les/${next.lesson.id}` : "/diploma"}
        className="shrink-0 rounded-full bg-eric-green text-white font-bold px-6 py-3 hover:bg-eric-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {next ? "Verder met Eric" : "Bekijk je diploma"}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
