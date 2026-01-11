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

// Finger colors - background classes
const FINGER_BG_COLORS: Record<number, string> = {
  0: 'bg-pink-400',    // Left pinky
  1: 'bg-orange-400',  // Left ring
  2: 'bg-yellow-400',  // Left middle
  3: 'bg-green-400',   // Left index
  4: 'bg-cyan-400',    // Right index
  5: 'bg-blue-400',    // Right middle
  6: 'bg-purple-400',  // Right ring
  7: 'bg-pink-400',    // Right pinky
  8: 'bg-gray-500',    // Thumbs (space)
};

// Finger colors - hex values for SVG
const FINGER_HEX_COLORS: Record<number, string> = {
  0: '#f472b6', // pink-400
  1: '#fb923c', // orange-400
  2: '#facc15', // yellow-400
  3: '#4ade80', // green-400
  4: '#22d3ee', // cyan-400
  5: '#60a5fa', // blue-400
  6: '#c084fc', // purple-400
  7: '#f472b6', // pink-400
};

// Home row keys (have bumps on F and J)
const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

// Left Hand SVG - viewed from above, fingers pointing UP toward keyboard
function LeftHandSVG({ activeFingerIndex }: { activeFingerIndex: number | null }) {
  // Left hand: pinky=0, ring=1, middle=2, index=3
  const fingers = [
    { x: 12, fingerIndex: 0 },  // pinky (leftmost)
    { x: 28, fingerIndex: 1 },  // ring
    { x: 44, fingerIndex: 2 },  // middle
    { x: 60, fingerIndex: 3 },  // index
  ];

  return (
    <svg viewBox="0 0 90 120" className="w-20 h-28">
      {/* Wrist/sleeve */}
      <rect x="15" y="95" width="50" height="20" rx="4" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />

      {/* Palm */}
      <path
        d="M 10 95 Q 5 70 12 55 L 12 55 L 68 55 Q 75 70 70 95 Z"
        fill="#e8c4a0"
        stroke="#d4a574"
        strokeWidth="2"
      />

      {/* Fingers - pointing UP */}
      {fingers.map(({ x, fingerIndex }) => {
        const isActive = activeFingerIndex === fingerIndex;
        const color = FINGER_HEX_COLORS[fingerIndex];
        const height = fingerIndex === 2 ? 45 : fingerIndex === 1 || fingerIndex === 3 ? 40 : 32; // middle longest

        return (
          <g key={fingerIndex}>
            <rect
              x={x}
              y={55 - height}
              width={12}
              height={height}
              rx={6}
              fill={color}
              stroke={isActive ? '#fff' : '#00000030'}
              strokeWidth={isActive ? 3 : 1.5}
              className={isActive ? 'animate-pulse' : ''}
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' : 'none',
              }}
            />
          </g>
        );
      })}

      {/* Thumb - pointing RIGHT toward center */}
      <rect
        x="68"
        y="60"
        width="28"
        height="14"
        rx={7}
        fill="#e8c4a0"
        stroke="#d4a574"
        strokeWidth="2"
      />
    </svg>
  );
}

