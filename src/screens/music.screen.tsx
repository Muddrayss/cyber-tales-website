import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

import MusicListItem from '../components/music-list-item.component';

import { MusicData } from '../data/music.data';

const Music: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <section
      className='section-container w-full flex flex-col gap-8 mb-12'
      style={{ marginTop: navbarHeight }}
    >
      <h1 className='section-title text-center self-center'>Musica</h1>
      <div className='flex flex-col gap-8 items-center justify-start w-full'>
        {MusicData.map((music, index) => (
          <MusicListItem key={index} {...music} />
        ))}
      </div>
    </section>
  );
};

export default Music;
