import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty, CatchDifficultyConfig } from "types/games.type.ts";
import { clamp, randBetween } from "@utils/game.utils.ts";
import TimeBar from "@components/time-bar.component.tsx";

import basketImg from "@assets/games/catch/basket.png";
import goodItemImg from "@assets/games/catch/good.png";
import badItemImg from "@assets/games/catch/bad.png";

interface Props { difficulty: Difficulty; onGameOver: (finalScore: number) => void; }

const DIFF: Record<Difficulty, CatchDifficultyConfig> = {
  junior:   { spawnMsRange: [500, 850], fallSpeed: { min: 160, max: 220 }, goodRatio: 0.75, durationSec: 60, badPenalty: 20, baseScore: 10, comboBonus: 2, topBandRel: 0.26 },
  standard: { spawnMsRange: [420, 740], fallSpeed: { min: 200, max: 280 }, goodRatio: 0.60, durationSec: 60, badPenalty: 25, baseScore: 12, comboBonus: 3, topBandRel: 0.20 },
  pro:      { spawnMsRange: [340, 620], fallSpeed: { min: 240, max: 340 }, goodRatio: 0.50, durationSec: 60, badPenalty: 30, baseScore: 14, comboBonus: 4, topBandRel: 0.14 },
};

interface DropItem {
  id: number; kind: "good" | "bad"; x: number; y: number; speed: number; angle: number; av: number;
}
let nextItemId = 1;

// sizing
const BASKET_WIDTH_REL = 0.16; const BASKET_MIN = 84; const BASKET_MAX = 150; const BASKET_ASPECT = 1.0;
const ITEM_REL = 0.06; const ITEM_MIN = 26; const ITEM_MAX = 46;
const SPAWN_EDGE_MARGIN = 24;
const TOP_BAND_MIN_PX = 10; const TOP_BAND_MAX_PX = 56;
const ROT_SPEED_MIN = 60; const ROT_SPEED_MAX = 220;

// movement tuning
const BASKET_SPEED_REL = 1.4;
const BASKET_SPEED_MIN = 520; const BASKET_SPEED_MAX = 2400;
const FOLLOW_GAIN = 0.45;
const BOOST_THRESHOLD_REL = 0.9; const BOOST_MULT = 1.4;

