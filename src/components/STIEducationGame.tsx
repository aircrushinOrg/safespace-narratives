import React, { useState } from 'react';
import { GameScenario, scenarios } from './GameScenario';
import { Game2D } from './Game2D';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Shield, Users, Target, Gamepad2 } from 'lucide-react';

type GameState = 'menu' | 'game2d' | 'scenario';

export const STIEducationGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('game2d');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleStart2DGame = () => {
    setGameState('game2d');
  };

  const handleScenarioSelect = (scenarioId: string) => {
    // Scenarios are now handled entirely in Phaser
    console.log('Scenario selected:', scenarioId);
  };

  const handleBackToMenu = () => {
    setGameState('game2d');
    setSelectedScenario(null);
  };

  const handleBackToGame = () => {
    setGameState('game2d');
    setSelectedScenario(null);
  };

  // Always show the Phaser game since scenarios are handled there
  return <Game2D onBack={handleBackToMenu} onScenarioSelect={handleScenarioSelect} />;
};