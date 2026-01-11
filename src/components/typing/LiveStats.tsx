'use client';

import { useTypingStore } from '@/lib/stores/typingStore';

export function LiveStats() {
  const { wpm, accuracy, currentIndex, targetText, isActive } = useTypingStore();

  if (!isActive && currentIndex === 0) {
    return null;
  }

  return (
    <div className="flex justify-center gap-8 text-center">
      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className="text-2xl font-bold text-eric-green">{wpm}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">WPM</div>
      </div>

      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className={`text-2xl font-bold ${accuracy >= 90 ? 'text-succes' : accuracy >= 70 ? 'text-accent' : 'text-fout'}`}>
          {accuracy}%
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Nauwkeurig</div>
      </div>

      <div className="bg-white/80 rounded-xl px-6 py-3 shadow-md">
        <div className="text-2xl font-bold text-gray-700">
          {currentIndex}/{targetText.length}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Voortgang</div>
      </div>
    </div>
  );
}