const CatchGame: React.FC<Props> = ({ difficulty, onGameOver }) => {
  const cfg = DIFF[difficulty];

  // container & resize
  const areaRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0); const [h, setH] = useState(0);
  useEffect(() => {
    const update = () => { if (!areaRef.current) return;
      setW(areaRef.current.clientWidth); setH(areaRef.current.clientHeight); };
    update(); const ro = new ResizeObserver(update);
    if (areaRef.current) ro.observe(areaRef.current);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
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
    if (e) (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
    pointerActive.current = false; pointerX.current = null;
  };

  // state
  const [score, setScore] = useState(0); const scoreRef = useRef(0);
  const [combo, setCombo] = useState(0); const comboRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(cfg.durationSec); const timeRef = useRef(cfg.durationSec);
  const [drops, setDrops] = useState<DropItem[]>([]);

  const [basketX, setBasketX] = useState(0); const basketXRef = useRef(0);
  useEffect(() => { basketXRef.current = basketX; }, [basketX]);

  // sizes
  const basketW = useMemo(() => clamp(w * BASKET_WIDTH_REL, BASKET_MIN, BASKET_MAX), [w]);
  const basketH = useMemo(() => Math.round(basketW * BASKET_ASPECT), [basketW]);
  const itemSize = useMemo(() => clamp(w * ITEM_REL, ITEM_MIN, ITEM_MAX), [w]);

  useEffect(() => { if (w > 0) { setBasketX(w / 2); basketXRef.current = w / 2; } }, [w]);

  // collision rule: catch when item crosses band [basketTop, basketTop + bandDepth] and overlaps horizontally
  const isTopBandCatchInside = (it: DropItem, prevY: number, nextY: number) => {
    const basketLeft = basketXRef.current - basketW / 2;
    const basketRight = basketXRef.current + basketW / 2;
    const basketTop = h - basketH;

    const bandDepth = clamp(basketH * cfg.topBandRel, TOP_BAND_MIN_PX, TOP_BAND_MAX_PX);
    const bandTop = basketTop, bandBottom = basketTop + bandDepth;

    const prevBottom = prevY + itemSize, nextBottom = nextY + itemSize;
    const itemLeft = it.x, itemRight = it.x + itemSize;

    const overlapX = itemRight > basketLeft && itemLeft < basketRight;
    const intersectsBand = nextBottom >= bandTop && prevBottom <= bandBottom;
    return overlapX && intersectsBand;
  };

  // loop
  useEffect(() => {
    if (w === 0 || h === 0) return;

    let fallMin = cfg.fallSpeed.min, fallMax = cfg.fallSpeed.max;
    let raf = 0, last = performance.now();
    let spawnTimer = 0 as number | ReturnType<typeof setTimeout>;
    let speedTimer = 0 as number | ReturnType<typeof setInterval>;

    // reset
    scoreRef.current = 0; setScore(0);
    comboRef.current = 0; setCombo(0);
    timeRef.current = cfg.durationSec; setTimeLeft(cfg.durationSec);
    setDrops([]);

    const spawnOne = () => {
      const isGood = Math.random() < cfg.goodRatio;
      const kind: "good" | "bad" = isGood ? "good" : "bad";
      const xPos = randBetween(SPAWN_EDGE_MARGIN, Math.max(SPAWN_EDGE_MARGIN, w - SPAWN_EDGE_MARGIN - Math.round(itemSize)));
      const speed = randBetween(Math.round(fallMin), Math.round(fallMax));
      const sign = Math.random() < 0.5 ? -1 : 1;
      const av = sign * randBetween(ROT_SPEED_MIN, ROT_SPEED_MAX);
      const angle = randBetween(0, 359);
      setDrops(d => [...d, { id: nextItemId++, kind, x: xPos, y: -itemSize, speed, angle, av }]);
    };

    const scheduleSpawn = () => {
      const [minMs, maxMs] = cfg.spawnMsRange;
      const delay = randBetween(minMs, maxMs);
      spawnTimer = setTimeout(() => { spawnOne(); scheduleSpawn(); }, delay);
    };
    const startSpeedRamp = () => { speedTimer = setInterval(() => { fallMin *= 1.05; fallMax *= 1.05; }, 10_000); };
    const endGame = () => { clearTimeout(spawnTimer); clearInterval(speedTimer); cancelAnimationFrame(raf); onGameOver(scoreRef.current); };

    scheduleSpawn(); startSpeedRamp();

    const loop = () => {
      const now = performance.now(); const dt = (now - last) / 1000; last = now;

      // basket movement (responsive + boost)
      if (pointerActive.current && pointerX.current != null) {
        let speed = clamp(w * BASKET_SPEED_REL, BASKET_SPEED_MIN, BASKET_SPEED_MAX);
        const dx = pointerX.current - basketXRef.current;
        if (Math.abs(dx) > BOOST_THRESHOLD_REL * basketW) speed *= BOOST_MULT;
        const maxStep = speed * dt;
        const step = clamp(dx * FOLLOW_GAIN, -maxStep, maxStep);
        const nx = clamp(basketXRef.current + step, basketW / 2, w - basketW / 2);
        if (nx !== basketXRef.current) { basketXRef.current = nx; setBasketX(nx); }
      }

      // items
      setDrops(prev => {
        const next: DropItem[] = []; let resetCombo = false;
        for (const it of prev) {
          const prevY = it.y; const ny = it.y + it.speed * dt;
          const nAngle = (it.angle + it.av * dt) % 360;

          if (isTopBandCatchInside(it, prevY, ny)) {
            if (it.kind === "good") {
              comboRef.current += 1; setCombo(comboRef.current);
              const mult = 1 + Math.floor(comboRef.current / 3);
              scoreRef.current += cfg.baseScore * mult + cfg.comboBonus; setScore(scoreRef.current);
            } else {
              comboRef.current = 0; setCombo(0);
              scoreRef.current = Math.max(0, scoreRef.current - cfg.badPenalty); setScore(scoreRef.current);
            }
            continue;
          }

          if (ny > h) { if (it.kind === "good") resetCombo = true; continue; }

          next.push({ ...it, y: ny, angle: nAngle });
        }
        if (resetCombo) { comboRef.current = 0; setCombo(0); }
        return next;
      });

      timeRef.current = Math.max(0, timeRef.current - dt); setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) { endGame(); return; }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => { clearTimeout(spawnTimer); clearInterval(speedTimer); cancelAnimationFrame(raf); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, difficulty, itemSize, basketW, basketH]);

  return (
    <div
      ref={areaRef}
      className="absolute inset-0 select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      style={{ cursor: pointerActive.current ? "grabbing" : "grab" } as React.CSSProperties}
    >
      {/* HUD */}
      <div className="absolute left-[14px] top-[14px] z-10 text-white text-sm">
        <div>Punti: <b>{score}</b></div>
        <div className="text-indigo-200">Combo ×{Math.max(1, 1 + Math.floor(combo / 3))}</div>
      </div>

      <div className="absolute right-[14px] top-[18px] z-10">
        <TimeBar value={timeLeft / cfg.durationSec} widthPx={Math.max(160, Math.min(320, Math.round(w * 0.3)))} heightPx={14} rounded />
      </div>

      {/* Basket */}
      <img
        src={basketImg} alt="Cestino" draggable={false} onDragStart={(e) => e.preventDefault()}
        style={{ position:'absolute', width:`${basketW}px`, height:`${basketH}px`, left:`${basketX - basketW / 2}px`, bottom:`0px`, pointerEvents:'none', WebkitUserDrag:'none', imageRendering:'auto' } as React.CSSProperties}
      />

      {/* Items */}
      {drops.map((it) => (
        <img
          key={it.id} src={it.kind === "good" ? goodItemImg : badItemImg} alt={it.kind === "good" ? "Buono" : "Cattivo"}
          draggable={false} onDragStart={(e) => e.preventDefault()}
          style={{ position:'absolute', width:`${itemSize}px`, height:`${itemSize}px`, left:`${it.x}px`, top:`${it.y}px`, pointerEvents:'none', WebkitUserDrag:'none', transform:`rotate(${it.angle}deg)`, transformOrigin:'50% 50%', willChange:'transform, top' } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default CatchGame;
