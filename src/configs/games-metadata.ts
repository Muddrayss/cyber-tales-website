import { GameCard } from 'types/games.type';

export const GAMES_METADATA: GameCard[] = [
  {
    id: 'catch',
    title: 'Catch & Clean',
    subtitle: 'Prendi il buono, evita il cattivo',
    hint: 'Loop rapido, combo e moltiplicatori',
    icon: '🧺',
    ring: 'ring-emerald-400',
    bg: 'bg-emerald-500/20 backdrop-blur-sm',
  },
  {
    id: 'memory',
    title: 'Memory Express',
    subtitle: 'Gira e abbina le coppie',
    hint: 'Griglie 4×4 / 5×4 / 6×6',
    icon: '🧠',
    ring: 'ring-indigo-400',
    bg: 'bg-indigo-500/20 backdrop-blur-sm',
  },
  {
    id: 'word',
    title: 'Parola Segreta',
    subtitle: 'Indovina la parola',
    hint: 'Suggerimenti, errori limitati',
    icon: '🔤',
    ring: 'ring-rose-400',
    bg: 'bg-rose-500/20 backdrop-blur-sm',
  },
];