import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
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

    // Update config with parent element
    const config = {
      ...gameConfig,
      parent: gameRef.current
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
        <Card className="overflow-hidden p-0">
          <div 
            ref={gameRef} 
            className="w-full h-full"
            id="phaser-game"
            style={{ minHeight: '600px' }}
          />
        </Card>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Walk around the campus and interact with NPCs to start educational scenarios.
          </p>
        </div>
      </div>
    </div>
  );
};