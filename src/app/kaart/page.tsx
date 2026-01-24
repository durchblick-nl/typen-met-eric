'use client';

import { WorldMap } from '@/components/map';
import { useProgressStore } from '@/lib/stores/progressStore';
import { Eric } from '@/components/eric';
import Link from 'next/link';
import Image from 'next/image';

const TOTAL_LESSONS = 26;

export default function KaartPage() {
  const { completedLessons, currentLesson, totalStars, currentStreak, lessonStars } = useProgressStore();

  // Check if all lessons completed with 3 stars
  const threeStarLessons = Object.values(lessonStars).filter(stars => stars >= 3).length;
  const canGetDiploma = threeStarLessons >= TOTAL_LESSONS;

  const getEricMessage = () => {
    if (canGetDiploma) {
      return 'Ongelooflijk! Je hebt ALLE lessen met 3 sterren voltooid! Haal je diploma op!';
    }
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
            <span>{completedLessons.length} / {TOTAL_LESSONS} lessen voltooid</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-eric-green to-eric-gold transition-all duration-500"
              style={{ width: `${Math.min(100, (completedLessons.length / TOTAL_LESSONS) * 100)}%` }}
            />
          </div>
        </div>

        {/* Diploma section - shows when completed or as teaser */}
        <div className="mt-8 max-w-md mx-auto">
          {canGetDiploma ? (
            <Link
              href="/diploma"
              className="flex items-center gap-4 bg-gradient-to-r from-eric-green to-eric-gold p-4 rounded-2xl text-white hover:scale-[1.02] transition-transform shadow-lg"
            >
              <Image
                src="/images/diploma/lettoria_seal.png"
                alt="Diploma"
                width={60}
                height={60}
                className="flex-shrink-0"
              />
              <div>
                <div className="font-bold text-lg">Je diploma is klaar!</div>
                <div className="text-white/90 text-sm">Klik hier om je diploma te downloaden</div>
              </div>
            </Link>
          ) : (
            <Link
              href="/diploma"
              className="flex items-center gap-4 bg-white p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <Image
                src="/images/diploma/lettoria_seal.png"
                alt="Diploma"
                width={50}
                height={50}
                className="flex-shrink-0 opacity-50"
              />
              <div>
                <div className="font-bold text-gray-700">Diploma</div>
                <div className="text-gray-500 text-sm">{threeStarLessons} / {TOTAL_LESSONS} lessen met 3 sterren</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
