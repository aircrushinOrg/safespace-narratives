import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { scenarios } from './GameScenario';

interface Message {
  id: string;
  type: 'user' | 'npc' | 'system';
  content: string;
  timestamp: Date;
  character?: string;
}

interface ScenarioGameProps {
  scenarioId: string;
  onBack: () => void;
}

export const ScenarioGame: React.FC<ScenarioGameProps> = ({ scenarioId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<'intro' | 'conversation' | 'decision' | 'outcome'>('intro');
  
  const scenario = scenarios.find(s => s.id === scenarioId);
  
  useEffect(() => {
    initializeScenario();
  }, [scenarioId]);

  const initializeScenario = () => {
    const intro = getScenarioIntro(scenarioId);
    setMessages(intro);
    setGamePhase('intro');
    
    // Show initial options after intro
    setTimeout(() => {
      setCurrentOptions(getInitialOptions(scenarioId));
      setGamePhase('conversation');
    }, 2000);
  };

  const getScenarioIntro = (id: string): Message[] => {
    const intros = {
      'college-party': [
        {
          id: '1',
          type: 'system' as const,
          content: "🎓 **College Party Scenario**\n\nYou're at a lively campus party. Music is loud, people are dancing with drinks in hand. You notice Alex across the room.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Alex',
          content: "Hey! I think we have biology class together? This party is crazy! *takes a sip* Want to grab some fresh air and chat?",
          timestamp: new Date(),
        }
      ],
      'travel-romance': [
        {
          id: '1',
          type: 'system' as const,
          content: "✈️ **Travel Romance Scenario**\n\nYou're exploring a vibrant night market in Bangkok. The atmosphere is electric with street food and music.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Jamie',
          content: "You look lost! *laughs warmly* I'm Jamie - been backpacking for months. This is my favorite food stall. Want me to help you order?",
          timestamp: new Date(),
        }
      ],
      'relationship-milestone': [
        {
          id: '1',
          type: 'system' as const,
          content: "💕 **Relationship Milestone Scenario**\n\nYou're at home with Taylor, your partner of 6 months. Tonight feels right for an important conversation.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Taylor',
          content: "I love how comfortable we've become. *sits closer* Maybe it's time we talked about taking our intimacy to the next level?",
          timestamp: new Date(),
        }
      ],
      'dating-app': [
        {
          id: '1',
          type: 'system' as const,
          content: "📱 **Dating App Scenario**\n\nYou're meeting Riley at a cozy coffee shop. You've been chatting on the app all week.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Riley',
          content: "You're even cuter in person! *grins* Our conversations have been amazing. Want to head somewhere more private?",
          timestamp: new Date(),
        }
      ]
    };
    
    return intros[id as keyof typeof intros] || [];
  };

  const getInitialOptions = (id: string): string[] => {
    const options = {
      'college-party': [
        "Sure, let's get some air. How long have you been at this party?",
        "Actually, I should ask - are you feeling okay? You seem a bit tipsy.",
        "I'd love to chat! Mind if I ask about your recent health history first?"
      ],
      'travel-romance': [
        "That's so kind! I'd love to try authentic food here.",
        "Thanks! I'm curious - how do you stay healthy while traveling?",
        "You seem very experienced. Do you always meet people this easily?"
      ],
      'relationship-milestone': [
        "I've been thinking the same thing. Should we talk about testing first?",
        "I love you too. Let's make sure we're both comfortable and safe.",
        "You're right, I trust you completely. What did you have in mind?"
      ],
      'dating-app': [
        "Thank you! I've really enjoyed our conversations too.",
        "I'm interested, but maybe we should discuss safety and protection first?",
        "You're very forward! I like that, but let's talk boundaries."
      ]
    };
    
    return options[id as keyof typeof options] || [];
  };

  const handleOptionSelect = (option: string) => {
    // Add user's choice
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: option,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentOptions([]);
    
    // Generate NPC response and new options
    setTimeout(() => {
      const response = generateNPCResponse(option, scenarioId);
      const npcMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'npc',
        character: getCurrentCharacter(scenarioId),
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, npcMessage]);
      
      // Set new options based on the conversation flow
      setTimeout(() => {
        const newOptions = getNextOptions(option, scenarioId);
        setCurrentOptions(newOptions);
        
        // Add educational prompts
        if (Math.random() > 0.5) {
          const prompt: Message = {
            id: (Date.now() + 2).toString(),
            type: 'system',
            content: "💡 **Think About It**: What factors should influence your decision here? Consider safety, communication, and your comfort level.",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, prompt]);
        }
      }, 1500);
    }, 1000);
  };

  const generateNPCResponse = (userChoice: string, scenarioId: string): string => {
    // This would be much more sophisticated in a real implementation
    const responses = {
      'college-party': [
        "About an hour! I love how direct you are. Most people just small talk. Want to find somewhere quieter?",
        "Tipsy? *laughs* Maybe a little! But I'm having so much fun. You worry too much!",
        "Health history? Wow, you're really responsible. I like that, but isn't that a bit intense for a party?"
      ],
      'travel-romance': [
        "Great! *orders food* So what brings you to Thailand? First time traveling solo?",
        "Smart question! I just go with the flow mostly. Life's about experiences, right?",
        "Meeting people is the best part of traveling! I've made so many connections along the way."
      ],
      'relationship-milestone': [
        "Testing? I appreciate that you brought it up. When did you last get tested?",
        "Thank you for thinking about both of us. I love how we communicate.",
        "I was thinking we could stop using protection. We trust each other, right?"
      ],
      'dating-app': [
        "I'm glad! I felt this connection right away. What do you think about going back to my place?",
        "Safety first - I respect that! I always carry protection and get tested regularly.",
        "I like direct communication. What boundaries should we discuss?"
      ]
    };
    
    const scenarioResponses = responses[scenarioId as keyof typeof responses] || [];
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)] || 
           "That's interesting. Tell me more about what you're thinking.";
  };

  const getNextOptions = (previousChoice: string, scenarioId: string): string[] => {
    // Simplified logic - in reality this would be much more complex
    return [
      "I want to make sure we're both safe and comfortable.",
      "Let's discuss protection and what we're both comfortable with.",
      "Maybe we should slow down and get to know each other better first."
    ];
  };

  const getCurrentCharacter = (scenarioId: string): string => {
    const characters = {
      'college-party': 'Alex',
      'travel-romance': 'Jamie', 
      'relationship-milestone': 'Taylor',
      'dating-app': 'Riley'
    };
    return characters[scenarioId as keyof typeof characters] || 'NPC';
  };

  const resetScenario = () => {
    setMessages([]);
    setCurrentOptions([]);
    setGamePhase('intro');
    initializeScenario();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campus
            </Button>
            <div>
              <h1 className="font-semibold">{scenario?.title}</h1>
              <p className="text-sm text-muted-foreground">{scenario?.setting}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetScenario}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`p-4 ${
              message.type === 'user' 
                ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground' 
                : message.type === 'system'
                ? 'bg-accent/50 border-accent'
                : 'mr-auto max-w-[80%] bg-card'
            }`}>
              {message.character && (
                <div className="text-xs font-medium mb-2 text-muted-foreground">
                  {message.character}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            </Card>
          ))}
        </div>

        {/* Choice Options */}
        {currentOptions.length > 0 && (
          <Card className="p-4 bg-accent/20 border-accent/30">
            <h3 className="font-medium mb-3">What do you say?</h3>
            <div className="space-y-2">
              {currentOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Educational Footer */}
        <div className="text-center text-sm text-muted-foreground">
          💡 Remember: You're in control. Smart choices keep you safe.
        </div>
      </div>
    </div>
  );
};