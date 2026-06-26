// Achievement definitions for Eric's Race

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  coinReward: number;
  condition: AchievementCondition;
  secret?: boolean; // Hidden until unlocked
}

export type AchievementCondition =
  | { type: 'combo'; value: number }
  | { type: 'fever_count'; value: number }
  | { type: 'score'; value: number }
  | { type: 'perfect_game' } // No mistakes
  | { type: 'total_score'; value: number }
  | { type: 'games_played'; value: number }
  | { type: 'crystals_collected'; value: number }
  | { type: 'powerup_collected'; powerup: string }
  | { type: 'bomb_avoided'; value: number };

export const ACHIEVEMENTS: Achievement[] = [
  // Combo achievements
  {
    id: 'combo_5',
    name: 'Eerste Stappen',
    description: '5x combo bereiken',
    icon: '🔥',
    coinReward: 10,
    condition: { type: 'combo', value: 5 },
  },
  {
    id: 'combo_10',
    name: 'Op Dreef',
    description: '10x combo bereiken',
    icon: '🔥',
    coinReward: 25,
    condition: { type: 'combo', value: 10 },
  },
  {
    id: 'combo_20',
    name: 'Onstopbaar',
    description: '20x combo bereiken',
    icon: '💪',
    coinReward: 50,
    condition: { type: 'combo', value: 20 },
  },
  {
    id: 'combo_50',
    name: 'LEGENDE',
    description: '50x combo bereiken',
    icon: '👑',
    coinReward: 200,
    condition: { type: 'combo', value: 50 },
  },

  // Fever achievements
  {
    id: 'fever_first',
    name: 'Eerste Turbo',
    description: 'Eerste turbomodus bereiken',
    icon: '🌡️',
    coinReward: 15,
    condition: { type: 'fever_count', value: 1 },
  },
  {
    id: 'fever_3',
    name: 'Gloeiend Heet',
    description: '3x turbo in één spel',
    icon: '🔥',
    coinReward: 75,
    condition: { type: 'fever_count', value: 3 },
  },

  // Score achievements
  {
    id: 'score_5000',
    name: 'Eerste Goud',
    description: '5.000 punten in één spel',
    icon: '⭐',
    coinReward: 15,
    condition: { type: 'score', value: 5000 },
  },
  {
    id: 'score_10000',
    name: 'Muntenmeester',
    description: '10.000 punten in één spel',
    icon: '🪙',
    coinReward: 50,
    condition: { type: 'score', value: 10000 },
  },
  {
    id: 'score_25000',
    name: 'Hoogvlieger',
    description: '25.000 punten in één spel',
    icon: '🚀',
    coinReward: 100,
    condition: { type: 'score', value: 25000 },
  },

  // Precision
  {
    id: 'perfect',
    name: 'Scherpschutter',
    description: 'Spel zonder fouten afronden',
    icon: '🎯',
    coinReward: 100,
    condition: { type: 'perfect_game' },
  },

  // Power-ups
  {
    id: 'shield_first',
    name: 'Beschermer',
    description: 'Eerste schild verzamelen',
    icon: '🛡️',
    coinReward: 10,
    condition: { type: 'powerup_collected', powerup: 'shield' },
  },
  {
    id: 'magnet_first',
    name: 'Magneet Meester',
    description: 'Eerste magneet verzamelen',
    icon: '🧲',
    coinReward: 20,
    condition: { type: 'powerup_collected', powerup: 'magnet' },
  },

  // Milestones
  {
    id: 'total_100000',
    name: 'Puntenverzamelaar',
    description: '100.000 punten totaal',
    icon: '📊',
    coinReward: 150,
    condition: { type: 'total_score', value: 100000 },
  },
  {
    id: 'games_10',
    name: 'Vaste Klant',
    description: '10 spellen gespeeld',
    icon: '🎮',
    coinReward: 50,
    condition: { type: 'games_played', value: 10 },
  },
];

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get all achievements for a specific condition type
export function getAchievementsByType(type: AchievementCondition['type']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.condition.type === type);
}
