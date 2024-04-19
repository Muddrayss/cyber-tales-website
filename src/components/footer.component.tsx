import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-primary border-t-2 border-white pt-12 pb-6 mt-14 px-6 sm:px-24 md:px-4 text-on-primary'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div className='flex row-start-1 md:row-start-auto flex-col justify-start items-start gap-4 md:mx-auto'>
          <img
            src={`${
              import.meta.env.VITE_PUBLIC_URL
            }images/icons/cyber_tales_icon.png`}
            alt='higloo-icon'
            className='w-10'
          />
          <div className='max-w-[50ch] text-xl'>
            Unisciti alla nostra missione per dare potere ai cittadini digitali!
            Siamo un team di sviluppatori, esperti di sicurezza informatica e
            professionisti creativi dediti alla creazione di strumenti educativi
            che rendano l'apprendimento sulla sicurezza online coinvolgente e
            accessibile a tutti!
          </div>
          <div className='flex gap-3 text-primary transition-all'></div>
          <div className='hidden md:flex text-center items-end justify-start mt-4 text-gray-300'>
            <p>&copy; {currentYear} ElathonGames. All rights reserved.</p>
          </div>
        </div>
        <div className='flex flex-col justify-start items-start md:mx-auto'>
          <h1 className='text-2xl font-semibold py-4'>Contatti.</h1>
          <h3 className='text-base sm:text-lg md:text-xl text-gray-300'>
            info@cybertales.it
          </h3>
        </div>
      </div>
      <div className='flex md:hidden text-center items-start justify-center mt-12 text-gray-300'>
        <p>&copy; {currentYear} ElathonGames. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
