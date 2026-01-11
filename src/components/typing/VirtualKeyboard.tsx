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

// Finger names in Dutch
const FINGER_NAMES_LEFT = ['Pink', 'Ring', 'Middel', 'Wijs'];
const FINGER_NAMES_RIGHT = ['Wijs', 'Middel', 'Ring', 'Pink'];
const FINGER_COLORS_LEFT = ['bg-pink-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
const FINGER_COLORS_RIGHT = ['bg-cyan-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'];

// Home row keys (have bumps on F and J)
const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

interface VirtualKeyboardProps {
  showFingerHints?: boolean;
  highlightKey?: string;
  lessonId?: number;
}

export function VirtualKeyboard({ showFingerHints = true, highlightKey, lessonId = 0 }: VirtualKeyboardProps) {
  const { targetText, currentIndex } = useTypingStore();

  // Get the current key to press
  const currentKey = highlightKey || targetText[currentIndex]?.toLowerCase() || '';

  // Show detailed legend only for first 5 lessons (0-4)
  const showDetailedLegend = lessonId <= 4;

  return (
    <div className="bg-gray-800/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-gray-700 box-glow">
      {/* Main keyboard rows */}
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1">
          {/* Add offset for home and bottom rows */}
          {rowIndex === 1 && <div className="w-4" />}
          {rowIndex === 2 && <div className="w-8" />}

          {row.map((key) => {
            const isCurrentKey = key === currentKey;
            const isHomeKey = HOME_KEYS.includes(key);
            const isHomePosition = key === 'f' || key === 'j';
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
                  ${isHomePosition && !isCurrentKey ? 'ring-2 ring-eric-gold/40' : ''}
                `}
              >
                {key === ';' ? ';' : key.toUpperCase()}

                {/* F and J bumps - more prominent */}
                {isHomePosition && (
                  <div className="absolute bottom-1.5 w-5 h-1 bg-eric-gold/70 rounded-full" />
                )}

                {/* Finger hint dot - larger */}
                {showFingerHints && isCurrentKey && (
                  <div
                    className={`absolute -bottom-4 w-5 h-5 rounded-full ${fingerColor} animate-bounce border-2 border-white/30 shadow-md`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Space bar */}
      <div className="flex justify-center mt-2">
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

      {/* Detailed finger legend - only for lessons 0-4 */}
      {showFingerHints && showDetailedLegend && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          {/* Finger color guide */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {/* Left hand */}
            <div className="text-center">
              <div className="text-gray-300 font-semibold mb-2">Linkerhand</div>
              <div className="flex flex-col gap-1 items-center">
                {FINGER_NAMES_LEFT.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${FINGER_COLORS_LEFT[idx]} border border-white/20`} />
                    <span className="text-gray-400 text-xs">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right hand */}
            <div className="text-center">
              <div className="text-gray-300 font-semibold mb-2">Rechterhand</div>
              <div className="flex flex-col gap-1 items-center">
                {FINGER_NAMES_RIGHT.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${FINGER_COLORS_RIGHT[idx]} border border-white/20`} />
                    <span className="text-gray-400 text-xs">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Home position tip */}
          <div className="bg-eric-gold/10 rounded-lg p-3 text-center border border-eric-gold/30">
            <div className="flex items-center justify-center gap-2 text-eric-gold">
              <span className="text-lg">💡</span>
              <span className="text-sm font-medium">
                Je wijsvingers starten altijd op <span className="font-bold">F</span> en <span className="font-bold">J</span> — voel de streepjes!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
