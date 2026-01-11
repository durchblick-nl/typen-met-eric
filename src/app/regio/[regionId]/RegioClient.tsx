'use client';

import { useProgressStore } from '@/lib/stores/progressStore';
import { getRegionById } from '@/lib/data/regions';
import { Eric } from '@/components/eric';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface RegioClientProps {
  regionId: string;
}

export function RegioClient({ regionId }: RegioClientProps) {
  const { completedLessons, lessonStars } = useProgressStore();

  const region = getRegionById(regionId);

  if (!region) {
    notFound();
  }

  const isLessonCompleted = (lessonId: number) => completedLessons.includes(lessonId);
  const hasPerfectScore = (lessonId: number) => lessonStars[lessonId] === 3;
  const isLessonUnlocked = (lessonId: number) => {
    if (lessonId === 0) return true;
    // Need 3 stars on previous lesson to unlock next
    return lessonStars[lessonId - 1] === 3;
  };

  const completedInRegion = region.lessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;

  return (
    <main className="min-h-screen bg-perkament p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/kaart"
            className="text-eric-green hover:text-eric-green/80 transition-colors"
          >
            &larr; Kaart
          </Link>

          <div className="text-center">
            {region.imageUrl ? (
              <Image
                src={region.imageUrl}
                alt={region.name}
                width={64}
                height={64}
                className="mx-auto mb-1"
              />
            ) : (
              <span className="text-4xl">{region.icon}</span>
            )}
            <h1 className="text-2xl font-bold text-eric-green">{region.name}</h1>
          </div>

          <div className="text-sm text-gray-500">
            {completedInRegion}/{region.lessons.length}
          </div>
        </div>

        {/* Eric */}
        <div className="mb-8">
          <Eric
            mood="encouraging"
            message={region.description}
          />
        </div>

        {/* Lessons list */}
        <div className="space-y-4">
          {region.lessons.map((lesson) => {
            const completed = isLessonCompleted(lesson.id);
            const unlocked = isLessonUnlocked(lesson.id);
            const stars = lessonStars[lesson.id] || 0;

            const needsMoreStars = completed && stars < 3;

            return (
              <div
                key={lesson.id}
                className={`
                  relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all
                  ${completed && stars === 3 ? 'border-succes' : completed ? 'border-accent' : unlocked ? 'border-eric-gold' : 'border-gray-200'}
                  ${!unlocked ? 'opacity-60' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-xl
                        ${completed && stars === 3 ? 'bg-succes text-white' : completed ? 'bg-accent/20' : unlocked ? 'bg-eric-gold/20' : 'bg-gray-100'}
                      `}
                    >
                      {completed && stars === 3 ? '✓' : completed ? '↺' : unlocked ? lesson.id + 1 : '🔒'}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">{lesson.description}</p>
                      {needsMoreStars && (
                        <p className="text-xs text-accent mt-1">Nog oefenen voor 3 sterren!</p>
                      )}
                      {lesson.newKeys.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {lesson.newKeys.map((key) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono"
                            >
                              {key === ' ' ? 'SPATIE' : key.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stars */}
                    {completed && (
                      <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-xl ${s <= stars ? 'text-eric-gold' : 'text-gray-300'}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Play button */}
                    {unlocked && (
                      <Link
                        href={`/les/${lesson.id}`}
                        className={`
                          px-6 py-2 rounded-full font-semibold transition-all
                          ${completed && stars === 3
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : needsMoreStars
                              ? 'bg-accent hover:bg-accent/90 text-white'
                              : 'bg-eric-green hover:bg-eric-green/90 text-white'
                          }
                        `}
                      >
                        {completed && stars === 3 ? 'Opnieuw' : needsMoreStars ? 'Herhalen' : 'Start'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {region.lessons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl mb-4 block">🚧</span>
            <p>Deze regio is nog in ontwikkeling!</p>
            <p className="text-sm">Kom later terug voor nieuwe lessen.</p>
          </div>
        )}
      </div>
    </main>
  );
}
