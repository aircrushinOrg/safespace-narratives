import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { PreloaderScene } from '@/game/scenes/PreloaderScene';
import { MainScene } from '@/game/scenes/MainScene';

interface PhaserGameProps {
  onBack: () => void;
  onScenarioSelect?: (scenarioId: string) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onBack, onScenarioSelect }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#2c5530',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [PreloaderScene, MainScene]
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Set up communication with React
    if (phaserGameRef.current.scene.getScene('MainScene')) {
      const mainScene = phaserGameRef.current.scene.getScene('MainScene') as MainScene;
      mainScene.setScenarioCallback(onScenarioSelect);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onScenarioSelect]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-xl font-bold">STI Education Campus</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Use WASD or arrow keys to move • Space/Enter to interact
          </div>
        </div>

        {/* Game Container */}
        <Card className="overflow-hidden">
          <div ref={gameRef} className="w-full h-full" />
        </Card>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Walk around and talk to NPCs to learn about different scenarios.
          </p>
        </div>
      </div>
    </div>
  );
};