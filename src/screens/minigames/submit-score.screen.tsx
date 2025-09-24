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
    <div style={{ marginTop: navbarHeight }}>
      <ScoreForm
        game={game}
        difficulty={difficulty}
        score={score}
        onReplay={() =>
          navigate(`${PATH_MINIGAMES}${game}/${difficulty}`, { replace: true })
        }
        onExit={() => navigate(PATH_MINIGAMES)}
      />
    </div>
  );
}
