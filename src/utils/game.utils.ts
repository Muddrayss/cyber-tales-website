import { PATH_MINIGAMES } from '@utils/navigate.utils';

import { GameKey, Difficulty } from 'types/games.type';

export const buildGamePath = (game: GameKey) => {
  return `${PATH_MINIGAMES}${encodeURIComponent(game)}`;
};

export function buildGameDifficultyPath(game: GameKey, diff: Difficulty) {
  return `${PATH_MINIGAMES}${encodeURIComponent(game)}/${encodeURIComponent(
    diff
  )}`;
}
