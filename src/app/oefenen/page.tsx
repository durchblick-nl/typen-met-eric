'use client';

import { t } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { COURSE } from '@/lib/course';
import { KEYBOARDS } from '@/lib/keyboards';
import { useTypingStore } from '@/lib/stores/typingStore';
import { TypingArea, VirtualKeyboard, LiveStats } from '@/components/typing';
import { PersonalPractice } from '@/components/typing/PersonalPractice';
import { useProgressStore } from '@/lib/stores/progressStore';
import { Eric } from '@/components/eric';
import Link from 'next/link';

// Sample exercises for the tutorial
const HOME = KEYBOARDS[COURSE].homeKeys.join('');
const EXERCISES = [
  { text: 'fff jjj fff jjj', hint: t("Begin met je wijsvingers op F en J. Voel je de bultjes?") },
  { text: 'fjfj fjfj fjfj', hint: t("Wissel tussen F en J. Houd je vingers op de thuisrij!") },
  { text: HOME.slice(0,4)+' '+HOME.slice(4), hint: COURSE === 'be' ? 'Nu alle vingers! Links: Q S D F, rechts: J K L M.' : COURSE === 'nl' ? t("Nu alle vingers! Links: A S D F, Rechts: J K L ;") : 'Jetzt alle Finger! Links: A S D F, rechts: J K L Ö.' },
  { text: 'fj dk sl '+HOME[0]+HOME[7], hint: t("Oefening baart kunst! Blijf oefenen.") },
  { text: HOME, hint: t("De hele thuisrij in een keer!") },
];

function HomePractice() {
  const { setTargetText, isComplete, accuracy, reset, targetText } = useTypingStore();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentExercise = EXERCISES[exerciseIndex];

  useEffect(() => {
    setTargetText(currentExercise.text);
  }, [exerciseIndex, setTargetText, currentExercise.text]);

  useEffect(() => {
    if (isComplete) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  const handleNext = () => {
    if (exerciseIndex < EXERCISES.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      setExerciseIndex(0); // Loop back
    }
  };

  const handleRetry = () => {
    reset();
  };

  const getEricMood = () => {
    if (showCelebration) return 'celebrating';
    if (isComplete && accuracy >= 90) return 'happy';
    if (isComplete && accuracy < 70) return 'encouraging';
    return 'thinking';
  };

  const getEricMessage = () => {
    if (showCelebration && accuracy >= 90) {
      return t("Geweldig! Je bent een natuurtalent!");
    }
    if (showCelebration && accuracy >= 70) {
      return t("Goed gedaan! Met oefening word je nog beter!");
    }
    if (showCelebration) {
      return t("Niet opgeven! Probeer het nog eens.");
    }
    return currentExercise.hint;
  };

  return (
    <section className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-eric-green hover:text-eric-green/80 transition-colors"
          >{' ' + t("← Terug") + ' '} </Link>
          <h2 className="text-2xl font-bold text-eric-green">{' ' + t("Les") + ' '} {exerciseIndex + 1}{' ' + t(": Thuisrij") + ' '} </h2>
          <div className="text-sm text-gray-500">
            {exerciseIndex + 1} / {EXERCISES.length}
          </div>
        </div>

        {/* Eric */}
        <div className="mb-8">
          <Eric mood={getEricMood()} message={getEricMessage()} />
        </div>

        {/* Typing Area */}
        <div className="mb-6">
          <TypingArea />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <LiveStats />
        </div>

        {/* Completion buttons */}
        {isComplete && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
            >{' ' + t("Opnieuw") + ' '} </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-semibold transition-colors"
            >
              {exerciseIndex < EXERCISES.length - 1 ? t("Volgende") : t("Opnieuw beginnen")}
            </button>
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="flex justify-center">
          <VirtualKeyboard showFingerHints={true} />
        </div>

        {/* Instructions */}
        {!isComplete && targetText && (
          <p className="text-center text-gray-500 text-sm mt-6">{' ' + t("Kijk niet naar je toetsenbord! Voel de bultjes op F en J.") + ' '} </p>
        )}
      </div>
    </section>
  );
}


export default function OefenenPage() {
  const [mode, setMode] = useState<'home' | 'personal'>('home');
  const [hydrated, setHydrated] = useState(false);
  const returnFocus = useRef(false);
  const personalButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const ready = () => {
      setHydrated(true);
      if (window.location.hash === '#persoonlijk') setMode('personal');
    };
    if (useProgressStore.persist.hasHydrated()) ready();
    return useProgressStore.persist.onFinishHydration(ready);
  }, []);
  useEffect(() => {
    if (mode !== 'home' || !returnFocus.current) return;
    returnFocus.current = false;
    const frame = requestAnimationFrame(() => personalButton.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [mode]);
  return <main className="min-h-screen bg-perkament p-4 md:p-8">
    <div className="max-w-4xl mx-auto mb-6">
      <h1 className="text-3xl font-bold text-eric-green mb-4">{t('Snel oefenen')}</h1>
      <nav aria-label={t('Kies je oefening')} className="flex flex-wrap gap-3">
        <button aria-pressed={mode === 'home'} onClick={() => setMode('home')} className="rounded-full px-5 py-3 border border-eric-green/30 text-eric-green font-semibold aria-pressed:bg-eric-green aria-pressed:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-eric-green">{t('Thuisrij oefenen')}</button>
        <button ref={personalButton} disabled={!hydrated} aria-pressed={mode === 'personal'} onClick={() => setMode('personal')} className="rounded-full px-5 py-3 border border-eric-green/30 text-eric-green font-semibold aria-pressed:bg-eric-green aria-pressed:text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-eric-green">{t('Jouw toetsentraining')}</button>
      </nav>
    </div>
    {mode === 'personal' ? <PersonalPractice onExit={() => { returnFocus.current = true; setMode('home'); }} /> : <HomePractice />}
  </main>;
}
