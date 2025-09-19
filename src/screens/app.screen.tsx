import React, { useContext } from 'react';
import { GooglePlayButton } from 'react-mobile-app-button';

import { NavbarContext } from '../contexts/navbar.context';

const AppScreen: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  const APKUrl =
    'https://docs.google.com/uc?export=download&id=1ZcsR75KkD1Lx4DLnS7wFl3hRhBXigirs';
  // const iOSUrl = '#';

  return (
    <section
      className='section-container w-full flex flex-col gap-8 mb-12'
      style={{ marginTop: navbarHeight }}
    >
      <h1 className='section-title text-center self-center'>App</h1>
      <p className='section-subtitle text-center self-center max-w-[80ch]'>
        Esplora CyberCity attraverso CyberTales, un'app interattiva progettata
        per insegnarti gli elementi essenziali della sicurezza informatica in
        modo divertente e coinvolgente. Affronta le sfide, impara a individuare
        i pericoli digitali e salvaguarda la tua presenza online, il tutto
        divertendoti!
      </p>
      <h3 className='text-center'>Potrai scaricare l'app da:</h3>
      <div className='flex flex-col md:flex-row gap-4 justify-center items-center'>
        <GooglePlayButton
          url={APKUrl}
          theme={'dark'}
          height={70}
          className='bg-secondary border-secondary-light'
        />
        {/* <AppStoreButton
          url={iOSUrl}
          theme={'dark'}
          height={70}
          className='bg-secondary border-secondary-light'
        /> */}
      </div>
    </section>
  );
};

export default AppScreen;
