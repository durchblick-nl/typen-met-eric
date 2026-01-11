'use client';

import { useEffect, useState } from 'react';
import { useTypingStore } from '@/lib/stores/typingStore';
import { TypingArea, VirtualKeyboard, LiveStats } from '@/components/typing';
import { Eric } from '@/components/eric';
import Link from 'next/link';

// Sample exercises for the tutorial
const EXERCISES = [
  { text: 'fff jjj fff jjj', hint: 'Begin met je wijsvingers op F en J. Voel je de bultjes?' },
  { text: 'fjfj fjfj fjfj', hint: 'Wissel tussen F en J. Houd je vingers op de thuisrij!' },
  { text: 'asdf jkl;', hint: 'Nu alle vingers! Links: A S D F, Rechts: J K L ;' },
  { text: 'fj dk sl a;', hint: 'Oefening baart kunst! Blijf oefenen.' },
  { text: 'asdfjkl;', hint: 'De hele thuisrij in een keer!' },
];

export default function OefenenPage() {
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
      return 'Geweldig! Je bent een natuurtalent!';
    }
    if (showCelebration && accuracy >= 70) {
      return 'Goed gedaan! Met oefening word je nog beter!';
    }
    if (showCelebration) {
      return 'Niet opgeven! Probeer het nog eens.';
    }
    return currentExercise.hint;
  };

  return (
    <main className="min-h-screen bg-perkament p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-eric-green hover:text-eric-green/80 transition-colors"
          >
            &larr; Terug
          </Link>
          <h1 className="text-2xl font-bold text-eric-green">
            Les {exerciseIndex + 1}: Thuisrij
          </h1>
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
            >
              Opnieuw
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-semibold transition-colors"
            >
              {exerciseIndex < EXERCISES.length - 1 ? 'Volgende' : 'Opnieuw beginnen'}
            </button>
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="flex justify-center">
          <VirtualKeyboard showFingerHints={true} />
        </div>

        {/* Instructions */}
        {!isComplete && targetText && (
          <p className="text-center text-gray-500 text-sm mt-6">
            Kijk niet naar je toetsenbord! Voel de bultjes op F en J.
          </p>
        )}
      </div>
    </main>
  );
}
