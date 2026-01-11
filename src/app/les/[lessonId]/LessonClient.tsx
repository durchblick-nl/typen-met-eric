'use client';

import { useEffect, useState } from 'react';
import { useTypingStore } from '@/lib/stores/typingStore';
import { useProgressStore } from '@/lib/stores/progressStore';
import { getLessonById } from '@/lib/data/regions';
import { TypingArea, VirtualKeyboard, LiveStats } from '@/components/typing';
import { Eric } from '@/components/eric';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type LessonPhase = 'intro' | 'exercise' | 'outro' | 'complete';

interface LessonClientProps {
  lessonId: number;
}

export function LessonClient({ lessonId }: LessonClientProps) {
  const router = useRouter();

  const {
    setTargetText,
    isComplete: exerciseComplete,
    accuracy,
    wpm,
    reset: resetTyping,
  } = useTypingStore();

  const { completeLesson } = useProgressStore();

  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);

  const lessonData = getLessonById(lessonId);

  if (!lessonData) {
    notFound();
  }

  const { region, lesson } = lessonData;
  const currentExercise = lesson.exercises[exerciseIndex];
  const isLastExercise = exerciseIndex >= lesson.exercises.length - 1;

  // Set up exercise when it changes
  useEffect(() => {
    if (phase === 'exercise' && currentExercise) {
      resetTyping();
      setTargetText(currentExercise);
    }
  }, [phase, exerciseIndex, currentExercise, setTargetText, resetTyping]);

  // Handle exercise completion
  useEffect(() => {
    if (exerciseComplete && phase === 'exercise') {
      if (isLastExercise) {
        // Calculate stars based on accuracy
        const stars = accuracy >= 95 ? 3 : accuracy >= 85 ? 2 : 1;
        completeLesson(lessonId, stars);
        setPhase('outro');
      } else {
        // Short delay then next exercise
        const timer = setTimeout(() => {
          setExerciseIndex((i) => i + 1);
          resetTyping();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [exerciseComplete, phase, isLastExercise, accuracy, lessonId, completeLesson, resetTyping]);

  const handleStartExercise = () => {
    setPhase('exercise');
    setExerciseIndex(0);
  };

  const handleContinue = () => {
    setPhase('complete');
  };

  const handleBackToRegion = () => {
    router.push(`/regio/${region.id}`);
  };

  const handleNextLesson = () => {
    router.push(`/les/${lessonId + 1}`);
  };

  // Calculate stars
  const stars = accuracy >= 95 ? 3 : accuracy >= 85 ? 2 : 1;

  return (
    <main className="min-h-screen bg-perkament p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/regio/${region.id}`}
            className="text-eric-green hover:text-eric-green/80 transition-colors"
          >
            &larr; {region.name}
          </Link>

          <h1 className="text-xl font-bold text-eric-green">
            Les {lessonId + 1}: {lesson.title}
          </h1>

          <div className="text-sm text-gray-500">
            {exerciseIndex + 1} / {lesson.exercises.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <Eric mood="thinking" size="large" />
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-eric-gold/30 max-w-2xl mx-auto mb-8">
                <p className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">
                  {lesson.storyIntro}
                </p>
              </div>

              {lesson.newKeys.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-2">Nieuwe letters:</p>
                  <div className="flex justify-center gap-2">
                    {lesson.newKeys.map((key) => (
                      <span
                        key={key}
                        className="w-12 h-12 bg-eric-gold text-gray-900 rounded-lg flex items-center justify-center text-xl font-bold font-mono shadow-lg"
                      >
                        {key === ' ' ? '␣' : key.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleStartExercise}
                className="px-8 py-4 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
              >
                Start de oefening!
              </button>
            </motion.div>
          )}

          {/* Exercise Phase */}
          {phase === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <Eric
                  mood={exerciseComplete ? (accuracy >= 85 ? 'celebrating' : 'encouraging') : 'happy'}
                  message={
                    exerciseComplete
                      ? accuracy >= 85
                        ? 'Uitstekend!'
                        : 'Goed gedaan!'
                      : 'Concentreer je... je kunt het!'
                  }
                />
              </div>

              <div className="mb-6">
                <TypingArea />
              </div>

              <div className="mb-8">
                <LiveStats />
              </div>

              <div className="flex justify-center">
                <VirtualKeyboard showFingerHints={true} />
              </div>
            </motion.div>
          )}

          {/* Outro Phase */}
          {phase === 'outro' && (
            <motion.div
              key="outro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <Eric mood="celebrating" size="large" />
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-succes/30 max-w-2xl mx-auto mb-8">
                <p className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">
                  {lesson.storyOutro}
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
              >
                Bekijk je resultaat!
              </button>
            </motion.div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>

              <h2 className="text-3xl font-bold text-eric-green mb-6">
                Les Voltooid!
              </h2>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-eric-gold max-w-md mx-auto mb-8">
                {/* Stars */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + s * 0.1 }}
                      className={`text-4xl ${s <= stars ? '' : 'grayscale opacity-30'}`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-eric-green">{wpm}</div>
                    <div className="text-sm text-gray-500">WPM</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-eric-green">{accuracy}%</div>
                    <div className="text-sm text-gray-500">Nauwkeurig</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBackToRegion}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
                >
                  Terug naar {region.name}
                </button>
                <button
                  onClick={handleNextLesson}
                  className="px-6 py-3 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-semibold transition-colors"
                >
                  Volgende les →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
