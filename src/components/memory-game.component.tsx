import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Difficulty } from 'types/games.type.ts';
import TimeBar from '@components/time-bar.component.tsx';
import { clamp } from '@utils/game.utils.ts';

type Props = {
  difficulty: Difficulty;
  onGameOver: (finalScore: number) => void;
};

type Card = {
  id: number;
  symbol: string;
  pairKey: number;
  flipped: boolean;
  matched: boolean;
};

type Conf = {
  rows: number;
  cols: number;
  durationSec: number;
  revealMs: number;
  mismatchMs: number;
  base: number;
  bonus: number;
  penalty: number;
};

const CONF: Record<Difficulty, Conf> = {
  junior: {
    rows: 4,
    cols: 4,
    durationSec: 65,
    revealMs: 850,
    mismatchMs: 600,
    base: 10,
    bonus: 3,
    penalty: 2,
  },
  standard: {
    rows: 5,
    cols: 4,
    durationSec: 75,
    revealMs: 750,
    mismatchMs: 550,
    base: 12,
    bonus: 4,
    penalty: 3,
  },
  pro: {
    rows: 6,
    cols: 6,
    durationSec: 85,
    revealMs: 700,
    mismatchMs: 500,
    base: 14,
    bonus: 5,
    penalty: 4,
  },
};

const SYMBOLS = [
  '🛡️',
  '🔐',
  '🧠',
  '💡',
  '📱',
  '🛰️',
  '🧪',
  '🧰',
  '🧬',
  '🪐',
  '🚀',
  '🪫',
  '🔌',
  '🧯',
  '📡',
  '💾',
  '🧲',
  '🔭',
  '🎯',
  '🔍',
  '🧱',
  '⚙️',
  '🔧',
  '🧵',
  '🧩',
  '🖱️',
  '⌨️',
  '🖥️',
  '📶',
  '🗂️',
];

