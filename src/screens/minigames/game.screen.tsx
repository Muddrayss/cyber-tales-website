/* ./screens/minigames/game.screen.tsx
   GameScreen — monta una Scene Phaser in base all’URL:
   /minigames/:game/:difficulty
   - Supporta: game = catch | (altri in futuro)
   - Difficoltà: junior | standard | pro (fallback: junior)
   - Ascolta evento globale 'ARCADE:GAME_OVER' -> mostra overlay + imposta ?score=...
   - Pulsanti: Rigioca, Cambia difficoltà, Torna ai minigiochi
*/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATH_MINIGAMES } from '@utils/navigate.utils';
import Phaser from 'phaser';

/* ------------------------------ Tipi e util ------------------------------ */

type GameKey = 'catch' | 'memory' | 'word' | (string & {});
type Difficulty = 'junior' | 'standard' | 'pro';
const EVENT_GAME_OVER = 'ARCADE:GAME_OVER';

const isDifficulty = (v: unknown): v is Difficulty =>
  v === 'junior' || v === 'standard' || v === 'pro';

/* Label per header */
const GAME_LABEL: Record<string, string> = {
  catch: 'Catch & Clean',
  memory: 'Memory Express',
  word: 'Parola Segreta',
};

/* --------------------------- Loader Scene dinamica --------------------------- */
/** Carica la Scene giusta e la istanzia con { difficulty } */
async function loadScene(
  game: GameKey,
  difficulty: Difficulty
): Promise<Phaser.Scene> {
  if (game === 'catch') {
    const mod = await import('../../games/catch/index');
    const CatchScene = mod.default;
    return new CatchScene({ difficulty });
  }
  // Fallback per giochi non ancora implementati
  class ComingSoon extends Phaser.Scene {
    constructor() {
      super('ComingSoon');
    }
    create() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x0b1020);
      this.add
        .text(width / 2, height / 2, 'Coming soon...', {
          color: '#ffffff',
          fontSize: '28px',
        })
        .setOrigin(0.5);
      // Chiudiamo subito con score 0 per non bloccare il flusso
      this.time.delayedCall(800, () => {
        window.dispatchEvent(
          new CustomEvent(EVENT_GAME_OVER, { detail: { score: 0 } })
        );
      });
    }
  }
  return new ComingSoon();
}

