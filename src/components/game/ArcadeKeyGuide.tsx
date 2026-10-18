'use client';
import { t } from '@/lib/i18n';
import { COURSE_LABEL } from '@/lib/course';
import { keyGuidance } from '@/lib/keyboards';

const fingers = ['Pink', 'Ringvinger', 'Middelvinger', 'Wijsvinger', 'Wijsvinger', 'Middelvinger', 'Ringvinger', 'Pink', 'Duim'];

/** Read-only help: never captures focus or adds a second control scheme. */
export function ArcadeKeyGuide({ character }: { character?: string }) {
  const guidance = character === undefined ? undefined : keyGuidance(character);
  const label = (key: string) => key === ' ' ? '␣' : /^[a-zäöü]$/.test(key) ? key.toUpperCase() : key;
  return (
    <div className="arcade-key-guide" role="group" aria-label={t('Toetsenhulp')} data-target={character} data-shift={guidance?.shift || false}>
      <div className="arcade-guide-heading"><span>{t('Eerstvolgende doel')}</span><small>{COURSE_LABEL.split(' · ')[1]}</small></div>
      {guidance && character !== undefined ? (
        <>
          <div className="arcade-guide-body">
            <span className="arcade-guide-target" aria-label={t('Typ dit teken')}>{label(character)}</span>
            <div className="arcade-guide-combination">
              <span className="arcade-guide-keys">
                {guidance.shift && <><kbd data-shift-hand={guidance.shiftHand}>{guidance.shiftHand === 'left' ? t('Linker Shift') : t('Rechter Shift')}</kbd><span aria-hidden="true">+</span></>}
                <kbd data-physical-key={guidance.key}>{label(guidance.key)}</kbd>
              </span>
              <span className="arcade-guide-finger">
                {guidance.finger < 8 && <>{guidance.finger <= 3 ? t('Linkerhand') : t('Rechterhand')} · </>}{t(fingers[guidance.finger])}
              </span>
            </div>
          </div>
          {guidance.shift && <p className="arcade-guide-extra">{t('Gebruik de andere hand voor Shift. Het doel blijft op je wachten.')}</p>}
        </>
      ) : <p className="arcade-guide-wait">{t('Wacht op het volgende teken.')}</p>}
    </div>
  );
}
