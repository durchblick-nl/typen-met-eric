'use client';

import { WorldMap } from '@/components/map';
import { useProgressStore } from '@/lib/stores/progressStore';
import { Eric } from '@/components/eric';
import Link from 'next/link';

export default function KaartPage() {
  const { completedLessons, currentLesson, totalStars, currentStreak } = useProgressStore();

  const getEricMessage = () => {
    if (completedLessons.length === 0) {
      return 'Welkom in Lettoria! Klik op mijn grot om te beginnen!';
    }
    if (completedLessons.length < 3) {
      return 'Goed bezig! Ga verder met het Startdorp!';
    }
    if (completedLessons.length < 6) {
      return 'Je leert snel! Nog even en het dorp is gered!';
    }
    return 'Geweldig! Je bent een echte held van Lettoria!';
  };

  return (
    <main className="min-h-screen bg-perkament p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-eric-green hover:text-eric-green/80 transition-colors"
          >
            &larr; Home
          </Link>

          <h1 className="text-2xl font-bold text-eric-green">
            Wereldkaart
          </h1>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                <span>🔥</span>
                <span className="font-bold">{currentStreak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
              <span>⭐</span>
              <span className="font-bold">{totalStars}</span>
            </div>
          </div>
        </div>

        {/* Eric */}
        <div className="mb-6">
          <Eric
            mood={completedLessons.length > 0 ? 'happy' : 'encouraging'}
            message={getEricMessage()}
          />
        </div>

        {/* World Map */}
        <WorldMap
          completedLessons={completedLessons.length}
          currentLesson={currentLesson}
        />

        {/* Progress bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Voortgang</span>
            <span>{completedLessons.length} lessen voltooid</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-eric-green to-eric-gold transition-all duration-500"
              style={{ width: `${Math.min(100, (completedLessons.length / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
