import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GameKey, Difficulty } from 'types/games.type.ts';
import { usePlayerName } from '@hooks/use-player-name.hook.ts';
import CatchGame from '@components/catch-game.component.tsx';

import { PATH_MINIGAMES } from '@utils/navigate.utils';

const GAME_LABEL: Record<GameKey, string> = {
  catch: 'Catch & Clean',
  memory: 'Memory Express',
  word: 'Parola Segreta',
};

const isDifficulty = (v: any): v is Difficulty =>
  v === 'junior' || v === 'standard' || v === 'pro';
const isGame = (v: any): v is GameKey =>
  v === 'catch' || v === 'memory' || v === 'word';

export default function GameScreen() {
  const { game, difficulty } = useParams<{
    game: string;
    difficulty?: string;
  }>();
  const navigate = useNavigate();
  const { name } = usePlayerName();

  const g = useMemo<GameKey | null>(() => (isGame(game) ? game : null), [game]);
  const d = useMemo<Difficulty>(
    () => (isDifficulty(difficulty) ? difficulty : 'junior'),
    [difficulty]
  );

  useEffect(() => {
    if (!g) navigate(PATH_MINIGAMES, { replace: true });
  }, [g, navigate]);

  // gate via URL usando il TUO UsernameGate screen
  useEffect(() => {
    if (!g) return;
    if (!name || !name.trim()) {
      console.log('Redirecting to user gate because name is:', name);
      const ret = `${PATH_MINIGAMES}${g}/${d}`;
      navigate(`${PATH_MINIGAMES}user?ret=${encodeURIComponent(ret)}`, {
        replace: true,
      });
    }
  }, [name, g, d, navigate]);

  const handleGameOver = useCallback(
    (score: number) => {
      if (!g) return;
      navigate(
        `${PATH_MINIGAMES}submit-score?game=${encodeURIComponent(
          g
        )}&difficulty=${encodeURIComponent(d)}&score=${encodeURIComponent(
          String(score)
        )}`
      );
    },
    [navigate, g, d]
  );

  if (!g) return null;

  const title = GAME_LABEL[g];

  return (
    <div className='mx-auto max-w-5xl px-4 py-6'>
      <header className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase opacity-70'>Minigioco</p>
          <h1 className='text-xl md:text-2xl font-bold tracking-tight'>
            {title}
          </h1>
          <p className='text-xs opacity-70'>
            Difficoltà: <strong>{d}</strong>
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => navigate(`/minigames/${g}`)}
            className='rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition'
          >
            Cambia difficoltà
          </button>
          <button
            onClick={() => navigate('/minigames')}
            className='rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition'
          >
            Minigiochi
          </button>
        </div>
      </header>

      <div className='relative w-full min-h-[60svh] overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10'>
        {g === 'catch' ? (
          <CatchGame difficulty={d} onGameOver={handleGameOver} />
        ) : (
          <div className='absolute inset-0 grid place-items-center'>
            <p className='text-lg font-medium text-white/80'>Coming soon…</p>
          </div>
        )}
      </div>

      <footer className='mt-4 text-xs opacity-60'>
        Comandi: trascina col mouse/touch. Durata ~60s.
      </footer>
    </div>
  );
}