// Right Hand SVG - viewed from above, fingers pointing UP toward keyboard
function RightHandSVG({ activeFingerIndex }: { activeFingerIndex: number | null }) {
  // Right hand: index=4, middle=5, ring=6, pinky=7
  const fingers = [
    { x: 18, fingerIndex: 4 },  // index
    { x: 34, fingerIndex: 5 },  // middle
    { x: 50, fingerIndex: 6 },  // ring
    { x: 66, fingerIndex: 7 },  // pinky (rightmost)
  ];

  return (
    <svg viewBox="0 0 90 120" className="w-20 h-28">
      {/* Wrist/sleeve */}
      <rect x="25" y="95" width="50" height="20" rx="4" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />

      {/* Palm */}
      <path
        d="M 20 95 Q 15 70 22 55 L 22 55 L 78 55 Q 85 70 80 95 Z"
        fill="#e8c4a0"
        stroke="#d4a574"
        strokeWidth="2"
      />

      {/* Fingers - pointing UP */}
      {fingers.map(({ x, fingerIndex }) => {
        const isActive = activeFingerIndex === fingerIndex;
        const color = FINGER_HEX_COLORS[fingerIndex];
        const height = fingerIndex === 5 ? 45 : fingerIndex === 4 || fingerIndex === 6 ? 40 : 32; // middle longest

        return (
          <g key={fingerIndex}>
            <rect
              x={x}
              y={55 - height}
              width={12}
              height={height}
              rx={6}
              fill={color}
              stroke={isActive ? '#fff' : '#00000030'}
              strokeWidth={isActive ? 3 : 1.5}
              className={isActive ? 'animate-pulse' : ''}
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' : 'none',
              }}
            />
          </g>
        );
      })}

      {/* Thumb - pointing LEFT toward center */}
      <rect
        x="-6"
        y="60"
        width="28"
        height="14"
        rx={7}
        fill="#e8c4a0"
        stroke="#d4a574"
        strokeWidth="2"
      />
    </svg>
  );
}

interface VirtualKeyboardProps {
  showFingerHints?: boolean;
  highlightKey?: string;
  lessonId?: number;
}

export function VirtualKeyboard({ showFingerHints = true, highlightKey, lessonId = 0 }: VirtualKeyboardProps) {
  const { targetText, currentIndex } = useTypingStore();

  // Get the current key to press
  const currentKey = highlightKey || targetText[currentIndex]?.toLowerCase() || '';
  const currentFingerIndex = currentKey ? FINGER_MAP[currentKey] : null;

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
            const fingerBgColor = FINGER_BG_COLORS[fingerIndex];

            return (
              <div
                key={key}
                className={`
                  relative w-12 h-12 rounded-lg flex items-center justify-center
                  font-mono text-lg font-bold transition-all duration-150
                  ${isCurrentKey
                    ? `${fingerBgColor} text-gray-900 scale-110 shadow-lg`
                    : 'bg-gray-700 text-gray-300'
                  }
                  ${isHomeKey && !isCurrentKey ? 'border-b-4 border-gray-500' : ''}
                  ${isHomePosition && !isCurrentKey ? 'ring-2 ring-eric-gold/40' : ''}
                `}
                style={isCurrentKey ? {
                  boxShadow: `0 0 20px ${FINGER_HEX_COLORS[fingerIndex]}80`,
                } : undefined}
              >
                <span className={isCurrentKey ? 'animate-bounce' : ''}>
                  {key === ';' ? ';' : key.toUpperCase()}
                </span>

                {/* F and J bumps - more prominent */}
                {isHomePosition && !isCurrentKey && (
                  <div className="absolute bottom-1.5 w-5 h-1 bg-eric-gold/70 rounded-full" />
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
              ? 'bg-gray-500 text-white scale-105 shadow-lg'
              : 'bg-gray-700 text-gray-400'
            }
          `}
        >
          <span className={currentKey === ' ' ? 'animate-bounce' : ''}>
            SPATIE
          </span>
        </div>
      </div>

      {/* Hand illustrations - only for lessons 0-4 */}
      {showFingerHints && showDetailedLegend && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          {/* Hands - thumbs pointing toward center */}
          <div className="flex justify-center items-center gap-4">
            <div className="text-center">
              <LeftHandSVG activeFingerIndex={currentFingerIndex !== null && currentFingerIndex <= 3 ? currentFingerIndex : null} />
              <div className="text-gray-400 text-xs">Linkerhand</div>
            </div>
            <div className="text-center">
              <RightHandSVG activeFingerIndex={currentFingerIndex !== null && currentFingerIndex >= 4 && currentFingerIndex <= 7 ? currentFingerIndex : null} />
              <div className="text-gray-400 text-xs">Rechterhand</div>
            </div>
          </div>

          {/* Home position tip */}
          <div className="bg-eric-gold/10 rounded-lg p-3 text-center border border-eric-gold/30 mt-4">
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
