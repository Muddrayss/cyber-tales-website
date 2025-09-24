import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TimeBar from '@components/time-bar.component.tsx';
import { clamp } from '@utils/game.utils.ts';
import type { Difficulty } from 'types/games.type.ts';

type Props = {
  difficulty: Difficulty;
  onGameOver: (finalScore: number) => void;
};

type Word = { answer: string; hint: string; category: string };

// Enhanced word bank with categories and better hints
const BANK: Record<Difficulty, Word[]> = {
  junior: [
    {
      answer: 'LOGIN',
      hint: 'Accedi al tuo account con questo',
      category: '🔐 Accesso',
    },
    {
      answer: 'HTTPS',
      hint: 'Il lucchetto verde nel browser',
      category: '🌐 Web',
    },
    {
      answer: 'EMAIL',
      hint: 'Posta elettronica',
      category: '📧 Comunicazione',
    },
    { answer: 'VIRUS', hint: 'Infetta il computer', category: '🦠 Malware' },
    { answer: 'CLOUD', hint: 'Salva i dati online', category: '☁️ Storage' },
    { answer: 'WIFI', hint: 'Internet senza fili', category: '📡 Connessione' },
    {
      answer: 'SPAM',
      hint: 'Email indesiderate',
      category: '📧 Comunicazione',
    },
    { answer: 'CODE', hint: 'Password o programmazione', category: '💻 Tech' },
  ],
  standard: [
    {
      answer: 'ENCRYPT',
      hint: 'Rendere i dati illeggibili',
      category: '🔒 Sicurezza',
    },
    {
      answer: 'PRIVACY',
      hint: 'Protezione dati personali',
      category: '🛡️ Protezione',
    },
    { answer: 'MALWARE', hint: 'Software dannoso', category: '🦠 Minacce' },
    {
      answer: 'FIREWALL',
      hint: 'Barriera di sicurezza di rete',
      category: '🛡️ Protezione',
    },
    {
      answer: 'BACKUP',
      hint: 'Copia di sicurezza dei dati',
      category: '💾 Storage',
    },
    { answer: 'PHISHING', hint: 'Truffa via email', category: '🎣 Truffe' },
    {
      answer: 'COOKIES',
      hint: 'Traccia la tua navigazione',
      category: '🌐 Web',
    },
    {
      answer: 'ROUTER',
      hint: 'Distribuisce internet a casa',
      category: '📡 Network',
    },
  ],
  pro: [
    {
      answer: 'RANSOMWARE',
      hint: 'Blocca i file per riscatto',
      category: '💰 Attacchi',
    },
    {
      answer: 'KEYLOGGER',
      hint: 'Registra tutto ciò che digiti',
      category: '⌨️ Spyware',
    },
    { answer: 'HONEYPOT', hint: 'Trappola per hacker', category: '🍯 Difesa' },
    {
      answer: 'TWOFACTOR',
      hint: 'Doppia verifica identità',
      category: '🔐 Auth',
    },
    {
      answer: 'SANDBOX',
      hint: 'Ambiente isolato per test',
      category: '📦 Sicurezza',
    },
    {
      answer: 'CRYPTOJACK',
      hint: 'Mina crypto sul tuo PC',
      category: '⛏️ Attacchi',
    },
    { answer: 'DARKWEB', hint: 'Internet nascosto', category: '🕸️ Web' },
    {
      answer: 'BLOCKCHAIN',
      hint: 'Tecnologia delle crypto',
      category: '⛓️ Tech',
    },
  ],
};

type Conf = {
  durationSec: number;
  baseScore: number;
  letterBonus: number;
  speedBonus: number; // bonus for quick answers
  streakMultiplier: number;
  wrongPenalty: number;
  hintPenalty: number; // penalty for using hints
  perfectBonus: number; // bonus for perfect word (no hints, no mistakes)
};

const CONF: Record<Difficulty, Conf> = {
  junior: {
    durationSec: 90,
    baseScore: 50,
    letterBonus: 5,
    speedBonus: 20,
    streakMultiplier: 1.5,
    wrongPenalty: 10,
    hintPenalty: 15,
    perfectBonus: 30,
  },
  standard: {
    durationSec: 85,
    baseScore: 75,
    letterBonus: 8,
    speedBonus: 30,
    streakMultiplier: 2.0,
    wrongPenalty: 15,
    hintPenalty: 20,
    perfectBonus: 50,
  },
  pro: {
    durationSec: 80,
    baseScore: 100,
    letterBonus: 10,
    speedBonus: 40,
    streakMultiplier: 2.5,
    wrongPenalty: 20,
    hintPenalty: 25,
    perfectBonus: 75,
  },
};

type Letter = {
  id: number;
  ch: string;
  used: boolean;
  correct?: boolean; // for feedback
  wrong?: boolean; // for feedback
  hintConsumed?: boolean;
};

