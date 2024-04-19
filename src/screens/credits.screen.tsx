import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

import CreditsListItem from '../components/credits-list-item.component';

import { CreditsData } from '../data/credits.data';

const Credits: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <section
      className='section-container w-full flex flex-col gap-8 mb-12'
      style={{ marginTop: navbarHeight }}
    >
      <h1 className='section-title text-center self-center'>Crediti</h1>
      <div className='flex flex-col gap-8 items-center justify-start w-full'>
        {CreditsData.map((credit, index) => (
          <CreditsListItem key={index} {...credit} />
        ))}
      </div>
    </section>
  );
};

export default Credits;
