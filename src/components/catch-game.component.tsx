import { useEffect, useMemo, useRef, useState } from 'react';
import type { Difficulty, CatchDifficultyConfig } from 'types/games.type.ts';
import { clamp, randBetween } from '@utils/game.utils.ts';
import TimeBar from '@components/time-bar.component.tsx';

interface Props {
  difficulty: Difficulty;
  onGameOver: (finalScore: number) => void;
}

const DIFF: Record<Difficulty, CatchDifficultyConfig> = {
  junior: {
    spawnMsRange: [500, 850],
    fallSpeed: { min: 160, max: 220 },
    goodRatio: 0.75,
    durationSec: 60,
    badPenalty: 20,
    baseScore: 10,
    comboBonus: 2,
    topBandRel: 0.26,
  },
  standard: {
    spawnMsRange: [420, 740],
    fallSpeed: { min: 200, max: 280 },
    goodRatio: 0.6,
    durationSec: 60,
    badPenalty: 25,
    baseScore: 12,
    comboBonus: 3,
    topBandRel: 0.2,
  },
  pro: {
    spawnMsRange: [340, 620],
    fallSpeed: { min: 240, max: 340 },
    goodRatio: 0.5,
    durationSec: 60,
    badPenalty: 30,
    baseScore: 14,
    comboBonus: 4,
    topBandRel: 0.14,
  },
};

interface DropItem {
  id: number;
  kind: 'good' | 'bad';
  x: number;
  y: number;
  speed: number;
  angle: number;
  av: number;
  caught?: boolean;
}

