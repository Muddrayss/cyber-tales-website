import { DiffItem } from "types/games.type";

export const DIFFICULTIES_METADATA: DiffItem[] = [
  {
    id: 'junior',
    label: 'Junior',
    subtitle: 'Rilassato • Perfetto per iniziare',
    hint: 'Velocità bassa, più oggetti “buoni”',
    ring: 'ring-emerald-400',
    bg: 'bg-emerald-500/20 backdrop-blur-sm',
  },
  {
    id: 'standard',
    label: 'Standard',
    subtitle: 'Bilanciato • Un po’ di sfida',
    hint: 'Velocità media, mix bilanciato',
    ring: 'ring-indigo-400',
    bg: 'bg-indigo-500/20 backdrop-blur-sm',
  },
  {
    id: 'pro',
    label: 'Pro',
    subtitle: 'Intenso • Per punteggi alti',
    hint: 'Velocità alta, meno margine d’errore',
    ring: 'ring-rose-400',
    bg: 'bg-rose-500/20 backdrop-blur-sm',
  },
];
