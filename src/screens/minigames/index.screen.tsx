/* ./src/screens/minigames/index.screen.tsx
   Minigiochi & App — pagina unificata
   - Sezione "Minigiochi" (grid da GAMES_METADATA) con stessa UI del tuo index attuale
   - Sezione "App" coerente con Home/About (cards, ring, CTA)
   - Local nav con ancore #minigiochi e #app
*/
import { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { pathGame } from '@utils/navigate.utils';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

// configs
import { GAMES_METADATA } from '@configs/games-metadata';

// types
import { GameKey } from 'types/games.type';

// URL APK (come nella vecchia App page)
const APK_URL =
  'https://docs.google.com/uc?export=download&id=1ZcsR75KkD1Lx4DLnS7wFl3hRhBXigirs';

export default function MinigamesAndAppScreen() {
  const navigate = useNavigate();
  const { navbarHeight } = useContext(NavbarContext);
  const [focusIdx, setFocusIdx] = useState(-1);

  const go = useCallback(
    (game: GameKey) => navigate(pathGame(game)),
    [navigate]
  );

  return (
    <main className='main-container' style={{ marginTop: navbarHeight }}>
      <section className='mx-auto max-w-7xl px-6 pb-10 pt-4 md:pb-16 md:pt-10'>
        <h1 className='main-title'>
          <span className='secondary-title-gradient'>Minigiochi</span>
          &nbsp;&amp;&nbsp;
          <span className='main-title-gradient'>App</span>
        </h1>
        <p className='main-paragraph'>
          Porta con te CyberTales: sfide rapide, storie interattive e schede di
          ripasso sempre a portata di mano. Pensata per bambini, famiglie e
          scuole, con contenuti chiari e feedback immediati.
        </p>
      </section>

      {/* ========== MINIGIOCHI ========== */}
      <section
        id='minigiochi'
        aria-labelledby='tit-minigiochi'
        className='mx-auto max-w-7xl px-6 pb-14'
      >
        <h2 id='tit-minigiochi' className='text-xl md:text-2xl font-bold'>
          Scegli un minigioco
        </h2>

        <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {GAMES_METADATA.map((g, idx) => (
            <button
              key={g.id}
              onClick={() => go(g.id)}
              onMouseEnter={() => setFocusIdx(idx)}
              onMouseLeave={() => setFocusIdx(-1)}
              className={[
                'group rounded-2xl p-5 text-left ring-2 transition',
                g.ring,
                g.bg,
                idx === focusIdx
                  ? 'ring-offset-2 ring-offset-white/10'
                  : 'ring-white/10',
                'hover:-translate-y-0.5 hover:ring-2',
              ].join(' ')}
              aria-label={`Apri ${g.title}`}
            >
              <div className='flex items-center justify-between'>
                <div className='text-3xl'>{g.icon}</div>
                <span className='text-xs opacity-70 uppercase tracking-wide'>
                  {g.id}
                </span>
              </div>
              <h3 className='mt-3 text-xl font-semibold'>{g.title}</h3>
              <p className='mt-1 text-sm opacity-80'>{g.subtitle}</p>
              <p className='mt-4 text-xs opacity-70'>{g.hint}</p>
              <div className='mt-6'>
                <span className='inline-block rounded-lg bg-white/10 px-3 py-1 text-xs'>
                  Scegli {g.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========== APP ========== */}
      <section className='mx-auto max-w-7xl px-6'>
        <h2 className='text-xl md:text-2xl font-bold'>La nostra App</h2>
        <div className='mt-3 grid gap-4 md:grid-cols-[2fr_1fr]'>
          {/* Descrizione */}
          <article className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'>
            <h3 className='text-base md:text-lg font-semibold'>
              Perché usarla
            </h3>
            <p className='mt-1 text-sm md:text-base text-white/80'>
              Porta con te CyberTales: sfide rapide, storie interattive e schede
              di ripasso sempre a portata di mano. Pensata per bambini, famiglie
              e scuole, con contenuti chiari e feedback immediati.
            </p>

            <div className='mt-4 grid gap-3 md:grid-cols-3'>
              <div className='rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
                <p className='text-sm font-semibold'>🎯 Micro-sessioni</p>
                <p className='mt-1 text-xs text-white/80'>
                  Obiettivi chiari e ritmo veloce.
                </p>
              </div>
              <div className='rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
                <p className='text-sm font-semibold'>🧩 Apprendimento attivo</p>
                <p className='mt-1 text-xs text-white/80'>
                  Dalla storia all’azione.
                </p>
              </div>
              <div className='rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
                <p className='text-sm font-semibold'>🔒 Privacy by design</p>
                <p className='mt-1 text-xs text-white/80'>
                  Solo il necessario per funzionare.
                </p>
              </div>
            </div>
          </article>

          {/* CTA store / download */}
          <aside className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'>
            <h3 className='text-base font-semibold'>Scarica</h3>
            <div className='mt-3 grid gap-2'>
              <a
                href={APK_URL}
                className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:brightness-110'
              >
                <FontAwesomeIcon icon={faDownload} className='mr-2 h-5 w-5' />
                <span className='mt-[0.4rem]'>Scarica APK (Android)</span>
              </a>
            </div>

            <div className='mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
              <p className='text-xs text-white/70'>Suggerimento</p>
              <p className='mt-1 text-xs text-white/80'>
                Dopo l’installazione, mettiti comodo e inizia subito la storia
                interattiva! Entrarai nel mondo di CyberTales e apprenderai
                giocando.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