interface Effect {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

let nextItemId = 1;

// sizing
const BASKET_WIDTH_REL = 0.16;
const BASKET_MIN = 84;
const BASKET_MAX = 150;
const BASKET_ASPECT = 0.8;
const ITEM_REL = 0.07;
const ITEM_MIN = 32;
const ITEM_MAX = 52;
const SPAWN_EDGE_MARGIN = 24;
const TOP_BAND_MIN_PX = 10;
const TOP_BAND_MAX_PX = 56;
const ROT_SPEED_MIN = 60;
const ROT_SPEED_MAX = 220;

// movement tuning
const BASKET_SPEED_REL = 1.4;
const BASKET_SPEED_MIN = 520;
const BASKET_SPEED_MAX = 2400;
const FOLLOW_GAIN = 0.45;
const BOOST_THRESHOLD_REL = 0.9;
const BOOST_MULT = 1.4;

// Visual items
const GOOD_ITEMS = ['🛡️', '🔐', '🔑', '💎', '⭐', '🏆', '💰', '🎯'];
const BAD_ITEMS = ['🦠', '💣', '☠️', '⚠️', '🚫', '❌', '🔥', '👾'];

const CatchGame: React.FC<Props> = ({ difficulty, onGameOver }) => {
  const cfg = DIFF[difficulty];

  // container & resize
  const areaRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const update = () => {
      if (!areaRef.current) return;
      setW(areaRef.current.clientWidth);
      setH(areaRef.current.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    if (areaRef.current) ro.observe(areaRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // pointer input
  const pointerActive = useRef(false);
  const pointerX = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    pointerActive.current = true;
    const rect = areaRef.current?.getBoundingClientRect();
    pointerX.current = rect ? e.clientX - rect.left : e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointerActive.current) return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (rect) pointerX.current = e.clientX - rect.left;
  };

  const endPointer = (e?: React.PointerEvent) => {
    if (e)
      (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
    pointerActive.current = false;
    pointerX.current = null;
  };

  // state
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.durationSec);
  const timeRef = useRef(cfg.durationSec);
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [basketX, setBasketX] = useState(0);
  const basketXRef = useRef(0);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [shakeBasket, setShakeBasket] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const basketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  // sizes
  const basketW = useMemo(
    () => clamp(w * BASKET_WIDTH_REL, BASKET_MIN, BASKET_MAX),
    [w]
  );
  const basketH = useMemo(() => Math.round(basketW * BASKET_ASPECT), [basketW]);
  const itemSize = useMemo(() => clamp(w * ITEM_REL, ITEM_MIN, ITEM_MAX), [w]);

  useEffect(() => {
    if (w > 0) {
      basketXRef.current = w / 2;
      if (basketRef.current) {
        basketRef.current.style.transform = `translate3d(${
          basketXRef.current - basketW / 2
        }px, 0, 0)`;
      } else {
        // fallback se vuoi mantenere lo state per il primo render
        setBasketX(w / 2);
      }
    }
  }, [w, basketW]);

  // collision rule
  const isTopBandCatchInside = (it: DropItem, prevY: number, nextY: number) => {
    const basketLeft = basketXRef.current - basketW / 2;
    const basketRight = basketXRef.current + basketW / 2;
    const basketTop = h - basketH;

    const bandDepth = clamp(
      basketH * cfg.topBandRel,
      TOP_BAND_MIN_PX,
      TOP_BAND_MAX_PX
    );
    const bandTop = basketTop;
    const bandBottom = basketTop + bandDepth;

    const prevBottom = prevY + itemSize;
    const nextBottom = nextY + itemSize;
    const itemLeft = it.x;
    const itemRight = it.x + itemSize;

    const overlapX = itemRight > basketLeft && itemLeft < basketRight;
    const intersectsBand = nextBottom >= bandTop && prevBottom <= bandBottom;
    return overlapX && intersectsBand;
  };

  // Add floating effect
  const addEffect = (x: number, y: number, text: string, color: string) => {
    const id = Date.now() + Math.random();
    setEffects((prev) => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1500);
  };

  // loop
  useEffect(() => {
    if (w === 0 || h === 0) return;

    let fallMin = cfg.fallSpeed.min;
    let fallMax = cfg.fallSpeed.max;
    let raf = 0;
    let last = performance.now();
    let spawnTimer: any = 0;
    let speedTimer: any = 0;

    // reset
    scoreRef.current = 0;
    setScore(0);
    comboRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    timeRef.current = cfg.durationSec;
    setTimeLeft(cfg.durationSec);
    setDrops([]);
    setEffects([]);
    setGameStarted(true);

    const spawnOne = () => {
      const isGood = Math.random() < cfg.goodRatio;
      const kind: 'good' | 'bad' = isGood ? 'good' : 'bad';
      const xPos = randBetween(
        SPAWN_EDGE_MARGIN,
        Math.max(
          SPAWN_EDGE_MARGIN,
          w - SPAWN_EDGE_MARGIN - Math.round(itemSize)
        )
      );
      const speed = randBetween(Math.round(fallMin), Math.round(fallMax));
      const sign = Math.random() < 0.5 ? -1 : 1;
      const av = sign * randBetween(ROT_SPEED_MIN, ROT_SPEED_MAX);
      const angle = randBetween(0, 359);
      setDrops((d) => [
        ...d,
        { id: nextItemId++, kind, x: xPos, y: -itemSize, speed, angle, av },
      ]);
    };

    const scheduleSpawn = () => {
      const [minMs, maxMs] = cfg.spawnMsRange;
      const delay = randBetween(minMs, maxMs);
      spawnTimer = setTimeout(() => {
        spawnOne();
        scheduleSpawn();
      }, delay);
    };

    const startSpeedRamp = () => {
      speedTimer = setInterval(() => {
        fallMin *= 1.05;
        fallMax *= 1.05;
      }, 10_000);
    };

    const endGame = () => {
      clearTimeout(spawnTimer);
      clearInterval(speedTimer);
      cancelAnimationFrame(raf);
      setGameStarted(false);
      onGameOver(scoreRef.current);
    };

    scheduleSpawn();
    startSpeedRamp();

    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;

      // basket movement (responsive + boost)
      if (pointerActive.current && pointerX.current != null) {
        let speed = clamp(
          w * BASKET_SPEED_REL,
          BASKET_SPEED_MIN,
          BASKET_SPEED_MAX
        );
        const dx = pointerX.current - basketXRef.current;
        if (Math.abs(dx) > BOOST_THRESHOLD_REL * basketW) speed *= BOOST_MULT;
        const maxStep = speed * dt;
        const step = clamp(dx * FOLLOW_GAIN, -maxStep, maxStep);
        const nx = clamp(
          basketXRef.current + step,
          basketW / 2,
          w - basketW / 2
        );
        if (nx !== basketXRef.current) {
          basketXRef.current = nx;
          if (basketRef.current) {
            basketRef.current.style.transform = `translate3d(${
              nx - basketW / 2
            }px, 0, 0)`;
          }
        }
      }

      // items physics
      setDrops((prev) => {
        const next: DropItem[] = [];
        let resetCombo = false;

        for (const it of prev) {
          if (it.caught) continue;

          const prevY = it.y;
          const ny = it.y + it.speed * dt;
          const nAngle = (it.angle + it.av * dt) % 360;

          if (isTopBandCatchInside(it, prevY, ny)) {
            if (it.kind === 'good') {
              comboRef.current += 1;
              setCombo(comboRef.current);

              if (comboRef.current > maxCombo) {
                setMaxCombo(comboRef.current);
              }

              if (comboRef.current >= 5 && comboRef.current % 5 === 0) {
                setShowCombo(true);
                setTimeout(() => setShowCombo(false), 1500);
              }

              const mult = 1 + Math.floor(comboRef.current / 3);
              const points = cfg.baseScore * mult + cfg.comboBonus;
              scoreRef.current += points;
              setScore(scoreRef.current);

              addEffect(
                basketXRef.current,
                h - basketH - 20,
                `+${points}`,
                '#10b981'
              );

              // Add caught animation
              next.push({ ...it, caught: true, y: ny, angle: nAngle });
              setTimeout(() => {
                setDrops((p) => p.filter((d) => d.id !== it.id));
              }, 300);
            } else {
              comboRef.current = 0;
              setCombo(0);
              scoreRef.current = Math.max(0, scoreRef.current - cfg.badPenalty);
              setScore(scoreRef.current);

              addEffect(
                basketXRef.current,
                h - basketH - 20,
                `-${cfg.badPenalty}`,
                '#ef4444'
              );
              setShakeBasket(true);
              setTimeout(() => setShakeBasket(false), 300);
            }
            continue;
          }

          if (ny > h) {
            if (it.kind === 'good') {
              resetCombo = true;
              addEffect(it.x + itemSize / 2, h - 50, 'Perso!', '#f59e0b');
            }
            continue;
          }

          next.push({ ...it, y: ny, angle: nAngle });
        }

        if (resetCombo) {
          comboRef.current = 0;
          setCombo(0);
        }
        return next;
      });

      timeRef.current = Math.max(0, timeRef.current - dt);
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        endGame();
        return;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      clearTimeout(spawnTimer);
      clearInterval(speedTimer);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, difficulty, itemSize, basketW, basketH]);

  const timePercentage =
    cfg.durationSec > 0
      ? Math.max(0, Math.min(1, timeLeft / cfg.durationSec))
      : 0;
  const timeWarning = timePercentage < 0.2;

  return (
    <div
      ref={areaRef}
      className='absolute inset-0 select-none touch-none bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      style={
        {
          cursor: pointerActive.current ? 'grabbing' : 'grab',
        } as React.CSSProperties
      }
    >
      {/* Animated background */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* HUD */}
      <div className='absolute top-0 left-0 right-0 p-2 sm:p-4 z-20 pointer-events-none'>
        <div className='flex items-start justify-start gap-2'>
          {/* Score & Stats - left side */}
          <div className='flex gap-1.5 sm:gap-3 flex-shrink-0'>
            <div className='bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-5 sm:py-3 border border-white/20 shadow-xl'>
              <div className='text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1 uppercase tracking-wide'>
                Score
              </div>
              <div className='text-base sm:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2'>
                <span className='text-yellow-400 text-sm sm:text-base'>⭐</span>
                {score}
              </div>
            </div>
          </div>

          {combo > 0 && (
            <div
              className={`bg-gradient-to-r ${
                combo >= 5
                  ? 'from-orange-500/30 to-red-500/30'
                  : 'from-cyan-500/20 to-blue-500/20'
              } backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-5 sm:py-3 border ${
                combo >= 5 ? 'border-orange-400/50' : 'border-cyan-400/30'
              } shadow-xl transition-all transform ${
                combo >= 5 ? 'sm:scale-105' : ''
              }`}
            >
              <div className='text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1 uppercase tracking-wide'>
                Combo
              </div>
              <div className='text-base sm:text-2xl font-bold text-white'>
                <span className='text-sm sm:text-base'>
                  {combo >= 5 ? '🔥' : '✨'}
                </span>
                <span className='ml-0.5'>×{1 + Math.floor(combo / 3)}</span>
              </div>
            </div>
          )}

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
                value={timePercentage}
                widthPx={w < 640 ? 80 : 120}
                heightPx={w < 640 ? 6 : 8}
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

      {/* Combo notification */}
      {showCombo && combo >= 5 && (
        <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-50 pointer-events-none w-[min(90%,400px)]'>
          <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce'>
            <p className='text-xs sm:text-lg md:text-2xl text-center font-bold'>
              🔥 SUPER COMBO x{1 + Math.floor(combo / 3)}! 🔥
            </p>
          </div>
        </div>
      )}

      {/* Basket */}
      <div
        ref={basketRef}
        className={`absolute ${shakeBasket ? 'animate-shake' : ''}`}
        style={{
          width: `${basketW}px`,
          height: `${basketH}px`,
          left: 0,
          bottom: `0px`,
          transform: `translate3d(${basketX - basketW / 2}px, 0, 0)`,
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      >
        <div className='relative w-full h-full'>
          {/* Basket glow effect */}
          <div className='absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent rounded-t-2xl blur-xl'></div>

          {/* Basket body */}
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-t-2xl border-4 border-white/30 shadow-2xl'>
            <div className='absolute inset-x-0 top-2 h-2 bg-white/20 rounded-full'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-3xl opacity-50'>🧺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      {drops.map((it) => {
        const itemEmoji =
          it.kind === 'good'
            ? GOOD_ITEMS[it.id % GOOD_ITEMS.length]
            : BAD_ITEMS[it.id % BAD_ITEMS.length];

        return (
          <div
            key={it.id}
            className={`absolute pointer-events-none transition-all ${
              it.caught ? 'scale-150 opacity-0' : ''
            }`}
            style={{
              width: `${itemSize}px`,
              height: `${itemSize}px`,
              left: `${it.x}px`,
              top: `${it.y}px`,
              transform: `rotate(${it.angle}deg) ${
                it.caught ? 'scale(1.5)' : 'scale(1)'
              }`,
              transition: it.caught ? 'all 0.3s ease-out' : 'none',
              willChange: 'transform, top',
            }}
          >
            {/* Item glow */}
            <div
              className={`absolute inset-0 rounded-full blur-xl ${
                it.kind === 'good' ? 'bg-green-400/30' : 'bg-red-400/30'
              }`}
            ></div>

            {/* Item body */}
            <div
              className={`absolute inset-0 rounded-full flex items-center justify-center text-2xl sm:text-3xl
              ${
                it.kind === 'good'
                  ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-2 border-green-400/50'
                  : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-400/50'
              } shadow-lg`}
            >
              <span
                className={`drop-shadow-lg ${
                  it.kind === 'good' ? 'animate-pulse' : ''
                }`}
              >
                {itemEmoji}
              </span>
            </div>
          </div>
        );
      })}

      {/* Floating score effects */}
      {effects.map((effect) => (
        <div
          key={effect.id}
          className='absolute pointer-events-none z-30'
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
            transform: 'translateX(-50%)',
            color: effect.color,
            animation: 'floatUp 1.5s ease-out forwards',
          }}
        >
          <div className='font-bold text-xl drop-shadow-lg'>{effect.text}</div>
        </div>
      ))}

      {/* Instructions overlay on first play */}
      {gameStarted && w > 0 && h > 0 && timeLeft === cfg.durationSec && (
        <div
          className='absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none'
          style={{ animation: 'fadeOut 3s ease-out forwards' }}
        >
          <div className='text-center text-white'>
            <p className='text-2xl font-bold mb-2'>
              Trascina per muovere il cestino!
            </p>
            <p className='text-lg opacity-80'>Cattura gli oggetti buoni ✨</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-60px);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

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
      `}</style>
    </div>
  );
};

export default CatchGame;
