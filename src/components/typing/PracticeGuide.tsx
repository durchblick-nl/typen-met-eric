import { t } from '@/lib/i18n';
import type { PracticeStep } from '@/lib/data/practiceSequence';

export function PracticeGuide({ step, number, total }: { step?: PracticeStep; number?: number; total?: number }) {
  const message = step?.kind === 'story' ? t('Typ dit stukje van Erics verhaal. Samen maken de stukjes een heel avontuur met alle geleerde letters en cijfers.')
    : step?.kind === 'movement' ? t('Voel F en J. Oefen de nieuwe toets rustig met de juiste vinger.')
    : step?.kind === 'mix' ? t('Verbind je nieuwe toetsen met wat je al kent. Nauwkeurig is belangrijker dan snel.')
    : step?.kind === 'review' ? t('Weet je deze toetsen nog? Je oefent ze opnieuw in andere combinaties.')
    : step ? t('Oefen je tekens en woorden. Een fout? Probeer dezelfde toets nog eens.')
    : t('Eerst een kleine beweging, dan combineren en oefenen. Oude toetsen komen in latere lessen terug. Neem gerust een pauze.');
  const label = step?.kind === 'story' ? t('Erics laatste avontuur') : step?.kind === 'movement' ? t('Ontdekken') : step?.kind === 'mix' ? t('Combineren') : step?.kind === 'review' ? t('Terughalen') : t('Oefenen');
  return <div className="max-w-2xl mx-auto rounded-xl bg-white/80 border border-eric-green/15 p-4 mb-5 text-sm text-gray-700" data-testid="practice-guide">
    {step && <p className="font-bold text-eric-green mb-1">{label} · {t('Oefening {n} van {total}', { n: number ?? 1, total: total ?? 1 })}</p>}
    <p>{message}</p>
  </div>;
}
