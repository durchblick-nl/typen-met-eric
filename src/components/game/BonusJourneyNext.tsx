import { t } from '@/lib/i18n';
import type { BonusCoursePreview } from '@/lib/journey';

export function BonusJourneyNext({ suggested, onNext }: {
  suggested: BonusCoursePreview | null;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 mb-3">
      <p className="text-sm text-gray-700 mb-3">
        {suggested
          ? t('Met drie sterren in les {n} open je deze bonusbaan.', { n: suggested.lessonNumber })
          : t('Je hebt alle banen vrijgespeeld. Kies zelf wat je wilt spelen.')}
      </p>
      <button onClick={onNext} className="max-w-full rounded-2xl px-5 py-3 bg-eric-green text-white font-bold hover:bg-eric-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-eric-green">
        {suggested ? t('Oefen les {n}: {title}', { n: suggested.lessonNumber, title: suggested.title }) : t('Naar de kaart')}
      </button>
    </div>
  );
}
