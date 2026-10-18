import { t } from '@/lib/i18n';

/** Character labels preserve spaces and sharp s across all course keyboards. */
export function CourseFocus({ keys }: { keys: string[] }) {
  return keys.length ? (
    <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-700">
      <span>{t('Oefen met:')}</span>
      {keys.map(key => <kbd key={key} className="rounded-lg border border-eric-gold/60 bg-white px-2 py-1 font-mono text-lg font-bold text-eric-green">{key === ' ' ? '␣' : key}</kbd>)}
    </p>
  ) : <p className="text-sm text-gray-700">{t('Oefen met je geleerde tekens.')}</p>;
}
