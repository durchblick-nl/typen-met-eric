// Crystal types for the bonus game

export type CrystalType =
  | 'normal'
  | 'gold'
  | 'rainbow'
  | 'bomb'
  | 'ice'
  | 'shield'
  | 'slowmo'
  | 'magnet';

export interface CrystalTypeConfig {
  type: CrystalType;
  name: string;
  description: string;
  spawnWeight: number; // Higher = more common
  colors: string[]; // Tailwind gradient classes
  glowColor: string;
  icon?: string; // Optional icon overlay
  scoreMultiplier: number;
  feverBonus: number; // Added to fever meter
  special?: 'danger' | 'powerup';
}

export const CRYSTAL_TYPES: Record<CrystalType, CrystalTypeConfig> = {
  normal: {
    type: 'normal',
    name: 'Kristall',
    description: 'Ein normaler Kristall',
    spawnWeight: 70,
    colors: [
      'from-cyan-300 to-cyan-500',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-emerald-400 to-emerald-600',
      'from-amber-300 to-amber-500',
      'from-blue-400 to-blue-600',
      'from-rose-400 to-rose-600',
    ],
    glowColor: 'cyan',
    scoreMultiplier: 1,
    feverBonus: 0,
  },
  gold: {
    type: 'gold',
    name: 'Gold Kristall',
    description: 'Doppelte Punkte!',
    spawnWeight: 12,
    colors: ['from-yellow-300 via-amber-400 to-yellow-500'],
    glowColor: '#fbbf24',
    icon: '✨',
    scoreMultiplier: 2,
    feverBonus: 5,
  },
  rainbow: {
    type: 'rainbow',
    name: 'Regenbogen Kristall',
    description: 'Füllt den Fieber-Balken!',
    spawnWeight: 5,
    colors: ['from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400'],
    glowColor: '#a855f7',
    icon: '🌈',
    scoreMultiplier: 1.5,
    feverBonus: 50, // Big fever boost!
  },
  bomb: {
    type: 'bomb',
    name: 'Bombe',
    description: 'Nicht tippen! Falscher Buchstabe.',
    spawnWeight: 7,
    colors: ['from-gray-700 via-red-900 to-gray-800'],
    glowColor: '#ef4444',
    icon: '💣',
    scoreMultiplier: 0,
    feverBonus: 0,
    special: 'danger',
  },
  ice: {
    type: 'ice',
    name: 'Eis Kristall',
    description: 'Verpasst = Slowdown!',
    spawnWeight: 4,
    colors: ['from-sky-200 via-cyan-300 to-sky-400'],
    glowColor: '#7dd3fc',
    icon: '❄️',
    scoreMultiplier: 1,
    feverBonus: 0,
    special: 'danger',
  },
  shield: {
    type: 'shield',
    name: 'Schild',
    description: 'Nächster Fehler kostet keine Energie',
    spawnWeight: 2,
    colors: ['from-blue-400 via-blue-500 to-indigo-600'],
    glowColor: '#3b82f6',
    icon: '🛡️',
    scoreMultiplier: 1,
    feverBonus: 0,
    special: 'powerup',
  },
  slowmo: {
    type: 'slowmo',
    name: 'Zeitlupe',
    description: '5 Sekunden langsamer',
    spawnWeight: 2,
    colors: ['from-violet-400 via-purple-500 to-violet-600'],
    glowColor: '#8b5cf6',
    icon: '⏱️',
    scoreMultiplier: 1,
    feverBonus: 0,
    special: 'powerup',
  },
  magnet: {
    type: 'magnet',
    name: 'Magnet',
    description: 'Sammelt alle Kristalle!',
    spawnWeight: 1,
    colors: ['from-pink-400 via-rose-500 to-pink-600'],
    glowColor: '#ec4899',
    icon: '🧲',
    scoreMultiplier: 1,
    feverBonus: 0,
    special: 'powerup',
  },
};

// Calculate total weight for spawn probability
const totalWeight = Object.values(CRYSTAL_TYPES).reduce((sum, t) => sum + t.spawnWeight, 0);

// Get a random crystal type based on spawn weights
export function getRandomCrystalType(): CrystalType {
  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (const config of Object.values(CRYSTAL_TYPES)) {
    cumulative += config.spawnWeight;
    if (rand < cumulative) {
      return config.type;
    }
  }

  return 'normal';
}

// Get config for a crystal type
export function getCrystalConfig(type: CrystalType): CrystalTypeConfig {
  return CRYSTAL_TYPES[type];
}

// Get a random color for normal crystals
export function getRandomNormalColor(): string {
  const colors = CRYSTAL_TYPES.normal.colors;
  return colors[Math.floor(Math.random() * colors.length)];
}
