'use client';

import { useTypingStore } from '@/lib/stores/typingStore';

// Keyboard layout (Dutch QWERTY)
const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
];

// Finger assignments for each key
// 0 = left pinky, 1 = left ring, 2 = left middle, 3 = left index
// 4 = right index, 5 = right middle, 6 = right ring, 7 = right pinky
const FINGER_MAP: Record<string, number> = {
  // Top row
  'q': 0, 'w': 1, 'e': 2, 'r': 3, 't': 3,
  'y': 4, 'u': 4, 'i': 5, 'o': 6, 'p': 7,
  // Home row
  'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 3,
  'h': 4, 'j': 4, 'k': 5, 'l': 6, ';': 7,
  // Bottom row
  'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 3,
  'n': 4, 'm': 4, ',': 5, '.': 6,
  // Space
  ' ': 8, // Thumbs
};

// Finger colors
const FINGER_COLORS: Record<number, string> = {
  0: 'bg-pink-400',    // Left pinky
  1: 'bg-orange-400',  // Left ring
  2: 'bg-yellow-400',  // Left middle
  3: 'bg-green-400',   // Left index
  4: 'bg-cyan-400',    // Right index
  5: 'bg-blue-400',    // Right middle
  6: 'bg-purple-400',  // Right ring
  7: 'bg-pink-400',    // Right pinky
  8: 'bg-gray-400',    // Thumbs (space)
};

// Home row keys (have bumps on F and J)
const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

interface VirtualKeyboardProps {
  showFingerHints?: boolean;
  highlightKey?: string;
}

export function VirtualKeyboard({ showFingerHints = true, highlightKey }: VirtualKeyboardProps) {
  const { targetText, currentIndex } = useTypingStore();

  // Get the current key to press
  const currentKey = highlightKey || targetText[currentIndex]?.toLowerCase() || '';

  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-xl">
      {/* Main keyboard rows */}
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1">
          {/* Add offset for home and bottom rows */}
          {rowIndex === 1 && <div className="w-4" />}
          {rowIndex === 2 && <div className="w-8" />}

          {row.map((key) => {
            const isCurrentKey = key === currentKey;
            const isHomeKey = HOME_KEYS.includes(key);
            const fingerIndex = FINGER_MAP[key];
            const fingerColor = FINGER_COLORS[fingerIndex];

            return (
              <div
                key={key}
                className={`
                  relative w-12 h-12 rounded-lg flex items-center justify-center
                  font-mono text-lg font-bold transition-all duration-150
                  ${isCurrentKey
                    ? 'bg-eric-gold text-gray-900 scale-110 shadow-lg shadow-eric-gold/50'
                    : 'bg-gray-700 text-gray-300'
                  }
                  ${isHomeKey && !isCurrentKey ? 'border-b-4 border-gray-500' : ''}
                `}
              >
                {key === ';' ? ';' : key.toUpperCase()}

                {/* F and J bumps */}
                {(key === 'f' || key === 'j') && (
                  <div className="absolute bottom-1 w-4 h-0.5 bg-gray-500 rounded" />
                )}

                {/* Finger hint dot */}
                {showFingerHints && isCurrentKey && (
                  <div
                    className={`absolute -bottom-3 w-3 h-3 rounded-full ${fingerColor} animate-bounce`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Space bar */}
      <div className="flex justify-center mt-1">
        <div
          className={`
            w-64 h-10 rounded-lg flex items-center justify-center
            font-mono text-sm transition-all duration-150
            ${currentKey === ' '
              ? 'bg-eric-gold text-gray-900 scale-105 shadow-lg shadow-eric-gold/50'
              : 'bg-gray-700 text-gray-400'
            }
          `}
        >
          SPATIE
        </div>
      </div>

      {/* Finger legend */}
      {showFingerHints && (
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span>Links:</span>
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-1">
            <span>Rechts:</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
        </div>
      )}
    </div>
  );
}
