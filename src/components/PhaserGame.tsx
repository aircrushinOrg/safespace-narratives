import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/game/config/GameConfig';

interface PhaserGameProps {
  onBack: () => void;
  onScenarioSelect?: (scenarioId: string) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onBack, onScenarioSelect }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Update config with parent element and fullscreen dimensions
    const config = {
      ...gameConfig,
      parent: gameRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Set up callback when game scene is ready
    const setupCallback = () => {
      const gameScene = phaserGameRef.current?.scene.getScene('GameScene');
      if (gameScene && onScenarioSelect) {
        (gameScene as any).setScenarioCallback(onScenarioSelect);
      }
    };

    // Wait for scene to be created
    setTimeout(setupCallback, 3000);

    // Handle window resize
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onScenarioSelect]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <div 
        ref={gameRef} 
        className="w-full h-full"
        id="phaser-game"
      />
    </div>
  );
};