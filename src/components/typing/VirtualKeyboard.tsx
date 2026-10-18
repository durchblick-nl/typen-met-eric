'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { t } from '@/lib/i18n';
import { useTypingStore } from '@/lib/stores/typingStore';
import { COURSE, COURSE_LABEL } from '@/lib/course';
import { KEYBOARDS, keyGuidance } from '@/lib/keyboards';
import { useQuietMotion } from '@/components/settings/ComfortSettings';

const FINGER_COLORS = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#60a5fa', '#c084fc', '#f472b6', '#e2c478'];

function Hand({ side, finger, shift }: { side: 'left' | 'right'; finger: number | null; shift: boolean }) {
  const left = side === 'left';
  const indices = left ? [0, 1, 2, 3] : [4, 5, 6, 7];
  return (
    <svg viewBox="-10 0 110 120" className="keyboard-hand" aria-hidden="true">
      <rect x={left ? 15 : 25} y="94" width="50" height="21" rx="7" fill="#42645e" />
      <path d={left ? 'M10 95Q5 70 12 55H68Q75 70 70 95Z' : 'M20 95Q15 70 22 55H78Q85 70 80 95Z'} fill="#e8c4a0" stroke="#bd946e" strokeWidth="1.5" />
      {indices.map((index, position) => {
        const active = finger === index;
        const shiftFinger = shift && (left ? index === 0 : index === 7);
        const height = index === 2 || index === 5 ? 45 : index === 0 || index === 7 ? 32 : 40;
        return <rect key={index} x={(left ? 12 : 18) + position * 16} y={55 - height} width="12" height={height} rx="6"
          fill={active ? FINGER_COLORS[index] : '#d7b492'} stroke={active ? '#fff8e1' : shiftFinger ? '#f3cf78' : '#bd946e'}
          strokeWidth={active || shiftFinger ? 3 : 1.5} data-finger={index} data-active={active} data-shift={shiftFinger} />;
      })}
      <rect x={left ? 68 : -6} y="60" width="28" height="14" rx="7" fill={finger === 8 ? FINGER_COLORS[8] : '#e8c4a0'} stroke={finger === 8 ? '#fff8e1' : '#bd946e'} strokeWidth={finger === 8 ? 3 : 1.5} />
    </svg>
  );
}

interface VirtualKeyboardProps {
  showFingerHints?: boolean;
  highlightKey?: string;
  lessonId?: number;
}

export function VirtualKeyboard({ showFingerHints = true, highlightKey }: VirtualKeyboardProps) {
  const targetText = useTypingStore(state => state.targetText);
  const currentIndex = useTypingStore(state => state.currentIndex);
  const typedChars = useTypingStore(state => state.typedChars);
  const lastWrong = useTypingStore(state => state.lastWrong);
  const quiet = useQuietMotion();
  const [expiredAttempt, setExpiredAttempt] = useState<readonly string[] | null>(null);
  const character = typedChars.at(-1);
  const pressedKey = character && expiredAttempt !== typedChars ? keyGuidance(character) : undefined;
  const feedback = pressedKey ? { key: pressedKey.key, wrong: lastWrong, attempt: typedChars.length } : null;
  const currentKey = highlightKey || targetText[currentIndex] || '';
  const guidance = keyGuidance(currentKey);
  const finger = guidance?.finger ?? null;

  // Derive immediate feedback from the store; only expiry needs local state.
  // The array identity also distinguishes equal attempt counts in new targets.
  useEffect(() => {
    if (!typedChars.length) return;
    const timer = window.setTimeout(() => setExpiredAttempt(typedChars), 240);
    return () => window.clearTimeout(timer);
  }, [typedChars]);

  function keycap(key: string, fingerIndex: number, shifted?: string) {
    const active = key === guidance?.key;
    const pressed = feedback?.key === key;
    const home = KEYBOARDS[COURSE].homeKeys.includes(key);
    const bump = key === 'f' || key === 'j';
    return (
      <div key={key} className={`keyboard-key ${key === ' ' ? 'keyboard-space' : ''}`}
        data-key={key} data-active={active} data-home={home} data-feedback={pressed ? feedback.wrong ? 'wrong' : 'correct' : undefined}
        style={{ '--finger-color': FINGER_COLORS[fingerIndex] } as CSSProperties}>
        {shifted && <span className="keyboard-shift-symbol" data-target={active && guidance?.shift}>{shifted}</span>}
        <span className="keyboard-key-label">{key === ' ' ? t('SPATIE') : /^[a-zäöü]$/.test(key) ? key.toUpperCase() : key}</span>
        {bump && <span className="keyboard-home-bump" />}
        {pressed && <span key={feedback.attempt} className="keyboard-feedback" aria-hidden="true">{feedback.wrong ? '×' : '✓'}</span>}
      </div>
    );
  }

  return (
    <div className="training-keyboard" data-quiet={quiet} role="group" aria-label={t('Oefentoetsenbord')}>
      <div className="keyboard-heading"><span>{t('Jouw toetsenbord')}</span><span>{COURSE_LABEL.split(' · ')[1]}</span></div>
      <div className="keyboard-rows">
        {KEYBOARDS[COURSE].rows.map((row, index) => (
          <div key={index} className="keyboard-row" style={{ '--row-offset': `${[0, 2, 3.5, 7][index]}%` } as CSSProperties}>
            {row.map(entry => keycap(entry.key, entry.finger, entry.shift))}
          </div>
        ))}
      </div>
      <div className="keyboard-bottom" aria-label={t('Shifttoetsen')}>
        <span className="keyboard-shift" data-active={guidance?.shiftHand === 'left'}>⇧ <span>{t('Linker Shift')}</span></span>
        {keycap(' ', 8)}
        <span className="keyboard-shift" data-active={guidance?.shiftHand === 'right'}><span>{t('Rechter Shift')}</span> ⇧</span>
      </div>
      {guidance?.capsLock && <p role="status" className="keyboard-shift-guidance">{t('Caps Lock aan → {key} → Caps Lock uit', {key: currentKey})}</p>}
      {guidance?.shift && <p role="status" className="keyboard-shift-guidance">{guidance.shiftHand === 'left' ? t('Houd linker Shift ingedrukt') : t('Houd rechter Shift ingedrukt')} + {guidance.key.toUpperCase()} → <strong>{currentKey}</strong></p>}
      {showFingerHints && (
        <div className="keyboard-coach">
          <div className="keyboard-hands">
            <div><Hand side="left" finger={finger !== null && (finger <= 3 || finger === 8) ? finger : null} shift={guidance?.shiftHand === 'left'} /><span>{t('Linkerhand')}</span></div>
            <div className="keyboard-next" style={{ '--finger-color': finger === null ? '#e2c478' : FINGER_COLORS[finger] } as CSSProperties}>
              <span>{t('Volgende toets')}</span><strong>{currentKey === ' ' ? '␣' : (/^[a-zäöü]$/.test(currentKey) ? currentKey.toUpperCase() : currentKey) || '✓'}</strong>
            </div>
            <div><Hand side="right" finger={finger !== null && finger >= 4 ? finger : null} shift={guidance?.shiftHand === 'right'} /><span>{t('Rechterhand')}</span></div>
          </div>
          <p className="keyboard-home-tip">{t('Je wijsvingers starten altijd op')} <strong>F</strong> {t('en')} <strong>J</strong> {t('— voel de streepjes!')}</p>
        </div>
      )}
    </div>
  );
}
