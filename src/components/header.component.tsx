import React, { useContext, useEffect, useRef, useState } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

import {
  PATH_HOME,
  PATH_MANUAL,
  PATH_MUSIC,
  PATH_CREDITS,
  PATH_MINIGAMES,
  PATH_ABOUT,
} from '../utils/navigate.utils';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setNavbarHeight } = useContext(NavbarContext);
  const navBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentNavBarRef = navBarRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!isOpen) {
        for (const entry of entries) {
          setNavbarHeight(entry.contentRect.height);
        }
      }
    });

    if (navBarRef.current) {
      resizeObserver.observe(navBarRef.current);
    }

    return () => {
      if (currentNavBarRef) {
        resizeObserver.unobserve(currentNavBarRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const navigation = [
    { content: 'Home', path: PATH_HOME },
    { content: 'Chi siamo', path: PATH_ABOUT },
    { content: 'Minigiochi', path: PATH_MINIGAMES },
    { content: 'Manuale', path: PATH_MANUAL },
    { content: 'Musica', path: PATH_MUSIC },
    { content: 'Crediti', path: PATH_CREDITS },
  ];

  return (
    <>
      <nav
        className={`${
          isOpen
            ? 'bg-primary text-on-primary h-screen'
            : 'bg-primary text-on-primary'
        } fixed w-full top-0 start-0 border-b border-gray-200`}
        style={{ zIndex: 1000 }}
        ref={navBarRef}
      >
        <section className='section-container'>
          <div className='flex items-center justify-between py-3 md:py-5 md:block'>
            {/* <a href={PATH_HOME}>
              <img
                src='/images/icons/cyber_tales_icon.png'
                width={50}
                alt='higloo logo'
              />
            </a> */}
            <a
              href={PATH_HOME}
              className='select-none text-xl font-extrabold tracking-tight'
              aria-label='CyberTales Home'
            >
              <span className='main-title-gradient'>CyberTales</span>
            </a>
            <div className='md:hidden'>
              <button
                className='outline-none p-2 focus:border-gray-400 focus:border'
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 8h16M4 16h16'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div
            className={`flex-1 pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
              isOpen ? 'block' : 'hidden'
            }`}
          >
            <ul className='justify-end items-center space-y-8 md:flex md:space-x-6 md:space-y-0 text-3xl md:text-lg'>
              {navigation.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={isOpen ? '' : 'hover:text-highlight'}
                  >
                    <a href={item.path}>{item.content}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </nav>
    </>
  );
};

export default Header;
