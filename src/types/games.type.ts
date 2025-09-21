// @types/games.type.ts

/** Keys for each mini-game. Extendable for future games. */
export type GameKey = 'catch' | 'memory' | 'word';

/** Difficulty levels available for all games. */
export type Difficulty = 'junior' | 'standard' | 'pro';

/** Configuration parameters for a given difficulty level (for Catch game). */
export interface CatchDifficultyConfig {
  spawnMsRange: [number, number]; // Random interval range for spawning items (ms)
  fallSpeed: { min: number; max: number }; // Falling speed range for items (px/sec)
  goodRatio: number; // Probability of spawning a "good" item (0-1)
  durationSec: number; // Total game duration in seconds
  badPenalty: number; // Points subtracted when catching a bad item
  baseScore: number; // Base points for catching a good item (before combo multiplier)
  comboBonus: number; // Extra points added for each good catch (flat bonus per catch)
  topBandRel: number; // Relative height of the top band (as a fraction of the basket height)
}

/** Simple record for a score submission. */
export interface ScoreRecord {
  game: GameKey;
  difficulty: Difficulty;
  score: number;
  email?: string;
}

/* Game card metadata for selection UI */
export type GameCard = {
  id: GameKey;
  title: string;
  subtitle: string;
  hint: string;
  icon: string; // emoji/placeholder (niente asset ora)
  ring: string;
  bg: string;
};

/* Difficulty item for selection UI */
export type DiffItem = {
  id: Difficulty;
  label: string;
  subtitle: string;
  hint: string;
  ring: string;
  bg: string;
};
