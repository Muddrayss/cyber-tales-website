import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { NavbarContext } from '../contexts/navbar.context';

import Header from '../components/header.component';
import Footer from '../components/footer.component';

const Layout: React.FC = () => {
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <NavbarContext.Provider value={{ navbarHeight, setNavbarHeight }}>
      <div className='flex flex-col min-h-screen'>
        <Header />
        <Outlet />
        <div className='flex-1'></div>
        <Footer />
      </div>
    </NavbarContext.Provider>
  );
};

export default Layout;
