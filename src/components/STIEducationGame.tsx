import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameScenario, scenarios } from './GameScenario';
import { Game2D } from './Game2D';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Shield, Users, Target, Gamepad2 } from 'lucide-react';

type GameState = 'menu' | 'game2d' | 'scenario';

interface ConversationData {
  scenarioId: string;
  npcName: string;
  npcSprite: string;
  setting: string;
}

export const STIEducationGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('game2d');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleStart2DGame = () => {
    setGameState('game2d');
  };

  const handleScenarioSelect = (scenarioId: string) => {
    // Map scenario IDs to conversation data
    const scenarioMap: Record<string, ConversationData> = {
      'college-party': {
        scenarioId: 'college-party',
        npcName: 'Alex',
        npcSprite: 'alex',
        setting: 'College Party'
      },
      'travel-romance': {
        scenarioId: 'travel-romance', 
        npcName: 'Jamie',
        npcSprite: 'jamie',
        setting: 'Bangkok Night Market'
      },
      'relationship-milestone': {
        scenarioId: 'relationship-milestone',
        npcName: 'Taylor', 
        npcSprite: 'taylor',
        setting: 'Cozy Home'
      },
      'dating-app': {
        scenarioId: 'dating-app',
        npcName: 'Riley',
        npcSprite: 'riley',
        setting: 'Coffee Shop'
      }
    };

    const data = scenarioMap[scenarioId];
    if (data) {
      // Navigate to conversation page with scenario data as URL parameters
      const params = new URLSearchParams({
        scenarioId: data.scenarioId,
        npcName: data.npcName,
        npcSprite: data.npcSprite,
        setting: data.setting
      });
      navigate(`/conversation?${params.toString()}`);
    }
  };

  const handleBackToMenu = () => {
    setGameState('game2d');
    setSelectedScenario(null);
  };

  // Always show the Phaser game by default
  return <Game2D onBack={handleBackToMenu} onScenarioSelect={handleScenarioSelect} />;
};