type GamePhase = 'playing' | 'wordComplete' | 'gameOver';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(answer: string, difficulty: Difficulty): Letter[] {
  const answerChars = answer
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('');

  // Add some random letters to make it challenging
  const extraLetters =
    difficulty === 'junior' ? 2 : difficulty === 'standard' ? 3 : 4;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randoms: string[] = [];

  for (let i = 0; i < extraLetters; i++) {
    randoms.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }

  const allChars = [...answerChars, ...randoms];
  const shuffled = shuffle(allChars);

  return shuffled.map((ch, i) => ({
    id: i + 1,
    ch,
    used: false,
    correct: undefined,
    wrong: undefined,
  }));
}

function computeSlots(
  picked: number[],
  pool: Letter[],
  answer: string,
  revealed: number[]
): string[] {
  const slots = new Array(answer.length).fill('');
  const freePositions: number[] = [];

  for (let i = 0; i < answer.length; i++) {
    if (revealed.includes(i)) {
      slots[i] = answer[i]; // slot occupato dal suggerimento
    } else {
      freePositions.push(i); // slot libero da riempire in ordine
    }
  }

  let cursor = 0;
  for (const idx of picked) {
    if (cursor >= freePositions.length) break;
    slots[freePositions[cursor]] = pool[idx]?.ch ?? '';
    cursor++;
  }
  return slots;
}

