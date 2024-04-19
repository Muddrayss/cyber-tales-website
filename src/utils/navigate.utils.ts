import { NavigateFunction } from 'react-router-dom';

export const PATH_HOME = '/';
export const PATH_APP = `${PATH_HOME}app/`;
export const PATH_MUSIC = `${PATH_HOME}music/`;
export const PATH_TIKTOK = `${PATH_HOME}tiktok/`;
export const PATH_CREDITS = `${PATH_HOME}credits/`;
export const PATH_NOT_FOUND = `${PATH_HOME}not-found/`;

export const navigateToHome = (navigator: NavigateFunction) => {
  navigator(PATH_HOME);
};

export const navigateToApp = (navigator: NavigateFunction) => {
  navigator(PATH_APP);
};

export const navigateToMusic = (navigator: NavigateFunction) => {
  navigator(PATH_MUSIC);
};

export const navigateToTikTok = (navigator: NavigateFunction) => {
  navigator(PATH_TIKTOK);
};

export const navigateToCredits = (navigator: NavigateFunction) => {
  navigator(PATH_CREDITS);
};

export const navigateToNotFound = (navigator: NavigateFunction) => {
  navigator(PATH_NOT_FOUND);
};
