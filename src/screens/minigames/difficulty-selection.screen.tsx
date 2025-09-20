/* ./screens/minigames/difficulty-selection.screen
   Difficulty selection screen (React + TS)
   - URL atteso: /minigames/:game
   - Output: navigate a /minigames/:game/:difficulty
   - Input via mouse/touch o tastiera (1/2/3, frecce, Enter)
*/

import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATH_MINIGAMES } from '@utils/navigate.utils';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// types
import { GameKey, Difficulty } from 'types/games.type';

// utils
import { buildGameDifficultyPath } from '@utils/game.utils';
import { DIFFICULTIES_METADATA } from '@configs/difficulties-metadata';

/* Mappa nomi “umani” per UI */
const GAME_LABEL: Record<string, string> = {
  catch: 'Catch & Clean',
  memory: 'Memory Express',
  word: 'Parola Segreta',
};

export default function DifficultySelectionScreen() {
  const { game } = useParams<{ game: GameKey }>();
  const navigate = useNavigate();
  const { navbarHeight } = useContext(NavbarContext);
  const [focusIdx, setFocusIdx] = useState(-1);

  const safeGame = useMemo<GameKey | null>(() => {
    if (!game) return null;
    return game as GameKey;
  }, [game]);

  useEffect(() => {
    if (!safeGame) navigate(PATH_MINIGAMES, { replace: true });
  }, [safeGame, navigate]);

  const title = useMemo(
    () => (safeGame ? GAME_LABEL[safeGame] ?? safeGame : ''),
    [safeGame]
  );

  const go = useCallback(
    (diff: Difficulty) => {
      if (!safeGame) return;
      navigate(buildGameDifficultyPath(safeGame, diff));
    },
    [navigate, safeGame]
  );

  if (!safeGame) return null;

  return (
    <main className='main-container' style={{ marginTop: navbarHeight }}>
      <section className='mx-auto max-w-7xl px-6 pb-10 pt-4 md:pb-16 md:pt-10'>
        <button
          onClick={() => navigate(PATH_MINIGAMES)}
          className='rounded-xl border border-white/10 px-4 py-2 text-sm bg-white/0 hover:bg-white/5 transition'
          aria-label='Torna ai minigiochi'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          <span>Indietro</span>
        </button>
        <h1 className='main-title mt-5'>
          Sceglia la difficoltà per&nbsp;
          <span className='main-title-gradient'>{title}</span>
        </h1>
        <p className='main-paragraph'>
          La difficoltà potrà essere cambiata in qualsiasi momento tornando
          indietro.
        </p>
      </section>

      {/* ========== DIFFICOLTA' ========== */}
      <section
        id='minigiochi'
        aria-labelledby='tit-minigiochi'
        className='mx-auto max-w-7xl px-6 pb-14'
      >
        <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {DIFFICULTIES_METADATA.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => go(d.id)}
              onMouseEnter={() => setFocusIdx(idx)}
              onMouseLeave={() => setFocusIdx(-1)}
              className={[
                'group rounded-2xl p-5 text-left ring-2 transition',
                d.ring,
                d.bg,
                idx === focusIdx
                  ? 'outline-none ring-offset-2 ring-offset-white/10'
                  : 'ring-white/10',
                'hover:translate-y-[-2px] hover:ring-2',
              ].join(' ')}
              aria-label={`Difficoltà ${d.label}`}
            >
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>{d.label}</h2>
                <span className='text-xs opacity-70 uppercase tracking-wide'>
                  {d.id}
                </span>
              </div>
              <p className='mt-1 text-sm opacity-80'>{d.subtitle}</p>
              <p className='mt-4 text-xs opacity-70'>{d.hint}</p>
              <div className='mt-4 flex items-center gap-2 opacity-90'>
                {/* Indicatori difficoltà (pallini) */}
                <span className='h-2 w-2 rounded-full bg-white/90' />
                <span
                  className={`h-2 w-2 rounded-full ${
                    d.id !== 'junior' ? 'bg-white/90' : 'bg-white/20'
                  }`}
                />
                <span
                  className={`h-2 w-2 rounded-full ${
                    d.id === 'pro' ? 'bg-white/90' : 'bg-white/20'
                  }`}
                />
              </div>
              <div className='mt-6'>
                <span className='inline-block rounded-lg bg-white/10 px-3 py-1 text-xs'>
                  Avvia {d.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
