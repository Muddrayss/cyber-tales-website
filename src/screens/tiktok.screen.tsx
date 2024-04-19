import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

const TikTok: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <>
      <section
        className='section-container w-full flex flex-col gap-8 mb-12'
        style={{ marginTop: navbarHeight }}
      >
        <h1 className='section-title text-center self-center'>TikTok</h1>
        <p className='section-subtitle text-center self-center max-w-[80ch]'>
          Seguici su TikTok su @cybertales! Stiamo attingendo a il potere di
          video brevi e di grande impatto per diffondere la consapevolezza sulle
          cyber minacce. Scopri suggerimenti rapidi e rimani aggiornato sulle
          ultime novità in ambito cyber sicurezza e scopri come proteggerti
          online, tutto in pochi secondi.
        </p>
        <h3>Coming Soon! A test video is following...</h3>
        <div className='flex justify-center'>
          <iframe
            title='cyber-tales-tiktok'
            src='https://www.tiktok.com/embed/v2/7309865778550000929'
            width='320'
            height='756'
            allow='autoplay; encrypted-media'
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </>
  );
};

export default TikTok;