type Quiz = { q: string; choices: string[]; correct: number };
const QUIZ_BANK: Quiz[] = [
  {
    q: 'Se ricevi un link sospetto via DM, cosa fai?',
    choices: ['Lo apro subito', 'Lo inoltro a tutti', 'Non clicco e segnalo'],
    correct: 2,
  },
  {
    q: 'Una password sicura è…',
    choices: ['123456', 'Frase lunga + simboli', 'Il tuo nome'],
    correct: 1,
  },
  {
    q: 'Cosa indica il lucchetto nel browser?',
    choices: ['Connessione sicura (HTTPS)', 'Sito lento', 'Niente'],
    correct: 0,
  },
  {
    q: 'Phishing è…',
    choices: ['Un gioco di pesca', 'Truffa per rubare dati', 'Un antivirus'],
    correct: 1,
  },
  {
    q: 'Autenticazione a 2 fattori serve a…',
    choices: ['Decorare', 'Aumentare sicurezza', 'Giocare'],
    correct: 1,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(totalPairs: number, autoPairs: number): Card[] {
  const symbols = SYMBOLS.slice(0, totalPairs);
  let id = 1;
  const pairs: Card[] = symbols.flatMap((sym, idx) => {
    const pairKey = idx + 1;
    return [
      { id: id++, symbol: sym, pairKey, flipped: false, matched: false },
      { id: id++, symbol: sym, pairKey, flipped: false, matched: false },
    ];
  });
  const deck = shuffle(pairs);
  if (autoPairs > 0) {
    const uniquePairKeys = Array.from(new Set(deck.map((c) => c.pairKey)));
    shuffle(uniquePairKeys);
    const seedKeys = new Set(
      uniquePairKeys.slice(0, Math.min(autoPairs, uniquePairKeys.length))
    );
    for (let i = 0; i < deck.length; i++) {
      if (seedKeys.has(deck[i].pairKey))
        deck[i] = { ...deck[i], flipped: true, matched: true };
    }
  }
  return deck;
}

export default function MemoryGame({ difficulty, onGameOver }: Props) {
  const conf = CONF[difficulty];
  const totalCards = conf.rows * conf.cols;
  const totalPairs = totalCards / 2;

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(conf.durationSec);
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<Card[]>(() => buildDeck(totalPairs, 0));
  const [matches, setMatches] = useState(0);
  const [busy, setBusy] = useState(false);
  const [firstIdx, setFirstIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'play' | 'quiz' | 'done'>('play');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [showCombo, setShowCombo] = useState(false);

  // HUD + area refs per fit
  const hudRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [hudH, setHudH] = useState(0);
  const [fit, setFit] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const recomputeFit = useCallback(() => {
    const area = areaRef.current;
    if (!area) return;
    const hud = hudRef.current;
    const padding = 16; // p-4
    const hh = hud?.clientHeight ?? 0;
    setHudH(hh);

    const availW = Math.max(0, area.clientWidth - padding * 2);
    const availH = Math.max(0, area.clientHeight - hh - padding * 2);

    const ratio = conf.cols / conf.rows; // width / height
    let w = availW;
    let h = w / ratio;
    if (h > availH) {
      h = availH;
      w = h * ratio;
    }

    setFit({ w, h });
  }, [conf.cols, conf.rows]);

  useEffect(() => {
    const ro = new ResizeObserver(recomputeFit);
    if (areaRef.current) ro.observe(areaRef.current);
    const id = setInterval(recomputeFit, 250); // fallback su HUD dinamico
    recomputeFit();
    return () => {
      ro.disconnect();
      clearInterval(id);
    };
  }, [recomputeFit]);

  // timer delta-based (pausa durante quiz)
  const paused = phase !== 'play';
  const finishedRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);
  useEffect(() => {
    if (finishedRef.current) return;
    if (paused) {
      lastTickRef.current = null;
      return;
    }
    const tick = () => {
      const now = performance.now();
      const prev = lastTickRef.current ?? now;
      lastTickRef.current = now;
      const delta = (now - prev) / 1000;
      setTimeLeft((prevLeft) => {
        const next = Math.max(0, prevLeft - delta);
        if (next <= 0.0001) {
          finishedRef.current = true;
          onGameOver(Math.round(score));
        }
        return next;
      });
    };
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [paused, onGameOver, score]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (matches === totalPairs && timeLeft > 0) {
      setPhase('quiz');
      setQuiz(QUIZ_BANK[(Math.random() * QUIZ_BANK.length) | 0]);
      setQuizChoice(null);
    }
  }, [matches, totalPairs, timeLeft, phase]);

  const onCardClick = (idx: number) => {
    if (phase !== 'play' || busy) return;
    setCards((prev) => {
      if (prev[idx].flipped || prev[idx].matched) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], flipped: true };
      return next;
    });

    if (firstIdx === null) {
      setFirstIdx(idx);
      return;
    }

    const a = cards[firstIdx];
    const b = cards[idx];

    if (a.pairKey === b.pairKey) {
      setBusy(true);
      setTimeout(() => {
        setCards((prev) => {
          const next = prev.slice();
          next[firstIdx] = { ...next[firstIdx], matched: true };
          next[idx] = { ...next[idx], matched: true };
          return next;
        });
        setMatches((m) => m + 1);
        setStreak((s) => {
          const ns = s + 1;
          if (ns >= 3 && ns % 3 === 0) {
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 1500);
          }
          return ns;
        });
        setScore((sc) => sc + conf.base + (streak + 1) * conf.bonus);
        setFirstIdx(null);
        setBusy(false);
      }, conf.revealMs);
    } else {
      setBusy(true);
      setTimeout(() => {
        setCards((prev) => {
          const next = prev.slice();
          next[firstIdx] = { ...next[firstIdx], flipped: false };
          next[idx] = { ...next[idx], flipped: false };
          return next;
        });
        setScore((sc) => Math.max(0, sc - conf.penalty));
        setStreak(0);
        setFirstIdx(null);
        setBusy(false);
      }, conf.mismatchMs);
    }
  };

  const submitQuiz = () => {
    if (!quiz || quizChoice === null) return;
    const correct = quizChoice === quiz.correct;
    const autoPairs = correct ? 1 : 0;
    if (correct) setScore((sc) => sc + 25);
    setRound((r) => r + 1);
    setCards(buildDeck(totalPairs, autoPairs));
    setMatches(autoPairs);
    setStreak(0);
    setQuiz(null);
    setQuizChoice(null);
    setPhase('play');
  };

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${conf.cols}, minmax(0, 1fr))`,
      gap: '0.75rem',
    }),
    [conf.cols]
  );

  const pct =
    conf.durationSec > 0 ? clamp(timeLeft / conf.durationSec, 0, 1) : 0;
  const timeWarning = pct < 0.2;

  return (
    <div className='relative w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden'>
      {/* HUD (misurato con ref per il fit) */}
      <div ref={hudRef} className='absolute inset-x-0 top-0 z-10 p-3 sm:p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20'>
            <div className='text-xs text-white/60 mb-0.5'>PUNTEGGIO</div>
            <div className='text-xl font-bold text-white'>
              ⭐ {Math.round(score)}
            </div>
          </div>
          <div className='bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20'>
            <div className='flex items-center gap-3'>
              <TimeBar
                value={pct}
                widthPx={180}
                heightPx={12}
                rounded
                className={timeWarning ? 'animate-pulse' : ''}
              />
            </div>
          </div>
        </div>

        <div className='mt-3 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20'>
          <div className='flex items-center justify-between mb-1 px-1'>
            <span className='text-xs text-white/60'>Round {round}</span>
            <span className='text-xs text-cyan-400 font-semibold'>
              {matches}/{totalPairs} coppie
            </span>
          </div>
          <div className='w-full h-1.5 bg-black/30 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500'
              style={{ width: `${(matches / totalPairs) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* AREA DI GIOCO: centrata e scalata su spazio utile */}
      <div
        ref={areaRef}
        className='absolute inset-0 grid place-items-center p-4'
        style={{ paddingTop: hudH }}
      >
        <div
          className='rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 p-3 sm:p-4 flex items-center justify-center'
          style={{ width: `${fit.w}px`, height: `${fit.h}px` }}
        >
          <div className='w-full h-full' style={gridStyle}>
            {cards.map((c, idx) => {
              const show = c.flipped || c.matched;
              const isFlipping = c.flipped && !c.matched;
              return (
                <button
                  key={c.id}
                  onClick={() => onCardClick(idx)}
                  disabled={phase !== 'play' || busy || c.flipped || c.matched}
                  className={`
                    relative rounded-xl transition-all duration-300
                    ${
                      !show
                        ? 'bg-gradient-to-br from-indigo-500/50 to-purple-500/50 hover:from-indigo-500/60 hover:to-purple-500/60 hover:scale-105'
                        : ''
                    }
                    ${
                      c.matched
                        ? 'bg-gradient-to-br from-green-500/40 to-emerald-500/40 scale-95'
                        : ''
                    }
                    ${
                      isFlipping
                        ? 'bg-gradient-to-br from-cyan-500/50 to-blue-500/50 animate-cardFlip'
                        : ''
                    }
                    border-2 ${
                      c.matched ? 'border-green-400/50' : 'border-white/20'
                    } shadow-lg backdrop-blur-sm
                  `}
                  style={{
                    aspectRatio: '1 / 1',
                    transform:
                      isFlipping && !c.matched ? 'scale(1.1)' : undefined,
                  }}
                >
                  <div
                    className={`absolute inset-0 grid place-items-center transition-all duration-300 ${
                      show ? 'opacity-0 rotate-y-180' : 'opacity-100'
                    }`}
                  >
                    <span className='text-2xl md:text-3xl opacity-60'>🎴</span>
                  </div>
                  <div
                    className={`absolute inset-0 grid place-items-center transition-all duration-300 ${
                      show ? 'opacity-100 rotate-y-0' : 'opacity-0 rotate-y-180'
                    }`}
                  >
                    <span
                      className={`text-xl md:text-2xl lg:text-3xl ${
                        c.matched
                          ? 'drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-pulse'
                          : ''
                      } ${isFlipping && !c.matched ? 'animate-bounce' : ''}`}
                    >
                      {c.symbol}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {(busy || phase === 'quiz') && <div className='absolute inset-0 z-20' />}

      {showCombo && streak >= 3 && (
        <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-bounce'>
          <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full shadow-2xl'>
            <p className='text-2xl font-bold'>🔥 COMBO x{streak}! 🔥</p>
          </div>
        </div>
      )}

      {phase === 'quiz' && quiz && (
        <div className='absolute inset-0 z-30 grid place-items-center'>
          <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' />
          <div className='relative w-full max-w-md mx-auto p-4'>
            <div className='bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-2xl'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-3xl'>🧠</span>
                <h3 className='text-2xl font-bold text-white'>Quiz Bonus!</h3>
              </div>
              <p className='text-lg text-white/90 mb-4'>{quiz.q}</p>
              <div className='space-y-3'>
                {quiz.choices.map((opt, i) => (
                  <label
                    key={i}
                    className={`block rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                      quizChoice === i
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400 scale-105'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <input
                        type='radio'
                        name='quiz'
                        className='w-4 h-4'
                        checked={quizChoice === i}
                        onChange={() => setQuizChoice(i)}
                      />
                      <span className='text-white/90'>{opt}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button
                disabled={quizChoice === null}
                onClick={submitQuiz}
                className='mt-6 w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transform transition-all hover:scale-105 disabled:hover:scale-100'
              >
                Conferma risposta
              </button>
              <p className='mt-3 text-center text-sm text-cyan-400'>
                💡 Rispondi correttamente per +25 punti e 1 coppia bonus!
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cardFlip { 0%{transform:scale(1) rotateY(0deg);} 50%{transform:scale(1.15) rotateY(90deg);} 100%{transform:scale(1.1) rotateY(0deg);} }
        .animate-cardFlip { animation: cardFlip 0.6s ease-in-out; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
      `}</style>
    </div>
  );
}
