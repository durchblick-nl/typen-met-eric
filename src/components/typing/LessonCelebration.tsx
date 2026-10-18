import { t } from '@/lib/i18n';
import Image from "next/image";
import { Eric } from "@/components/eric";
import { IllustratedProp } from "@/components/game/IllustratedProp";
import { KeyboardHint } from "@/components/ui/KeyboardHint";
import type { BonusCoursePreview } from '@/lib/journey';
import { CourseFocus } from '@/components/game/CourseFocus';

export function LessonCelebration({
  stars,
  accuracy,
  course,
  mastered,
  onArcade,
}: {
  stars: number;
  accuracy: number;
  course: BonusCoursePreview;
  mastered: boolean;
  onArcade: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto mb-7">
      {stars === 3 ? (
        <div className="relative w-full aspect-[5/2] max-h-72 rounded-3xl overflow-hidden border border-eric-gold/30 mb-5">
          <Image
            src="/images/game/eric-reward.webp"
            alt={t("Eric viert jouw avontuur in het herstelde Lettoria")}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <Eric mood="encouraging" size="medium" />
        </div>
      )}
      <h2 className="text-3xl sm:text-5xl font-bold text-eric-green">{' ' + t("Les Voltooid!") + ' '} </h2>
      <p className="text-gray-600 mt-2">{' ' + t("Elke goede toets brengt de magie terug.") + ' '} </p>
      <div
        className="flex justify-center gap-2 mt-5 mb-3"
        role="img"
        aria-label={t("{n} van 3 sterren", {n:stars})}
      >
        {[1, 2, 3].map((star) => (
          <svg
            key={star}
            width="64"
            height="64"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <path
              d="M50 6 63 34 94 38 71 60 77 92 50 77 23 92 29 60 6 38 37 34Z"
              fill={star <= stars ? "#ffd45c" : "#e5e7eb"}
              stroke={star <= stars ? "#d59a24" : "#9ca3af"}
              strokeWidth="3"
            />
          </svg>
        ))}
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-eric-green">
        {accuracy}%
      </div>
      <p className="text-sm text-gray-600 mt-1">{' ' + t("Nauwkeurig") + ' '}</p>
      {stars < 3 && !mastered && (
        <p className="max-w-md mx-auto text-gray-700 mt-4">{' ' + t("Neem je tijd. Met 95% nauwkeurigheid verdien je drie sterren en opent de volgende les.") + ' '} </p>
      )}
      {!mastered && (
        <div data-testid="locked-bonus" className="mt-6 rounded-2xl border-2 border-eric-gold/60 bg-white/65 p-5">
          <h3 className="text-xl font-bold text-eric-green">{t('Baan {n} is nog gesloten', { n: course.lessonNumber })}</h3>
          <p className="mt-2 mb-3 text-gray-700">{course.title}</p>
          <CourseFocus keys={course.focusKeys} />
          <p className="mt-3 text-gray-700">{t('Haal drie sterren in les {n} om deze baan te openen.', { n: course.lessonNumber })}</p>
        </div>
      )}
      {mastered && (
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-eric-gold/60 bg-white/65 p-4 sm:px-6 text-center sm:text-left">
          <IllustratedProp name="gem" className="w-16 sm:w-20" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-eric-green">{t('Baan {n} is open', { n: course.lessonNumber })}</h3>
            <p className="text-gray-600 text-sm mt-1">{course.title}</p>
            {stars < 3 && <p className="mt-2 text-sm text-gray-700">{t('Je hebt deze baan al vrijgespeeld. Je kunt blijven spelen.')}</p>}
          </div>
          <button
            onClick={onArcade}
            data-bonus="arcade"
            className="shrink-0 px-6 py-3 rounded-full bg-eric-green hover:bg-eric-green/90 text-white font-bold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >{' ' + t("Speel kristaljacht") + ' '}<KeyboardHint keyName="↵" />
          </button>
        </div>
      )}
    </div>
  );
}
