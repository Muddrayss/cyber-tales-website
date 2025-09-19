import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

const Instagram: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <>
      <section
        className='section-container w-full flex flex-col gap-8 mb-12'
        style={{ marginTop: navbarHeight }}
      >
        <h1 className='section-title text-center self-center'>Instagram</h1>
        <p className='section-subtitle text-center self-center max-w-[80ch]'>
          Seguici su Instagram su @cybertales! Stiamo attingendo a il potere di
          post e di grande impatto per diffondere la consapevolezza sulle cyber
          minacce. Scopri suggerimenti rapidi e rimani aggiornato sulle ultime
          novità in ambito cyber sicurezza e scopri come proteggerti online,
          tutto in pochi secondi.
        </p>
        <a
          href='https://www.instagram.com/cybertales_ita/'
          target='_blank'
          rel='noreferrer'
          className='btn-primary self-center underline text-cyan-400'
        >
          Seguici su Instagram!
        </a>
      </section>
    </>
  );
};

export default Instagram;
