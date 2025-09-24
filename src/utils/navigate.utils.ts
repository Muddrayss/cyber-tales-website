import { NavigateFunction } from 'react-router-dom';

export const PATH_HOME = '/';
export const PATH_ABOUT = `${PATH_HOME}about/`;
export const PATH_MINIGAMES = `${PATH_HOME}minigames/`;
export const PATH_MANUAL = `${PATH_HOME}manual/`;
export const PATH_MUSIC = `${PATH_HOME}music/`;
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

export const navigateToCredits = (navigator: NavigateFunction) => {
  navigator(PATH_CREDITS);
};

export const navigateToStaffScanner = (navigator: NavigateFunction) => {
  navigator(PATH_STAFF_SCANNER);
};

export const navigateToNotFound = (navigator: NavigateFunction) => {
  navigator(PATH_NOT_FOUND);
};

export const pathGame = (game: string, difficulty?: string) =>
  difficulty ? `${PATH_MINIGAMES}${encodeURIComponent(game)}/${encodeURIComponent(difficulty)}`
             : `${PATH_MINIGAMES}${encodeURIComponent(game)}`;

export const pathUserGate = (ret?: string) =>
  ret ? `${PATH_MINIGAMES}user?ret=${encodeURIComponent(ret)}`
      : `${PATH_MINIGAMES}user`;

export const pathSubmitScore = (opts: { game: string; difficulty: string; score: number }) =>
  `${PATH_MINIGAMES}submit-score?game=${encodeURIComponent(opts.game)}&difficulty=${encodeURIComponent(opts.difficulty)}&score=${encodeURIComponent(String(opts.score))}`;
