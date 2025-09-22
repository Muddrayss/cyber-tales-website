import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATH_MINIGAMES } from '@utils/navigate.utils';
import { pathGame } from '@utils/navigate.utils';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGamepad,
  faTrophy,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

// types
import { GameKey, Difficulty } from 'types/games.type';

// utils
import { DIFFICULTIES_METADATA } from '@configs/difficulties-metadata';

/* Enhanced metadata with icons and colors */
const ENHANCED_DIFFICULTIES = {
  junior: {
    icon: '🌟',
    gradient: 'from-green-400 to-emerald-500',
    ringColor: 'ring-green-400/50',
    bgHover: 'hover:from-green-400/20 hover:to-emerald-500/20',
    description: 'Perfetto per iniziare',
    stats: { time: '+30s', speed: 'Lenta', bonus: '×1' },
  },
  standard: {
    icon: '⚡',
    gradient: 'from-blue-400 to-cyan-500',
    ringColor: 'ring-blue-400/50',
    bgHover: 'hover:from-blue-400/20 hover:to-cyan-500/20',
    description: 'Sfida equilibrata',
    stats: { time: 'Standard', speed: 'Media', bonus: '×1.5' },
  },
  pro: {
    icon: '🔥',
    gradient: 'from-orange-400 to-red-500',
    ringColor: 'ring-orange-400/50',
    bgHover: 'hover:from-orange-400/20 hover:to-red-500/20',
    description: 'Per veri campioni',
    stats: { time: '-15s', speed: 'Veloce', bonus: '×2' },
  },
};

const GAME_LABEL: Record<string, string> = {
  catch: 'Catch & Clean',
  memory: 'Memory Express',
  word: 'Parola Segreta',
};

const GAME_ICONS: Record<string, string> = {
  catch: '🧺',
  memory: '🧠',
  word: '🔤',
};

