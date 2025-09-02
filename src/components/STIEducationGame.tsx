import React, { useState } from 'react';
import { GameScenario, scenarios } from './GameScenario';
import { Game2D } from './Game2D';
import { ChatInterface } from './ChatInterface';
import { AIConversationScene } from './AIConversationScene';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Shield, Users, Target, Gamepad2 } from 'lucide-react';

type GameState = 'menu' | 'game2d' | 'scenario' | 'ai-conversation';

interface ConversationData {
  scenarioId: string;
  npcName: string;
  npcSprite: string;
  setting: string;
}

export const STIEducationGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('game2d');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

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
      setConversationData(data);
      setGameState('ai-conversation');
    }
  };

  const handleBackToMenu = () => {
    setGameState('game2d');
    setSelectedScenario(null);
    setConversationData(null);
  };

  const handleBackToGame = () => {
    setGameState('game2d');
    setSelectedScenario(null);
    setConversationData(null);
  };

  // Render AI conversation scene
  if (gameState === 'ai-conversation' && conversationData) {
    return (
      <AIConversationScene 
        conversationData={conversationData}
        onBack={handleBackToGame}
      />
    );
  }

  // Always show the Phaser game by default
  return <Game2D onBack={handleBackToMenu} onScenarioSelect={handleScenarioSelect} />;
};