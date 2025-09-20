import { NavigateFunction } from 'react-router-dom';

export const PATH_HOME = '/';
export const PATH_ABOUT = `${PATH_HOME}about/`;
export const PATH_MINIGAMES = `${PATH_HOME}minigames/`;
export const PATH_MANUAL = `${PATH_HOME}manual/`;
export const PATH_MUSIC = `${PATH_HOME}music/`;
// export const PATH_INSTAGRAM = `${PATH_HOME}instagram/`; --- DEPRECTATED ---
export const PATH_CREDITS = `${PATH_HOME}credits/`;
export const PATH_STAFF_SCANNER = `${PATH_HOME}staff-scanner/`;
export const PATH_NOT_FOUND = `${PATH_HOME}not-found/`;

export const navigateToHome = (navigator: NavigateFunction) => {
  navigator(PATH_HOME);
};

export const navigateToAbout = (navigator: NavigateFunction) => {
  navigator(PATH_ABOUT);
};

export const navigateToMinigames = (navigator: NavigateFunction) => {
  navigator(PATH_MINIGAMES);
};

export const navigateToManual = (navigator: NavigateFunction) => {
  navigator(PATH_MANUAL);
};

export const navigateToMusic = (navigator: NavigateFunction) => {
  navigator(PATH_MUSIC);
};

// DEPRECTATED:
// export const navigateToInstagram = (navigator: NavigateFunction) => {
//   navigator(PATH_INSTAGRAM);
// };

export const navigateToCredits = (navigator: NavigateFunction) => {
  navigator(PATH_CREDITS);
};

export const navigateToStaffScanner = (navigator: NavigateFunction) => {
  navigator(PATH_STAFF_SCANNER);
};

export const navigateToNotFound = (navigator: NavigateFunction) => {
  navigator(PATH_NOT_FOUND);
};
