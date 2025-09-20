import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { NavbarContext } from '../contexts/navbar.context';
import MusicListItem from '../components/music-list-item.component';
import { MusicData } from '../data/music.data';

type Track = (typeof MusicData)[number];

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube') && u.searchParams.get('v'))
      return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.replace('/', '');
    const m = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
}
function toEmbedUrl(url: string): string {
  const id = getYouTubeId(url);
  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    : url;
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-xs font-semibold ring-1 transition',
        active
          ? 'bg-white text-[#0b1020] ring-white'
          : 'bg-white/10 ring-white/15 hover:bg-white/20 text-white',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

const Music: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  const isFirstRender = useRef(true);
  const userSelected = useRef(false);

  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<string | null>(null);
  const [gen, setGen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Track | null>(MusicData[0] ?? null);
  const languages = useMemo(
    () =>
      Array.from(new Set(MusicData.map((m) => m.language)))
        .filter(Boolean)
        .sort(),
    []
  );
  const genres = useMemo(
    () =>
      Array.from(new Set(MusicData.map((m) => m.genre)))
        .filter(Boolean)
        .sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MusicData.filter((m) => {
      if (lang && m.language !== lang) return false;
      if (gen && m.genre !== gen) return false;
      if (!q) return true;
      const hay = [m.title, m.language, m.genre]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, lang, gen]);

  // se il brano selezionato esce dal filtro, selezionane uno valido
  useEffect(() => {
    if (
      !selected ||
      (!filtered.includes(selected) && filtered[0] !== selected)
    ) {
      setSelected(filtered[0] ?? null);
    }
  }, [filtered, selected]);

  // comodo per focus del player quando cambi brano
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    if (!userSelected.current) {
      return;
    }
    console.log('selected', selected);
    const el = document.getElementById('player');
    if (el) {
      const rect = el.getBoundingClientRect();
      const offset = navbarHeight + 16; 
      const offsetPosition = window.pageYOffset + rect.top - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    userSelected.current = false;
  }, [selected]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  return (
    <main className='main-container' style={{ marginTop: navbarHeight }}>
      {/* Header */}
      <section className='mx-auto max-w-7xl px-6 pb-8 pt-4 md:pb-10 md:pt-8'>
        <h1 className='main-title'>
          Ascolta la nostra
          <br />
          <span className='main-title-gradient'>Musica</span>
        </h1>
        <p className='main-paragraph'>
          Colonne sonore e tracce per entrare nel mood di CyberTales. Filtra per
          lingua/genre, cerca una traccia e riproducila nel player.
        </p>
      </section>

      {/* Player */}
      <section id='player' className='mt-3 mx-auto max-w-7xl px-6 w-full'>
        <div className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <h2 className='text-xl md:text-2xl font-bold'>
                {selected ? selected.title : 'Nessuna traccia selezionata'}
              </h2>
              {selected && (
                <div className='mt-1 flex flex-wrap gap-2 text-xs'>
                  <span className='rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15'>
                    {selected.language}
                  </span>
                  <span className='rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15'>
                    {selected.genre}
                  </span>
                </div>
              )}
            </div>
            {selected && (
              <a
                href={selected.youTubeLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-extrabold shadow-lg shadow-cyan-500/20 hover:brightness-110'
              >
                Apri su YouTube
              </a>
            )}
          </div>

          <div className='mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10'>
            {selected ? (
              <iframe
                className='w-full h-[11.5rem] sm:h-[20rem] md:h-[30rem] aspect-video'
                src={toEmbedUrl(selected.youTubeLink)}
                title={`Riproduttore YouTube: ${selected.title}`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
                loading='lazy'
              />
            ) : (
              <div className='aspect-video grid place-items-center text-sm text-white/70'>
                Seleziona una traccia dalla lista qui sotto
              </div>
            )}
          </div>

          <p className='mt-2 text-[11px] text-white/60'>
            Il player usa la modalità “Privacy-Enhanced” di YouTube per ridurre
            il tracciamento e il lazy-loading per migliorare le prestazioni.
          </p>
        </div>
      </section>

      {/* Filtri + ricerca */}
      <section className='mt-5 mx-auto max-w-7xl px-6 w-full'>
        <div className='rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='flex-1'>
              <label htmlFor='q' className='sr-only'>
                Cerca
              </label>
              <input
                id='q'
                type='search'
                placeholder='Cerca per titolo, lingua o genere…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='w-full rounded-lg bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 placeholder:text-white/60 focus:outline-none focus:ring-white/30'
              />
            </div>
            <div className='flex flex-wrap gap-2'>
              <Pill active={!lang} onClick={() => setLang(null)}>
                Tutte le lingue
              </Pill>
              {languages.map((l) => (
                <Pill key={l} active={lang === l} onClick={() => setLang(l)}>
                  {l}
                </Pill>
              ))}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Pill active={!gen} onClick={() => setGen(null)}>
                Tutti i generi
              </Pill>
              {genres.map((g) => (
                <Pill key={g} active={gen === g} onClick={() => setGen(g)}>
                  {g}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className='mt-5 mx-auto max-w-7xl px-6 w-full'>
        {filtered.length === 0 ? (
          <div className='rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10'>
            <p className='text-sm text-white/80'>
              Nessuna traccia trovata.{' '}
              <button
                onClick={() => setQuery('')}
                className='underline underline-offset-2'
              >
                Azzera ricerca
              </button>
            </p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map((m, i) => (
              <MusicListItem
                key={`${m.title}-${i}`}
                {...m}
                isActive={
                  selected?.title === m.title &&
                  selected?.youTubeLink === m.youTubeLink
                }
                onSelect={() => {
                  userSelected.current = true;
                  setSelected(m);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Music;
