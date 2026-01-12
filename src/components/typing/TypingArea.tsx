'use client';

import { useTypingStore } from '@/lib/stores/typingStore';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

export function TypingArea() {
  const {
    targetText,
    currentIndex,
    typedChars,
    errors,
    isComplete,
    handleKeyPress
  } = useTypingStore();

  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: !isComplete && targetText.length > 0,
  });

  if (!targetText) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border-2 border-eric-gold/50 box-glow transition-all duration-300 hover:shadow-2xl hover:border-eric-gold">
      <p className="text-sm text-gray-500 mb-4">Typ dit:</p>

      <div className="font-mono text-2xl leading-relaxed tracking-wide mb-6 min-h-[80px]">
        {targetText.split('').map((char, index) => {
          let className = 'inline-block transition-colors duration-100 ';

          if (index < currentIndex) {
            // Already typed
            if (errors.includes(index)) {
              className += 'text-fout bg-fout/10';
            } else {
              className += 'text-succes';
            }
          } else if (index === currentIndex) {
            // Current character
            className += 'text-eric-green bg-eric-gold/30 animate-pulse';
          } else {
            // Not yet typed
            className += 'text-gray-400';
          }

          // Handle space display - show visible symbol ␣
          const displayChar = char === ' ' ? '␣' : char;

          return (
            <span key={index} className={className}>
              {displayChar}
            </span>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {targetText.split('').map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-colors duration-200 ${index < currentIndex
                ? errors.includes(index)
                  ? 'bg-fout'
                  : 'bg-succes'
                : index === currentIndex
                  ? 'bg-eric-gold'
                  : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
