'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTypingStore } from '@/lib/stores/typingStore';
import { useProgressStore } from '@/lib/stores/progressStore';
import { getLessonById, getTotalLessons } from '@/lib/data/regions';
import { TypingArea, VirtualKeyboard, LiveStats } from '@/components/typing';
import { Eric } from '@/components/eric';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyboardHint, KeyboardHintDark } from '@/components/ui/KeyboardHint';
import { CrystalGame } from '@/components/game/CrystalGame';
import { REGIONS } from '@/lib/data/regions';

type LessonPhase = 'intro' | 'exercise' | 'outro' | 'game' | 'complete';

// Get all letters learned up to and including a specific lesson
function getAvailableLetters(lessonId: number): string[] {
  const letters: string[] = [];
  for (const region of REGIONS) {
    for (const lesson of region.lessons) {
      if (lesson.id <= lessonId) {
        letters.push(...lesson.newKeys.filter(k => k !== ' '));
      }
    }
  }
  return [...new Set(letters)]; // Remove duplicates
}

interface LessonClientProps {
  lessonId: number;
}

export function LessonClient({ lessonId }: LessonClientProps) {
  const router = useRouter();

  const {
    setTargetText,
    isComplete: exerciseComplete,
    accuracy,
    typedChars,
    errors,
    reset: resetTyping,
  } = useTypingStore();

  const { completeLesson } = useProgressStore();

  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);

  // Cumulative stats across all exercises in the lesson
  const [cumulativeCorrect, setCumulativeCorrect] = useState(0);
  const [cumulativeTotal, setCumulativeTotal] = useState(0);
  const [lastProcessedExercise, setLastProcessedExercise] = useState(-1);

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

  // Handle exercise completion - accumulate stats
  useEffect(() => {
    // Prevent processing the same exercise twice (avoids infinite loop)
    if (exerciseComplete && phase === 'exercise' && exerciseIndex !== lastProcessedExercise) {
      // Mark this exercise as processed
      setLastProcessedExercise(exerciseIndex);

      // Add current exercise stats to cumulative totals
      const exerciseCorrect = typedChars.length - errors.length;
      const exerciseTotal = typedChars.length;

      setCumulativeCorrect(prev => prev + exerciseCorrect);
      setCumulativeTotal(prev => prev + exerciseTotal);

      if (isLastExercise) {
        // Calculate stars based on CUMULATIVE accuracy (use current values + this exercise)
        const newCumulativeCorrect = cumulativeCorrect + exerciseCorrect;
        const newCumulativeTotal = cumulativeTotal + exerciseTotal;
        const finalAccuracy = newCumulativeTotal > 0
          ? Math.round((newCumulativeCorrect / newCumulativeTotal) * 100)
          : 100;
        const stars = finalAccuracy >= 95 ? 3 : finalAccuracy >= 85 ? 2 : 1;
        completeLesson(lessonId, stars);
        setPhase('outro');
      }
    }
  }, [exerciseComplete, phase, isLastExercise, exerciseIndex, lastProcessedExercise, typedChars, errors, cumulativeCorrect, cumulativeTotal, lessonId, completeLesson]);

  // Handle transition to next exercise (separate effect to avoid timer cleanup issues)
  useEffect(() => {
    // When an exercise was just processed and it's not the last one, move to next
    if (lastProcessedExercise === exerciseIndex && !isLastExercise && phase === 'exercise') {
      const timer = setTimeout(() => {
        setExerciseIndex((i) => i + 1);
        resetTyping();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastProcessedExercise, exerciseIndex, isLastExercise, phase, resetTyping]);

  const handleStartExercise = () => {
    // Reset cumulative stats for new lesson attempt
    setCumulativeCorrect(0);
    setCumulativeTotal(0);
    setLastProcessedExercise(-1);
    setPhase('exercise');
    setExerciseIndex(0);
  };

  const handleContinue = () => {
    setPhase('complete');
  };

  const isLastLesson = lessonId >= getTotalLessons() - 1;

  const handleStartGame = () => {
    setPhase('game');
  };

  const handleGameComplete = () => {
    // After game, go to next lesson or back to region
    if (!isLastLesson) {
      router.push(`/les/${lessonId + 1}`);
    } else {
      router.push('/kaart');
    }
  };

  const handleBackToRegion = useCallback(() => {
    if (isLastLesson) {
      router.push('/kaart');
    } else {
      router.push(`/regio/${region.id}`);
    }
  }, [router, region.id, isLastLesson]);

  const handleNextLesson = useCallback(() => {
    if (!isLastLesson) {
      router.push(`/les/${lessonId + 1}`);
    }
  }, [router, lessonId, isLastLesson]);

  const handleRetry = useCallback(() => {
    resetTyping();
    // Reset cumulative stats for retry
    setCumulativeCorrect(0);
    setCumulativeTotal(0);
    setLastProcessedExercise(-1);
    setPhase('intro');
    setExerciseIndex(0);
  }, [resetTyping]);

  // Calculate cumulative accuracy and stars
  const cumulativeAccuracy = cumulativeTotal > 0
    ? Math.round((cumulativeCorrect / cumulativeTotal) * 100)
    : accuracy; // Fallback to current accuracy if no cumulative data yet
  const stars = cumulativeAccuracy >= 95 ? 3 : cumulativeAccuracy >= 85 ? 2 : 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger during exercise or game phase (user is typing)
      if (phase === 'exercise' || phase === 'game') return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (phase === 'intro') {
          handleStartExercise();
        } else if (phase === 'outro') {
          handleContinue();
        } else if (phase === 'complete') {
          // Start bonus game if 3 stars, otherwise retry
          if (stars >= 3) {
            handleStartGame();
          } else {
            handleRetry();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBackToRegion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleNextLesson, handleBackToRegion, handleRetry, isLastLesson, stars]);

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

          <div className="text-center">
            {region.imageUrl ? (
              <Image
                src={region.imageUrl}
                alt={region.name}
                width={40}
                height={40}
                className="mx-auto mb-1"
              />
            ) : (
              <span className="text-2xl">{region.icon}</span>
            )}
            <h1 className="text-xl font-bold text-eric-green">
              Les {lessonId + 1}: {lesson.title}
            </h1>
          </div>

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
            >
              {/* Story Image - top, compact */}
              {lesson.storyImageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 rounded-xl overflow-hidden shadow-md max-w-md mx-auto border-4 border-white transform rotate-1"
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={lesson.storyImageUrl}
                      alt="Story Illustration"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {/* Eric + Story Text side by side */}
              <div className="flex items-start gap-4 max-w-2xl mx-auto mb-4">
                <div className="flex-shrink-0">
                  <Eric mood="thinking" size="small" />
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-eric-gold/30 flex-1">
                  <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                    {lesson.storyIntro}
                  </p>
                </div>
              </div>

              {/* New keys + Start button in row */}
              <div className="flex items-center justify-center gap-6">
                {lesson.newKeys.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Nieuw:</span>
                    {lesson.newKeys.map((key) => (
                      <span
                        key={key}
                        className="w-10 h-10 bg-eric-gold text-gray-900 rounded-lg flex items-center justify-center text-lg font-bold font-mono shadow-lg"
                      >
                        {key === ' ' ? '␣' : key.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleStartExercise}
                  className="inline-flex items-center px-6 py-3 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
                >
                  Start de oefening!
                  <KeyboardHint keyName="↵" />
                </button>
              </div>
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
                  mood={
                    exerciseComplete
                      ? accuracy >= 85
                        ? 'celebrating'
                        : accuracy >= 60
                          ? 'encouraging'
                          : 'worried'
                      : 'happy'
                  }
                  message={
                    exerciseComplete
                      ? accuracy >= 95
                        ? 'Uitstekend!'
                        : accuracy >= 85
                          ? 'Heel goed!'
                          : accuracy >= 70
                            ? 'Dat gaat al aardig!'
                            : accuracy >= 50
                              ? 'Blijf oefenen, het komt goed!'
                              : 'Oeps! Probeer het nog eens...'
                      : 'Concentreer je... je kunt het!'
                  }
                />
              </div>

              <div className="mb-6">
                <TypingArea />
              </div>

              {/* Keyboard with Stats on the right */}
              <div className="flex justify-center items-start gap-4">
                <VirtualKeyboard showFingerHints={true} lessonId={lessonId} />
                <LiveStats vertical={true} />
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
                className="inline-flex items-center px-8 py-4 bg-eric-green hover:bg-eric-green/90 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
              >
                Bekijk je resultaat!
                <KeyboardHint keyName="↵" />
              </button>
            </motion.div>
          )}

          {/* Game Phase - keyboard-only bonus race for 3 stars */}
          {phase === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <CrystalGame
                lessonId={String(lessonId)}
                availableLetters={getAvailableLetters(lessonId)}
                onComplete={handleGameComplete}
              />
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

                {/* Stats - only show accuracy (WPM doesn't make sense across multiple exercises) */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-eric-green">{cumulativeAccuracy}%</div>
                  <div className="text-sm text-gray-500">Nauwkeurig</div>
                </div>

                {/* Encouragement for retry */}
                {stars < 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-accent">
                      Je hebt 3 sterren nodig om verder te gaan.
                      <br />
                      Probeer het nog eens voor een betere score!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBackToRegion}
                  className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
                >
                  {isLastLesson ? 'Terug naar kaart' : `Terug naar ${region.name}`}
                  <KeyboardHintDark keyName="Esc" />
                </button>
                {stars < 3 ? (
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-full font-semibold transition-colors"
                  >
                    Opnieuw proberen
                    <KeyboardHint keyName="↵" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartGame}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors"
                  >
                    Bonusspel!
                    <KeyboardHint keyName="↵" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
