// /components/PhaserCanvas.tsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

type Props = {
  scene: Phaser.Types.Scenes.SettingsConfig | Phaser.Scene;
  onGameOver: (score: number) => void;
};

export default function PhaserCanvas({ scene, onGameOver }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
	if (!ref.current) {
		return;
	}
	
    // listen to custom event
    const handler = (e: unknown) => onGameOver((e as CustomEvent).detail.score);
    window.addEventListener('ARCADE:GAME_OVER', handler);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 768,
      height: 432,
      parent: ref.current,
      backgroundColor: '#0b1020',
      physics: { default: 'arcade' },
      scene: [scene],
    });

    return () => {
      window.removeEventListener('ARCADE:GAME_OVER', handler);
      game.destroy(true);
    };
  }, [onGameOver, scene]);
  return <div ref={ref} className='w-full aspect-video' />;
}
