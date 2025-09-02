import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import campusBackground from '@/assets/campus-background.jpg';
import treeImage from '@/assets/tree.png';

interface Position {
  x: number;
  y: number;
}

interface NPC {
  id: string;
  name: string;
  position: Position;
  scenarioId: string;
  sprite: string;
  dialogue: string[];
  currentDialogue: number;
}

interface Game2DProps {
  onBack: () => void;
  onScenarioSelect?: (scenarioId: string) => void;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TILE_SIZE = 32;
const MOVE_SPEED = 4;

export const Game2D: React.FC<Game2DProps> = ({ onBack, onScenarioSelect }) => {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 400, y: 500 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [playerDirection, setPlayerDirection] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [isMoving, setIsMoving] = useState(false);

  const npcs: NPC[] = [
    {
      id: 'alex',
      name: 'Alex',
      position: { x: 200, y: 200 },
      scenarioId: 'college-party',
      sprite: '🧑‍🎓',
      dialogue: [
        "Hey! I'm Alex from your biology class.",
        "Want to practice conversations about health and safety at parties?",
        "Click 'Start Scenario' to begin the college party simulation!"
      ],
      currentDialogue: 0
    },
    {
      id: 'jamie',
      name: 'Jamie',
      position: { x: 600, y: 150 },
      scenarioId: 'travel-romance',
      sprite: '🧳',
      dialogue: [
        "Hello traveler! I'm Jamie.",
        "I can teach you about health considerations while traveling abroad.",
        "Ready for an overseas romance scenario?"
      ],
      currentDialogue: 0
    },
    {
      id: 'taylor',
      name: 'Taylor',
      position: { x: 150, y: 400 },
      scenarioId: 'relationship-milestone',
      sprite: '💕',
      dialogue: [
        "Hi there! I'm Taylor.",
        "Let's explore important health conversations in relationships.",
        "Want to practice a relationship milestone scenario?"
      ],
      currentDialogue: 0
    },
    {
      id: 'riley',
      name: 'Riley',
      position: { x: 550, y: 450 },
      scenarioId: 'dating-app',
      sprite: '📱',
      dialogue: [
        "Hey! I'm Riley from the dating app.",
        "I can help you practice digital communication about health.",
        "Ready for a dating app scenario?"
      ],
      currentDialogue: 0
    }
  ];

  const checkNPCInteraction = useCallback((pos: Position) => {
    const INTERACTION_DISTANCE = 50;
    
    for (const npc of npcs) {
      const distance = Math.sqrt(
        Math.pow(pos.x - npc.position.x, 2) + Math.pow(pos.y - npc.position.y, 2)
      );
      
      if (distance < INTERACTION_DISTANCE) {
        return npc;
      }
    }
    return null;
  }, [npcs]);

  const movePlayer = useCallback(() => {
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      let hasMovement = false;

      if (keys.has('ArrowLeft') || keys.has('a')) {
        newX -= MOVE_SPEED;
        setPlayerDirection('left');
        hasMovement = true;
      }
      if (keys.has('ArrowRight') || keys.has('d')) {
        newX += MOVE_SPEED;
        setPlayerDirection('right');
        hasMovement = true;
      }
      if (keys.has('ArrowUp') || keys.has('w')) {
        newY -= MOVE_SPEED;
        setPlayerDirection('up');
        hasMovement = true;
      }
      if (keys.has('ArrowDown') || keys.has('s')) {
        newY += MOVE_SPEED;
        setPlayerDirection('down');
        hasMovement = true;
      }

      setIsMoving(hasMovement);

      // Keep player within bounds
      newX = Math.max(16, Math.min(GAME_WIDTH - 16, newX));
      newY = Math.max(16, Math.min(GAME_HEIGHT - 16, newY));

      return { x: newX, y: newY };
    });
  }, [keys]);

  useEffect(() => {
    const gameLoop = setInterval(movePlayer, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [movePlayer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key));
      
      // Space or Enter to interact
      if ((e.key === ' ' || e.key === 'Enter') && !isDialogOpen) {
        const nearbyNPC = checkNPCInteraction(playerPosition);
        if (nearbyNPC) {
          setCurrentNPC(nearbyNPC);
          setIsDialogOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerPosition, isDialogOpen, checkNPCInteraction]);

  const handleDialogNext = () => {
    if (!currentNPC) return;
    
    if (currentNPC.currentDialogue < currentNPC.dialogue.length - 1) {
      setCurrentNPC({
        ...currentNPC,
        currentDialogue: currentNPC.currentDialogue + 1
      });
    } else {
      setIsDialogOpen(false);
      setCurrentNPC(null);
    }
  };

  const startScenario = () => {
    if (currentNPC && onScenarioSelect) {
      onScenarioSelect(currentNPC.scenarioId);
      setIsDialogOpen(false);
    }
  };

  const getPlayerSprite = () => {
    if (!isMoving) {
      switch (playerDirection) {
        case 'left':
        case 'right':
          return '🧍';
        case 'up':
          return '🧍';
        case 'down':
          return '🧍';
        default:
          return '🧍';
      }
    } else {
      switch (playerDirection) {
        case 'left':
        case 'right':
          return '🚶';
        case 'up':
          return '🚶';
        case 'down':
          return '🚶';
        default:
          return '🚶';
      }
    }
  };

  const getNearbyNPC = () => {
    return checkNPCInteraction(playerPosition);
  };

  const nearbyNPC = getNearbyNPC();

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

        {/* Game Area */}
        <Card className="relative overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${campusBackground})`,
              filter: 'brightness(0.9) contrast(1.1)'
            }}
          />
          
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/20" />
          
          {/* Animated floating elements */}
          <div className="absolute inset-0">
            {/* Floating leaves animation */}
            <div className="absolute top-10 left-20 w-4 h-4 bg-green-400/30 rounded-full animate-bounce" 
                 style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute top-32 right-40 w-3 h-3 bg-yellow-400/30 rounded-full animate-bounce" 
                 style={{ animationDelay: '1s', animationDuration: '4s' }} />
            <div className="absolute bottom-40 left-60 w-5 h-5 bg-green-300/30 rounded-full animate-bounce" 
                 style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
                 
            {/* Decorative trees */}
            <div className="absolute bottom-20 right-20 w-16 h-20 opacity-80">
              <img src={treeImage} alt="Tree" className="w-full h-full object-cover rounded-lg shadow-lg" />
            </div>
            <div className="absolute bottom-32 left-32 w-12 h-16 opacity-70">
              <img src={treeImage} alt="Tree" className="w-full h-full object-cover rounded-lg shadow-md transform scale-75" />
            </div>
            
            {/* Campus pathways */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-stone-400/40 to-transparent" />
            <div className="absolute bottom-16 left-1/4 w-1/2 h-8 bg-stone-300/30 rounded-full transform rotate-12" />
          </div>

          {/* Subtle grid overlay for game feel */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`
            }}
          />

          {/* NPCs */}
          {npcs.map(npc => (
            <div
              key={npc.id}
              className="absolute text-4xl select-none transition-transform duration-75"
              style={{
                left: npc.position.x - 16,
                top: npc.position.y - 16,
                transform: nearbyNPC?.id === npc.id ? 'scale(1.2)' : 'scale(1)'
              }}
            >
              {npc.sprite}
              <div className="text-xs text-center font-medium text-foreground bg-background/80 rounded px-1 mt-1">
                {npc.name}
              </div>
            </div>
          ))}

          {/* Player */}
          <div
            className={`absolute text-3xl select-none transition-all duration-75 z-10 ${
              isMoving ? 'animate-walk' : ''
            }`}
            style={{
              left: playerPosition.x - 16,
              top: playerPosition.y - 16,
              transform: `${playerDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`
            }}
          >
            {getPlayerSprite()}
          </div>

          {/* Interaction indicator */}
          {nearbyNPC && !isDialogOpen && (
            <div
              className="absolute text-xl animate-bounce z-20"
              style={{
                left: nearbyNPC.position.x - 8,
                top: nearbyNPC.position.y - 40
              }}
            >
              💬
            </div>
          )}
        </Card>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Walk around and talk to NPCs to learn about different scenarios. 
            {nearbyNPC && (
              <span className="text-primary font-medium">
                {" "}Press Space/Enter to talk to {nearbyNPC.name}!
              </span>
            )}
          </p>
        </div>

        {/* Dialog Box */}
        {isDialogOpen && currentNPC && (
          <Card className="fixed bottom-4 left-4 right-4 p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/20 z-50">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{currentNPC.sprite}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{currentNPC.name}</h3>
                <p className="text-foreground mb-4">
                  {currentNPC.dialogue[currentNPC.currentDialogue]}
                </p>
                <div className="flex space-x-2">
                  {currentNPC.currentDialogue < currentNPC.dialogue.length - 1 ? (
                    <Button onClick={handleDialogNext}>
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button variant="hero" onClick={startScenario}>
                        Start Scenario
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