export default function WordGame({ difficulty, onGameOver }: Props) {
  const conf = CONF[difficulty];
  const wordsSrc = BANK[difficulty];

  // Game state
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [timeLeft, setTimeLeft] = useState(conf.durationSec);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [_, setWordsCompleted] = useState(0);

  // Word state
  const usedAnswersRef = useRef<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [pool, setPool] = useState<Letter[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wordStartTime, setWordStartTime] = useState(Date.now());

  // Hint system
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  // Timer
  const lastTickRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (finishedRef.current || phase === 'gameOver') return;

    const tick = () => {
      const now = performance.now();
      const prev = lastTickRef.current ?? now;
      lastTickRef.current = now;
      const delta = (now - prev) / 1000;

      setTimeLeft((t) => {
        const next = Math.max(0, t - delta);
        if (next <= 0.0001) {
          finishedRef.current = true;
          handleGameOver();
        }
        return next;
      });
    };

    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [phase]);

  const handleGameOver = useCallback(() => {
    setPhase('gameOver');
    onGameOver(Math.round(scoreRef.current));
  }, [onGameOver]);

  const nextWord = useCallback(() => {
    if (usedAnswersRef.current.size >= wordsSrc.length) {
      usedAnswersRef.current.clear();
    }

    const remaining = wordsSrc.filter(
      (w) => !usedAnswersRef.current.has(w.answer)
    );
    const chosen = remaining[Math.floor(Math.random() * remaining.length)];

    usedAnswersRef.current.add(chosen.answer);
    setCurrentWord(chosen);
    setPool(buildPool(chosen.answer, difficulty));
    setPicked([]);
    setRevealedHints([]);
    setHintUsed(false);
    setMistakes(0);
    setWordStartTime(Date.now());
  }, [wordsSrc, difficulty]);

  useEffect(() => {
    nextWord();
  }, [nextWord]);

  const slots = useMemo(() => {
    if (!currentWord) return [];
    return computeSlots(picked, pool, currentWord.answer, revealedHints);
  }, [picked, pool, currentWord, revealedHints]);

  const currentText = useMemo(() => slots.join(''), [slots]);

  const isComplete = useMemo(() => {
    if (!currentWord) return false;
    return picked.length + revealedHints.length === currentWord.answer.length;
  }, [picked, revealedHints, currentWord]);

  const useHint = useCallback(() => {
    if (!currentWord || hintUsed) return;

    // Reveal a correct letter position
    const answer = currentWord.answer;
    const unrevealed = answer
      .split('')
      .map((_, i) => i)
      .filter((i) => !revealedHints.includes(i));

    if (unrevealed.length > 0) {
      const toReveal =
        unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedHints((prev) => [...prev, toReveal]);

      const char = currentWord.answer[toReveal];
      setPool((prev) => {
        const next = [...prev];
        const lockIdx = next.findIndex((l) => !l.used && l.ch === char);
        if (lockIdx !== -1) {
          next[lockIdx] = { ...next[lockIdx], used: true, hintConsumed: true };
        }
        return next;
      });

      setHintUsed(true);

      // Deduct points for using hint
      scoreRef.current = Math.max(0, scoreRef.current - conf.hintPenalty);
      setScore(scoreRef.current);
    }
  }, [currentWord, hintUsed, revealedHints, conf.hintPenalty]);

  const submit = useCallback(() => {
    if (!currentWord || !isComplete) return;

    const guess = currentText;
    const answer = currentWord.answer;

    if (guess === answer) {
      // Calculate time bonus
      const timeTaken = (Date.now() - wordStartTime) / 1000;
      const speedBonus =
        timeTaken < 5
          ? conf.speedBonus
          : timeTaken < 10
          ? conf.speedBonus / 2
          : 0;

      // Calculate score
      let points =
        conf.baseScore + answer.length * conf.letterBonus + speedBonus;

      // Apply streak multiplier
      if (streak > 0) {
        points = Math.round(points * (1 + streak * 0.1));
      }

      // Perfect bonus (no hints, no mistakes)
      if (!hintUsed && mistakes === 0) {
        points += conf.perfectBonus;
      }

      scoreRef.current += points;
      setScore(scoreRef.current);

      // Update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);

      // Update words completed
      setWordsCompleted((prev) => prev + 1);

      // Mark letters as correct for visual feedback
      setPool((prev) =>
        prev.map((l, i) =>
          picked.includes(i) ? { ...l, correct: true, wrong: false } : l
        )
      );

      // Move to next word after animation
      setTimeout(() => {
        nextWord();
      }, 1000);
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1);
      scoreRef.current = Math.max(0, scoreRef.current - conf.wrongPenalty);
      setScore(scoreRef.current);
      setStreak(0);

      // Shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Mark wrong letters
      setPool((prev) =>
        prev.map((l, i) =>
          picked.includes(i) ? { ...l, wrong: true, correct: false } : l
        )
      );

      // Clear after showing error
      setTimeout(() => {
        clearAll();
      }, 500);
    }
  }, [
    currentText,
    currentWord,
    isComplete,
    streak,
    hintUsed,
    mistakes,
    conf,
    nextWord,
    picked,
    wordStartTime,
  ]);

  const useLetter = useCallback(
    (idx: number) => {
      if (!pool[idx] || pool[idx].used) return;
      if (!currentWord) return;

      const capacity = currentWord.answer.length - revealedHints.length;
      if (picked.length >= capacity) return; // non buttare lettere “nel vuoto”

      setPool((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], used: true };
        return next;
      });
      setPicked((prev) => [...prev, idx]);
    },
    [pool, picked.length, currentWord, revealedHints]
  );

  const popLetter = useCallback(() => {
    setPicked((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];

      setPool((current) => {
        const next = [...current];
        if (next[last]) {
          next[last] = { ...next[last], used: false, wrong: false };
        }
        return next;
      });

      return prev.slice(0, -1);
    });
  }, []);

  const clearAll = useCallback(() => {
    setPicked([]);
    setPool((prev) =>
      prev.map((l) => ({
        ...l,
        used: l.hintConsumed ? true : false, // NON sbloccare quelle del suggerimento
        wrong: false,
        correct: false,
      }))
    );
  }, []);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;

      const key = e.key.toUpperCase();

      if (/^[A-Z]$/.test(key)) {
        const idx = pool.findIndex((l) => !l.used && l.ch === key);
        if (idx !== -1) useLetter(idx);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        popLetter();
      } else if (e.key === 'Enter') {
        if (isComplete) submit();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, pool, useLetter, popLetter, submit, clearAll, isComplete]);

  const pct =
    conf.durationSec > 0 ? clamp(timeLeft / conf.durationSec, 0, 1) : 0;
  const timeWarning = pct < 0.2;

  if (!currentWord) return null;

  return (
    <div className='relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
      {/* Animated background */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
        <div
          className='absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* HUD */}
      <div className='absolute inset-x-0 top-0 z-10 p-2 sm:p-4'>
        <div className='flex items-start justify-start gap-2'>
          {/* Score & Stats - left side */}
          <div className='flex gap-1.5 sm:gap-3 flex-shrink-0'>
            <div className='bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-5 sm:py-3 border border-white/20 shadow-xl'>
              <div className='text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1 uppercase tracking-wide'>
                Score
              </div>
              <div className='text-base sm:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2'>
                <span className='text-yellow-400 text-sm sm:text-base'>⭐</span>
                {Math.round(score)}
              </div>
            </div>

            {streak > 0 && (
              <div
                className={`bg-gradient-to-r ${
                  streak >= 5
                    ? 'from-orange-500/30 to-red-500/30'
                    : 'from-cyan-500/20 to-blue-500/20'
                } backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-5 sm:py-3 border ${
                  streak >= 5 ? 'border-orange-400/50' : 'border-cyan-400/30'
                } shadow-xl transition-all transform ${
                  streak >= 5 ? 'sm:scale-105' : ''
                }`}
              >
                <div className='text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1 uppercase tracking-wide'>
                  Combo
                </div>
                <div className='text-base sm:text-2xl font-bold text-white'>
                  <span className='text-sm sm:text-base'>
                    {streak >= 5 ? '🔥' : '✨'}
                  </span>
                  <span className='ml-0.5'>×{streak}</span>
                </div>
              </div>
            )}
          </div>

          <div className='flex-grow'></div>

          {/* Timer - right side */}
          <div className='bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 border border-white/20 shadow-xl flex-shrink-0'>
            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='hidden xs:block'>
                <div className='text-[10px] sm:text-xs text-white/60 uppercase tracking-wide'>
                  Tempo
                </div>
              </div>
              <TimeBar
                value={pct}
                widthPx={window.innerWidth < 640 ? 80 : 120}
                heightPx={window.innerWidth < 640 ? 6 : 8}
                rounded
                className={timeWarning ? 'animate-pulse' : ''}
              />
              <span
                className={`text-sm sm:text-lg font-bold ${
                  timeWarning ? 'text-red-400 animate-pulse' : 'text-white'
                }`}
              >
                {Math.ceil(timeLeft)}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div
        className='absolute inset-0 flex items-center justify-center p-4'
        style={{ paddingTop: '100px' }}
      >
        <div className='w-full max-w-3xl'>
          <div className='bg-black/30 backdrop-blur-md rounded-3xl border border-white/20 p-6 sm:p-8'>
            {/* Category & Hint */}
            <div className='text-center mb-6'>
              <div className='inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full px-4 py-2 mb-4'>
                <span className='text-sm text-white/80'>
                  {currentWord.category}
                </span>
              </div>
              <p className='text-lg sm:text-xl text-white/90'>
                {currentWord.hint}
              </p>
            </div>

            {/* Answer slots */}
            <div
              className={`mb-6 flex justify-center gap-2 ${
                shake ? 'animate-shake' : ''
              } ${showSuccess ? 'animate-pulse' : ''}`}
            >
              {currentWord.answer.split('').map((_, i) => {
                const isRevealed = revealedHints.includes(i);
                const ch = slots[i] || '';
                const filled = Boolean(ch);

                return (
                  <div
                    key={i}
                    className={`
								w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 
								grid place-items-center transition-all duration-300
								${
                  filled
                    ? showSuccess
                      ? 'border-green-400 bg-green-400/20 scale-110'
                      : 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/30 bg-white/5'
                } ${isRevealed ? 'border-yellow-400 bg-yellow-400/10' : ''}
								${isRevealed ? 'border-yellow-400 bg-yellow-400/10' : ''}
							`}
                  >
                    <span className='text-2xl font-bold text-white'>
                      {filled ? ch : <span className='text-white/30'>•</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Letter pool */}
            <div className='mb-6'>
              <div className='flex flex-wrap gap-2 justify-center'>
                {pool.map((letter, i) => (
                  <button
                    key={letter.id}
                    onClick={() => !letter.used && useLetter(i)}
                    disabled={letter.used}
                    className={`
							w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 
							font-bold text-lg transition-all duration-300
							${
                letter.used
                  ? letter.correct
                    ? 'border-green-400 bg-green-400/20 text-green-400 scale-95'
                    : letter.wrong
                    ? 'border-red-400 bg-red-400/20 text-red-400 animate-shake scale-95'
                    : letter.hintConsumed
                    ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300/70 scale-95'
                    : 'border-white/10 bg-white/5 text-white/30 scale-95'
                  : 'border-white/30 bg-white/10 text-white hover:border-cyan-400 hover:bg-cyan-400/20 hover:scale-110 active:scale-95'
              }
							`}
                  >
                    {letter.ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className='flex flex-wrap items-center justify-center gap-3'>
              <button
                onClick={popLetter}
                className='px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105'
              >
                ← Cancella
              </button>

              <button
                onClick={clearAll}
                className='px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105'
              >
                🔄 Reset
              </button>

              <button
                onClick={useHint}
                disabled={hintUsed}
                className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all hover:scale-105 ${
                  hintUsed
                    ? 'bg-gray-500/20 text-gray-400 border-gray-400/20 cursor-not-allowed'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/30'
                }`}
              >
                💡 Suggerimento {hintUsed && '(Usato)'}
              </button>

              <button
                onClick={submit}
                disabled={!isComplete}
                className={`px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 ${
                  isComplete
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/10 text-white/50 border border-white/20 cursor-not-allowed'
                }`}
              >
                Conferma ✓
              </button>
            </div>

            {/* Keyboard hint */}
            <div className='mt-4 text-center'>
              <p className='text-xs text-white/40'>
                💡 Usa la tastiera: lettere per scrivere, Backspace per
                cancellare, Enter per confermare
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success animation overlay */}
      {showSuccess && (
        <div className='fixed inset-0 pointer-events-none flex items-center justify-center z-50'>
          <div className='bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce'>
            <p className='text-2xl font-bold'>
              ✨ Corretto! +{conf.baseScore}pts
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
