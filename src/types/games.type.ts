export type GameKey = 'catch' | 'memory' | 'word';

export type GameCard = {
  id: GameKey;
  title: string;
  subtitle: string;
  hint: string;
  icon: string; // emoji/placeholder (niente asset ora)
  ring: string;
  bg: string;
};

// Difficulty

export type Difficulty = 'junior' | 'standard' | 'pro';

/* Definizione card difficoltà */
export type DiffItem = {
  id: Difficulty;
  label: string;
  subtitle: string;
  hint: string;
  ring: string;
  bg: string;
};