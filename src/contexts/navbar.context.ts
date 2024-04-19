import { createContext } from 'react';

interface NavbarContextType {
    navbarHeight: number;
    setNavbarHeight: React.Dispatch<React.SetStateAction<number>>;
}

export const NavbarContext = createContext<NavbarContextType>({
    navbarHeight: 0,
    setNavbarHeight: () => {},
});