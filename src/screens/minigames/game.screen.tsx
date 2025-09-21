import { useEffect, useMemo, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GameKey, Difficulty } from 'types/games.type.ts';
import { usePlayerName } from '@hooks/use-player-name.hook.ts';
import CatchGame from '@components/catch-game.component.tsx';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

// navigation
import { PATH_MINIGAMES } from '@utils/navigate.utils';

const isDifficulty = (v: any): v is Difficulty =>
  v === 'junior' || v === 'standard' || v === 'pro';
const isGame = (v: any): v is GameKey =>
  v === 'catch' || v === 'memory' || v === 'word';

export default function GameScreen() {
  const { navbarHeight } = useContext(NavbarContext);
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

  return (
    <div
      className='mx-auto w-full px-4 py-6 h-[90svh]'
      style={{ marginTop: navbarHeight }}
    >
      <div className='relative w-full h-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10'>
        {g === 'catch' ? (
          <CatchGame difficulty={d} onGameOver={handleGameOver} />
        ) : (
          <div className='absolute inset-0 grid place-items-center'>
            <p className='text-lg font-medium text-white/80'>Coming soon…</p>
          </div>
        )}
      </div>
    </div>
  );
}