export default function DifficultySelectionScreen() {
  const { game } = useParams<{ game: GameKey }>();
  const navigate = useNavigate();
  const { navbarHeight } = useContext(NavbarContext);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const safeGame = useMemo<GameKey | null>(() => {
    if (!game) return null;
    return game as GameKey;
  }, [game]);

  useEffect(() => {
    if (!safeGame) navigate(PATH_MINIGAMES, { replace: true });
  }, [safeGame, navigate]);

  const handleDifficultySelect = useCallback(
    (diff: Difficulty) => {
      if (!safeGame || isTransitioning) return;

      setSelectedDiff(diff);
      setIsTransitioning(true);

      // Animate before navigating
      setTimeout(() => {
        navigate(pathGame(safeGame, diff));
      }, 300);
    },
    [navigate, safeGame, isTransitioning]
  );

  const title = useMemo(
    () => (safeGame ? GAME_LABEL[safeGame] ?? safeGame : ''),
    [safeGame]
  );

  const gameIcon = useMemo(
    () => (safeGame ? GAME_ICONS[safeGame] ?? '🎮' : '🎮'),
    [safeGame]
  );

  if (!safeGame) return null;

  return (
    <main
      className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden'
      style={{ paddingTop: navbarHeight }}
    >
      {/* Animated background */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
        <div
          className='absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse'
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <section className='relative mx-auto max-w-7xl px-6 pb-10 pt-4 md:pb-16 md:pt-10'>
        {/* Back button */}
        <button
          onClick={() => navigate(PATH_MINIGAMES)}
          className='group rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 text-sm border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 text-white/60'
          aria-label='Torna ai minigiochi'
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className='mr-2 group-hover:-translate-x-1 transition-transform'
          />
          <span>Indietro</span>
        </button>

        {/* Game title with icon */}
        <div className='mt-8 text-center'>
          <div className='inline-block mb-4 text-6xl animate-bounce'>
            {gameIcon}
          </div>
          <h1 className='text-5xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
              {title}
            </span>
          </h1>
          <p className='text-xl text-white/70'>
            Seleziona il tuo livello di sfida
          </p>
        </div>

        {/* Stats preview */}
        <div className='mt-8 flex justify-center gap-4'>
          <div className='bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20'>
            <FontAwesomeIcon icon={faClock} className='mr-2 text-cyan-400' />
            <span className='text-sm text-white/80'>60-85 secondi</span>
          </div>
          <div className='bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20'>
            <FontAwesomeIcon icon={faTrophy} className='mr-2 text-yellow-400' />
            <span className='text-sm text-white/80'>Bonus crescenti</span>
          </div>
          <div className='bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20'>
            <FontAwesomeIcon
              icon={faGamepad}
              className='mr-2 text-purple-400'
            />
            <span className='text-sm text-white/80'>3 modalità</span>
          </div>
        </div>
      </section>

      {/* Difficulty cards */}
      <section className='relative mx-auto max-w-7xl px-6 pb-14'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {DIFFICULTIES_METADATA.map((d, idx) => {
            const enhanced =
              ENHANCED_DIFFICULTIES[d.id as keyof typeof ENHANCED_DIFFICULTIES];
            const isSelected = selectedDiff === d.id;
            const isFocused = focusIdx === idx;

            return (
              <button
                key={d.id}
                onClick={() => handleDifficultySelect(d.id)}
                onMouseEnter={() => setFocusIdx(idx)}
                onMouseLeave={() => setFocusIdx(-1)}
                className={`
                  group relative rounded-2xl p-6 text-left transition-all duration-300
                  ${isSelected ? 'scale-105 opacity-50' : 'hover:scale-105'}
                  ${
                    isFocused
                      ? 'ring-2 ring-white/50 ring-offset-4 ring-offset-transparent'
                      : ''
                  }
                  bg-gradient-to-br ${d.bg} backdrop-blur-md
                  border-2 ${enhanced.ringColor} hover:border-white/40
                  transform hover:-translate-y-1 hover:shadow-2xl
                `}
                aria-label={`Difficoltà ${d.label}`}
                disabled={isTransitioning}
              >
                {/* Background glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${enhanced.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className='relative z-10'>
                  {/* Header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <span className='text-4xl'>{enhanced.icon}</span>
                      <div>
                        <h2 className='text-2xl font-bold text-white'>
                          {d.label}
                        </h2>
                        <p className='text-xs text-white/60 uppercase tracking-wide'>
                          {d.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className='text-sm text-white/80 mb-2'>
                    {enhanced.description}
                  </p>
                  <p className='text-xs text-white/60 mb-4'>{d.hint}</p>

                  {/* Stats grid */}
                  <div className='grid grid-cols-3 gap-2 mb-4'>
                    <div className='bg-black/20 rounded-lg p-2 text-center'>
                      <p className='text-xs text-white/60'>Tempo</p>
                      <p className='text-sm font-semibold text-white'>
                        {enhanced.stats.time}
                      </p>
                    </div>
                    <div className='bg-black/20 rounded-lg p-2 text-center'>
                      <p className='text-xs text-white/60'>Velocità</p>
                      <p className='text-sm font-semibold text-white'>
                        {enhanced.stats.speed}
                      </p>
                    </div>
                    <div className='bg-black/20 rounded-lg p-2 text-center'>
                      <p className='text-xs text-white/60'>Bonus</p>
                      <p className='text-sm font-semibold text-white'>
                        {enhanced.stats.bonus}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty indicator */}
                  <div className='flex items-center gap-2 mb-4'>
                    <span className='text-xs text-white/60'>Difficoltà</span>
                    <div className='flex gap-1'>
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full transition-all ${
                            i < idx + 1
                              ? `bg-gradient-to-r ${enhanced.gradient}`
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className={`
                    inline-flex items-center gap-2 rounded-lg px-4 py-2 
                    bg-gradient-to-r ${enhanced.gradient} 
                    text-white font-semibold text-sm
                    group-hover:shadow-lg transition-all
                  `}
                  >
                    <span>Gioca {d.label}</span>
                    <span className='group-hover:translate-x-1 transition-transform'>
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
