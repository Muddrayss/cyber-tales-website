import { useMemo, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScoreForm from '@components/score-form.component.tsx';
import type { GameKey, Difficulty } from 'types/games.type.ts';

// navigation
import { PATH_MINIGAMES } from '@utils/navigate.utils';

// utils
import { capitalize } from '@utils/general.utils';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

const TITLE: Record<GameKey, string> = {
  catch: 'Catch & Clean',
  memory: 'Memory Express',
  word: 'Parola Segreta',
};

export default function SubmitScoreScreen() {
  const { navbarHeight } = useContext(NavbarContext);

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const game = (params.get('game') ?? 'catch') as GameKey;
  const difficulty = (params.get('difficulty') ?? 'junior') as Difficulty;
  const score = useMemo(() => Number(params.get('score') ?? 0), [params]);

  return (
    <div className='main-container'>
      <header
        className='mx-auto max-w-7xl px-6 pb-8 pt-4 md:pb-16 md:pt-8'
        style={{ marginTop: navbarHeight }}
      >
        <p className='text-xs uppercase text-white'>Minigioco</p>
        <h1 className='main-title my-3'>
          <span className='main-title-gradient'>{TITLE[game]}</span>
        </h1>
        <p className='text-xl'>
          Difficoltà:{' '}
          <span className='text-orange-300'>{capitalize(difficulty)}</span>
        </p>
        <p className='text-xl'>
          Punteggio: <span className='text-orange-300'>{score}</span>
        </p>
      </header>

      <ScoreForm
        game={game}
        difficulty={difficulty}
        score={score}
        onReplay={() =>
          navigate(`${PATH_MINIGAMES}${game}/${difficulty}`, { replace: true })
        }
        onLeaderboard={() => navigate(`${PATH_MINIGAMES}${game}`)}
        onExit={() => navigate(PATH_MINIGAMES)}
      />
    </div>
  );
}