/* ---------------------------- Mount Phaser helper --------------------------- */
/** Incapsula la creazione/distruzione del Phaser.Game dentro React */
function usePhaserMount(
  container: React.RefObject<HTMLDivElement>,
  sceneFactory: () => Promise<Phaser.Scene>,
  deps: unknown[]
) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!container.current) return;
      const scene = await sceneFactory();
      if (cancelled) return;

      // Configurazione base (Scene array con istanza)
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 768,
        height: 432,
        parent: container.current,
        backgroundColor: '#0b1020',
        physics: { default: 'arcade' },
        scene: [scene],
      }); // Phaser gestisce boot e start Scene. :contentReference[oaicite:1]{index=1}
    })();

    return () => {
      cancelled = true;
      // Distruzione pulita del Game (renderer + systems) prima dell’unmount. :contentReference[oaicite:2]{index=2}
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* --------------------------------- Component -------------------------------- */

export default function GameScreen() {
  const { game, difficulty } = useParams<{
    game: GameKey;
    difficulty: Difficulty;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Validazione route minima
  const safeGame = useMemo<GameKey | null>(() => (game ? game : null), [game]);
  const safeDifficulty = useMemo<Difficulty>(
    () => (isDifficulty(difficulty) ? difficulty : 'junior'),
    [difficulty]
  );

  // Stato partita
  const [status, setStatus] = useState<'playing' | 'over'>('playing');
  const [score, setScore] = useState<number>(0);
  const [mountKey, setMountKey] = useState<number>(0); // forza remount Phaser su "Rigioca"

  const containerRef = useRef<HTMLDivElement>(null);

  // Se game mancante -> torna all’elenco
  useEffect(() => {
    if (!safeGame) navigate(PATH_MINIGAMES, { replace: true });
  }, [safeGame, navigate]);

  // Monta Phaser e Scene (remount quando cambi mountKey, game o difficulty)
  usePhaserMount(
    containerRef,
    () => loadScene(safeGame as GameKey, safeDifficulty),
    [mountKey, safeGame, safeDifficulty]
  );

  // Ascolta evento globale di fine partita (dispatch dalla Scene)
  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-expect-error: CustomEvent
      const s: number = e?.detail?.score ?? 0;
      setScore(s);
      setStatus('over');
      // esponi lo score nell’URL per future integrazioni (ScoreForm)
      const current = new URLSearchParams(searchParams);
      current.set('score', String(s));
      setSearchParams(current); // trigger navigazione con query aggiornata. :contentReference[oaicite:3]{index=3}
    };
    window.addEventListener(EVENT_GAME_OVER, handler as EventListener);
    return () =>
      window.removeEventListener(EVENT_GAME_OVER, handler as EventListener);
  }, [searchParams, setSearchParams]);

  const onReplay = useCallback(() => {
    setStatus('playing');
    setScore(0);
    const current = new URLSearchParams(searchParams);
    current.delete('score');
    setSearchParams(current);
    // Forza distruzione + remount del Game
    setMountKey((k) => k + 1);
  }, [searchParams, setSearchParams]);

  const goDiff = useCallback(() => {
    if (!safeGame) return;
    navigate(`${PATH_MINIGAMES}${encodeURIComponent(safeGame)}`);
  }, [navigate, safeGame]);

  const goIndex = useCallback(() => {
    navigate(PATH_MINIGAMES);
  }, [navigate]);

  if (!safeGame) return null;

  const title = GAME_LABEL[safeGame] ?? safeGame;

  return (
    <div className='mx-auto max-w-5xl px-4 py-6'>
      {/* Header */}
      <header className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase opacity-70'>Minigioco</p>
          <h1 className='text-xl md:text-2xl font-bold tracking-tight'>
            {title}
          </h1>
          <p className='text-xs opacity-70'>
            Difficoltà: <strong>{safeDifficulty}</strong>
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={goDiff}
            className='rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition'
          >
            Cambia difficoltà
          </button>
          <button
            onClick={goIndex}
            className='rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition'
          >
            Minigiochi
          </button>
        </div>
      </header>

      {/* Stage container */}
      <div
        key={mountKey}
        ref={containerRef}
        className='relative w-full aspect-video overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10'
        aria-label='Area di gioco'
      >
        {/* Overlay fine partita */}
        {status === 'over' && (
          <div className='absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm'>
            <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6'>
              <h2 className='text-xl font-semibold'>Fine partita!</h2>
              <p className='mt-2 text-sm opacity-80'>
                Punteggio: <span className='font-bold'>{score}</span>
              </p>

              {/* Nota: in uno step successivo qui monteremo <ScoreForm/>.
                 Intanto impostiamo lo score nell’URL (?score=...) per compatibilità. */}

              <div className='mt-6 flex flex-wrap gap-2'>
                <button
                  onClick={onReplay}
                  className='rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition'
                >
                  Rigioca
                </button>
                <button
                  onClick={goDiff}
                  className='rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5 transition'
                >
                  Cambia difficoltà
                </button>
                <button
                  onClick={goIndex}
                  className='rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5 transition'
                >
                  Torna ai minigiochi
                </button>
              </div>

              <p className='mt-4 text-xs opacity-70'>
                Suggerimento: il punteggio è stato aggiunto all’URL (
                <code>?score=…</code>) per il salvataggio nella fase successiva.
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className='mt-4 text-xs opacity-60'>
        Comandi: <kbd>←</kbd>/<kbd>→</kbd> oppure trascina col mouse/touch.
        Durata ~60s.
      </footer>
    </div>
  );
}
