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
    setSelectedScenario(scenarioId);
    setGameState('scenario');
  };

  const handleBackToMenu = () => {
    setGameState('game2d');
    setSelectedScenario(null);
  };

  const handleBackToGame = () => {
    setGameState('game2d');
    setSelectedScenario(null);
  };

  if (gameState === 'game2d') {
    return <Game2D onBack={handleBackToMenu} onScenarioSelect={handleScenarioSelect} />;
  }

  if (gameState === 'scenario' && selectedScenario) {
    return (
      <ChatInterface 
        scenarioId={selectedScenario} 
        onBack={handleBackToGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Interactive Health Education</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Smart Choices,
              <span 
                className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Safer Future
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
              Practice real-world conversations about sexual health through interactive scenarios. 
              Learn to navigate intimate situations with confidence, knowledge, and safety.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center space-y-4 hover:shadow-[var(--shadow-soft)] transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Evidence-Based Learning</h3>
            <p className="text-sm text-muted-foreground">
              Educational content based on CDC guidelines and peer-reviewed research
            </p>
          </Card>
          
          <Card className="p-6 text-center space-y-4 hover:shadow-[var(--shadow-soft)] transition-all duration-300">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Realistic Conversations</h3>
            <p className="text-sm text-muted-foreground">
              Practice with AI NPCs that respond naturally to build real communication skills
            </p>
          </Card>
          
          <Card className="p-6 text-center space-y-4 hover:shadow-[var(--shadow-soft)] transition-all duration-300">
            <div className="w-12 h-12 bg-accent/30 text-accent-foreground rounded-lg flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Personal Empowerment</h3>
            <p className="text-sm text-muted-foreground">
              Build confidence to make informed decisions in real-life situations
            </p>
          </Card>
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Learning Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose how you want to learn about sexual health and safety through interactive experiences.
            </p>
          </div>
          
          {/* Main Game Button */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:shadow-[var(--shadow-glow)] transition-all duration-300">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Enter the Campus</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Walk around the virtual campus, meet different characters, and choose which scenarios to explore.
                </p>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={handleStart2DGame}
                  className="px-8 py-3 text-lg"
                >
                  Start 2D Game
                </Button>
              </div>
            </Card>
          </div>

          {/* Individual Scenarios */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Or Choose a Specific Scenario</h3>
              <p className="text-sm text-muted-foreground">
                Jump directly into a particular learning experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <GameScenario
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={handleScenarioSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Educational Note */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-accent/20 border-accent/30">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Remember: You're Always in Control</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                This educational tool helps you practice important conversations and decision-making skills. 
                In real life, prioritize open communication, mutual respect, and informed consent. 
                When in doubt, consult healthcare professionals.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                <span>📍 Resources:</span>
                <a href="https://plannedparenthood.org" target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:underline">Planned Parenthood</a>
                <span>•</span>
                <a href="https://cdc.gov/std" target="_blank" rel="noopener noreferrer"
                   className="text-primary hover:underline">CDC STI Guidelines</a>
                <span>•</span>
                <a href="https://who.int" target="_blank" rel="noopener noreferrer"
                   className="text-primary hover:underline">WHO Health Info</a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};