import React from 'react';
import { MusicDataType } from '../types/music.type';

type Props = MusicDataType & {
  onSelect?: () => void;
  isActive?: boolean;
};

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // watch?v=ID
    if (u.hostname.includes('youtube') && u.searchParams.get('v'))
      return u.searchParams.get('v');
    // youtu.be/ID
    if (u.hostname === 'youtu.be') return u.pathname.replace('/', '');
    // /embed/ID
    const m = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
}

const MusicListItem: React.FC<Props> = (props) => {
  const { title, language, genre, youTubeLink, onSelect, isActive } = props;
  const vid = youTubeId(youTubeLink);
  const thumb = vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : '';

  return (
    <div
      className={[
        'rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 md:p-5 transition',
        isActive
          ? 'outline outline-2 outline-cyan-400/50'
          : 'hover:bg-white/10',
      ].join(' ')}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base md:text-lg font-semibold'>{title}</h3>
          <div className='mt-1 flex flex-wrap gap-2 text-xs'>
            <span className='rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15'>
              {language}
            </span>
            <span className='rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15'>
              {genre}
            </span>
          </div>
        </div>
        <button
          type='button'
          onClick={onSelect}
          aria-pressed={!!isActive}
          className='shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-3 py-1.5 text-xs font-extrabold shadow-lg shadow-cyan-500/20 hover:brightness-110'
        >
          {isActive ? 'In riproduzione' : 'Riproduci'}
        </button>
      </div>

      <div className='mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10'>
        {thumb ? (
          <img
            src={thumb}
            alt={`Anteprima di ${title}`}
            className='w-full aspect-video object-cover'
            loading='lazy'
          />
        ) : (
          <div className='aspect-video grid place-items-center text-xs text-white/60'>
            Anteprima non disponibile
          </div>
        )}
      </div>

      <div className='mt-3 text-right'>
        <a
          href={youTubeLink}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-semibold text-cyan-200 hover:underline'
        >
          Apri su YouTube →
        </a>
      </div>
    </div>
  );
};

// alias locale per evitare shadowing con helper
function youTubeId(url: string) {
  return getYouTubeId(url);
}

export default MusicListItem;
