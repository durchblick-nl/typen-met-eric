'use client';

import { useTypingStore } from '@/lib/stores/typingStore';

interface LiveStatsProps {
  vertical?: boolean;
}

export function LiveStats({ vertical = false }: LiveStatsProps) {
  const { wpm, accuracy, currentIndex, targetText, isActive } = useTypingStore();

  // Always render to prevent layout shift, but show dashes when not started
  const showValues = isActive || currentIndex > 0;

  if (vertical) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-white/80 rounded-xl px-4 py-2 shadow-md text-center min-w-[80px]">
          <div className="text-xl font-bold text-eric-green">
            {showValues ? wpm : '-'}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">WPM</div>
        </div>

        <div className="bg-white/80 rounded-xl px-4 py-2 shadow-md text-center min-w-[80px]">
          <div className={`text-xl font-bold ${showValues ? (accuracy >= 90 ? 'text-succes' : accuracy >= 70 ? 'text-accent' : 'text-fout') : 'text-gray-400'}`}>
            {showValues ? `${accuracy}%` : '-'}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Nauwkeurig</div>
        </div>

        <div className="bg-white/80 rounded-xl px-4 py-2 shadow-md text-center min-w-[80px]">
          <div className="text-xl font-bold text-gray-700">
            {showValues ? `${currentIndex}/${targetText.length}` : `-/${targetText.length || '-'}`}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Voortgang</div>
        </div>
      </div>
    );
  }

  // Horizontal layout (original)
  return (
    <div className="flex justify-center gap-8 text-center">
      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className="text-2xl font-bold text-eric-green">
          {showValues ? wpm : '-'}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">WPM</div>
      </div>

      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className={`text-2xl font-bold ${showValues ? (accuracy >= 90 ? 'text-succes' : accuracy >= 70 ? 'text-accent' : 'text-fout') : 'text-gray-400'}`}>
          {showValues ? `${accuracy}%` : '-'}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Nauwkeurig</div>
      </div>

      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className="text-2xl font-bold text-gray-700">
          {showValues ? `${currentIndex}/${targetText.length}` : `-/${targetText.length || '-'}`}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Voortgang</div>
      </div>
    </div>
  );
}
