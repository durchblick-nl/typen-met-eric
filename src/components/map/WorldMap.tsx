'use client';

import { motion } from 'framer-motion';
import { REGIONS, Region } from '@/lib/data/regions';
import Link from 'next/link';
import Image from 'next/image';

interface WorldMapProps {
  completedLessons: number;
  currentLesson: number;
}

export function WorldMap({ completedLessons, currentLesson }: WorldMapProps) {
  const isRegionUnlocked = (region: Region) => completedLessons >= region.requiredLessons;
  const isRegionCurrent = (region: Region) => {
    const nextLesson = region.lessons.find((l) => l.id === currentLesson);
    return nextLesson !== undefined;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-eric-gold/50">
      {/* Map Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/map/world-map-bg.png"
          alt="Map of Lettoria"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Background decorations */}


      {/* Paths between regions */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grot to Dorp */}
        <path
          d="M 50 85 L 50 70"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 1 ? 1 : 0.3}
        />
        {/* Dorp to Velden */}
        <path
          d="M 50 70 L 30 50"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 6 ? 1 : 0.3}
        />
        {/* Dorp to Zee */}
        <path
          d="M 50 70 L 75 50"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 22 ? 1 : 0.3}
        />
        {/* Velden to Woud */}
        <path
          d="M 30 50 L 25 30"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 12 ? 1 : 0.3}
        />
        {/* Woud to Toppen */}
        <path
          d="M 25 30 L 50 15"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 18 ? 1 : 0.3}
        />
        {/* Toppen to Kasteel */}
        <path
          d="M 50 15 L 75 20"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 28 ? 1 : 0.3}
        />
        {/* Zee to Kasteel */}
        <path
          d="M 75 50 L 75 20"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          fill="none"
          opacity={completedLessons >= 28 ? 1 : 0.3}
        />
      </svg>

      {/* Region markers */}
      {REGIONS.map((region) => {
        const unlocked = isRegionUnlocked(region);
        const current = isRegionCurrent(region);
        const hasLessons = region.lessons.length > 0;

        return (
          <motion.div
            key={region.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${region.position.x}%`,
              top: `${region.position.y}%`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: REGIONS.indexOf(region) * 0.1 }}
          >
            {unlocked && hasLessons ? (
              <Link href={`/regio/${region.id}`}>
                <motion.div
                  className={`
                    relative cursor-pointer
                    ${current ? 'z-10' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect for current region */}
                  {current && (
                    <motion.div
                      className="absolute inset-0 bg-eric-gold rounded-full blur-xl"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ transform: 'scale(1.5)' }}
                    />
                  )}

                  <div
                    className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center
                      text-3xl shadow-lg border-4 overflow-hidden
                      ${current ? 'border-eric-gold bg-white' : 'border-white/50 bg-white/80'}
                    `}
                  >
                    {region.imageUrl ? (
                      <div className="relative w-12 h-12">
                        <Image src={region.imageUrl} alt={region.name} fill className="object-contain" />
                      </div>
                    ) : (
                      region.icon
                    )}
                  </div>

                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded">
                      {region.name}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ) : (
              <div className="relative">
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    text-2xl shadow-lg border-4 overflow-hidden
                    ${unlocked ? 'border-white/50 bg-white/60' : 'border-gray-400 bg-gray-300'}
                    ${!unlocked ? 'grayscale opacity-50' : ''}
                  `}
                >
                  {unlocked && region.imageUrl ? (
                    <div className="relative w-10 h-10">
                      <Image src={region.imageUrl} alt={region.name} fill className="object-contain" />
                    </div>
                  ) : (
                    unlocked ? region.icon : '🔒'
                  )}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-medium text-gray-500 bg-white/60 px-2 py-0.5 rounded">
                    {region.name}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Map title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <h2 className="text-xl font-bold text-eric-green bg-white/80 px-4 py-1 rounded-full shadow">
          🗺️ Lettoria
        </h2>
      </div>
    </div>
  );
}
