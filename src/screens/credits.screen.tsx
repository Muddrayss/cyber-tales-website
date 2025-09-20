import React, { useContext, useMemo, useEffect, useState } from 'react';
import { NavbarContext } from '../contexts/navbar.context';
import CreditsListItem from '../components/credits-list-item.component';
import { CreditsData } from '../data/credits.data';

function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const Credits: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);
  const [query, setQuery] = useState('');

  // elenco progetti + slug per TOC
  const projects = useMemo(() => {
    return (CreditsData as any[]).map((c) => ({
      title: c?.project || 'Senza titolo',
      slug: slugify(c?.project || 'senza-titolo'),
    }));
  }, []);

  // filtro semplice su project/roles/names/license/url ecc.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CreditsData as any[];
    return (CreditsData as any[]).filter((c) => {
      try {
        return JSON.stringify(c).toLowerCase().includes(q);
      } catch {
        const hay = [
          c?.project,
          ...(c?.roles || []).flatMap((r: any) => [
            r?.role,
            ...(r?.name || []),
          ]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      }
    });
  }, [query]);

  // offset sticky per TOC
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-offset',
      `${navbarHeight + 16}px`
    );
  }, [navbarHeight]);

  return (
    <main
      className='main-container overflow-visible'
      style={{ marginTop: navbarHeight }}
    >
      {/* Header */}
      <section className='mx-auto max-w-7xl px-6 pb-8 pt-4 md:pb-10 md:pt-8'>
        <h1 className='main-title'>
          Scopri chi ha contribuito
          <br />
          al&nbsp;
          <span className='main-title-gradient'>Progetto</span>
        </h1>
        <p className='main-paragraph'>
          Persone, librerie e risorse che rendono possibile CyberTales.
          Attribuzioni chiare e complete, senza rompere il ritmo della lettura.
        </p>
      </section>

      {/* Layout con TOC a sinistra + contenuto a destra (coerente con Manuale/About) */}
      <section className='mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-[260px_1fr]'>
        {/* TOC desktop */}
        <aside className='sticky top-[calc(var(--nav-offset,0px))] hidden self-start md:block'>
          <nav
            aria-label='Indice crediti'
            className='rounded-2xl bg-white/5 p-3 ring-1 ring-white/10'
          >
            <p className='px-2 pb-2 text-xs text-white/70'>Progetti</p>
            <ul className='space-y-1 text-sm'>
              {projects.map((p) => (
                <li key={p.slug}>
                  <a
                    href={`#${p.slug}`}
                    className='block rounded-lg px-2 py-1 hover:bg-white/10'
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Contenuto */}
        <div className='flex flex-col gap-6'>
          {/* Ricerca */}
          <div className='rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
            <label htmlFor='q' className='sr-only'>
              Cerca nei crediti
            </label>
            <input
              id='q'
              type='search'
              placeholder='Cerca per progetto, ruolo, nome, licenza…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-full rounded-lg bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 placeholder:text-white/60 focus:outline-none focus:ring-white/30'
            />
          </div>

          {/* Lista crediti */}
          {filtered.length === 0 ? (
            <div className='rounded-2xl bg-white/5 p-8 text-center ring-1 ring-white/10'>
              <p className='text-sm text-white/80'>
                Nessun risultato.{' '}
                <button
                  onClick={() => setQuery('')}
                  className='underline underline-offset-2'
                >
                  Mostra tutti
                </button>
              </p>
            </div>
          ) : (
            filtered.map((credit: any, i: number) => {
              const id = slugify(credit?.project || `credit-${i}`);
              return (
                <section
                  key={id}
                  id={id}
                  style={{ scrollMarginTop: navbarHeight + 24 }}
                  className='scroll-mt-24'
                >
                  <CreditsListItem {...credit} />
                </section>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

export default Credits;
