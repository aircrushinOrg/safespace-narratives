import React from 'react';
import { PhaserGame } from './PhaserGame';

interface Game2DProps {
  onBack: () => void;
  onScenarioSelect?: (scenarioId: string) => void;
}

export const Game2D: React.FC<Game2DProps> = ({ onBack, onScenarioSelect }) => {
  return <PhaserGame onBack={onBack} onScenarioSelect={onScenarioSelect} />;
};
