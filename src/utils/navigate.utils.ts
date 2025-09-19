import { NavigateFunction } from 'react-router-dom';

export const PATH_HOME = '/';
export const PATH_APP = `${PATH_HOME}app/`;
export const PATH_MANUAL = `${PATH_HOME}manual/`;
export const PATH_MUSIC = `${PATH_HOME}music/`;
export const PATH_INSTAGRAM = `${PATH_HOME}instagram/`;
export const PATH_CREDITS = `${PATH_HOME}credits/`;
export const PATH_NOT_FOUND = `${PATH_HOME}not-found/`;

export const navigateToHome = (navigator: NavigateFunction) => {
  navigator(PATH_HOME);
};

export const navigateToApp = (navigator: NavigateFunction) => {
  navigator(PATH_APP);
};

export const navigateToManual = (navigator: NavigateFunction) => {
  navigator(PATH_MANUAL);
};

export const navigateToMusic = (navigator: NavigateFunction) => {
  navigator(PATH_MUSIC);
};

export const navigateToInstagram = (navigator: NavigateFunction) => {
  navigator(PATH_INSTAGRAM);
};

export const navigateToCredits = (navigator: NavigateFunction) => {
  navigator(PATH_CREDITS);
};

export const navigateToNotFound = (navigator: NavigateFunction) => {
  navigator(PATH_NOT_FOUND);
};
