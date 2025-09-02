import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft, RotateCcw } from 'lucide-react';
import { scenarios, type Scenario } from './GameScenario';

interface Message {
  id: string;
  type: 'user' | 'npc' | 'system';
  content: string;
  timestamp: Date;
  character?: string;
}

interface ChatInterfaceProps {
  scenarioId: string;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ scenarioId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scenario = scenarios.find(s => s.id === scenarioId);
  
  useEffect(() => {
    initializeScenario();
  }, [scenarioId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeScenario = () => {
    const initialMessages = getScenarioIntro(scenarioId);
    setMessages(initialMessages);
    setGameState('intro');
  };

  const getScenarioIntro = (id: string): Message[] => {
    const intros = {
      'college-party': [
        {
          id: '1',
          type: 'system' as const,
          content: "🎓 **College Party Scenario**\n\nYou're a 20-year-old college student at a lively campus party. The music is loud, people are dancing, and you notice someone attractive across the room.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Alex',
          content: "Hey! I noticed you from across the room. I'm Alex - I think we have biology class together? This party is pretty wild, right? *takes a sip from red cup* Want to grab some fresh air and chat?",
          timestamp: new Date(),
        }
      ],
      'travel-romance': [
        {
          id: '1',
          type: 'system' as const,
          content: "✈️ **Travel Romance Scenario**\n\nYou're exploring a vibrant night market in Bangkok. The atmosphere is electric with street food, music, and fellow travelers from around the world.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Jamie',
          content: "Excuse me, you look a bit lost! *laughs warmly* I'm Jamie - been backpacking through Southeast Asia for two months now. This is my favorite food stall here. Want me to help you order something authentic?",
          timestamp: new Date(),
        }
      ],
      'relationship-milestone': [
        {
          id: '1',
          type: 'system' as const,
          content: "💕 **Relationship Milestone Scenario**\n\nYou're at home with Taylor, your partner of 6 months. You've been getting closer lately, and tonight feels like the right time for an important conversation.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Taylor',
          content: "I love how comfortable we've become together. *sits closer on the couch* I've been thinking... we trust each other completely now. Maybe it's time we talked about taking our intimacy to the next level?",
          timestamp: new Date(),
        }
      ],
      'dating-app': [
        {
          id: '1',
          type: 'system' as const,
          content: "📱 **Dating App Scenario**\n\nYou're meeting Riley for the first time at a cozy coffee shop. You matched on a dating app last week and have been chatting daily. The chemistry seems real.",
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'npc' as const,
          character: 'Riley',
          content: "You're even cuter in person! *grins* I have to say, our conversations this week have been amazing. I'm not usually this forward, but I feel like we have a real connection. Want to head somewhere more private?",
          timestamp: new Date(),
        }
      ]
    };
    
    return intros[id as keyof typeof intros] || [];
  };

  const generateNPCResponse = (userMessage: string): string => {
    // Simulate intelligent NPC responses based on scenario context
    const responses = {
      'college-party': [
        "I'm glad you asked! Actually, I just went through a rough breakup last month, so I've been a bit wild lately. But hey, we're young, right? *moves closer*",
        "Protection? *laughs* Come on, we're both college students - I'm sure we're fine. Plus, doesn't that kind of kill the mood?",
        "You're really responsible, I like that about you. Most people our age don't even think about that stuff. Maybe we should slow down a bit?"
      ],
      'travel-romance': [
        "Health checks while traveling? That's very Western of you! *smiles* Here, people are more... spontaneous. But I appreciate you asking.",
        "I've been traveling for months - met lots of amazing people along the way. Life's about experiences, right? Don't overthink it!",
        "You're different from other travelers I've met. I like that you care about safety. Maybe we should talk more about this?"
      ],
      'relationship-milestone': [
        "We've been exclusive for months now - I trust you completely. Don't you trust me? Testing feels like we're questioning our relationship.",
        "I love that you brought this up. Yes, let's both get tested together. It shows we care about each other's health.",
        "I haven't been with anyone else since we started dating, so we should be fine, right? But if it makes you feel better..."
      ],
      'dating-app': [
        "My profile says I'm recently tested and clean - didn't you read it? *shows phone* See? I'm very careful about these things.",
        "Wow, straight to business! I like that. Yeah, I always carry protection. Safety first, fun second, right?",
        "App hookups can be risky, but that's why we chatted for a week first. I feel like I know you already!"
      ]
    };

    const scenarioResponses = responses[scenarioId as keyof typeof responses] || [];
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)] || 
           "That's an interesting perspective. Tell me more about what you're thinking.";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate NPC thinking time
    setTimeout(() => {
      const npcResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'npc',
        character: getCurrentCharacter(),
        content: generateNPCResponse(input),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, npcResponse]);
      setIsTyping(false);

      // Add educational prompts periodically
      if (messages.length > 4 && Math.random() > 0.6) {
        setTimeout(() => {
          const prompt: Message = {
            id: (Date.now() + 2).toString(),
            type: 'system',
            content: "💡 **Reflection Moment**: What factors are influencing your decisions right now? Consider the environment, any substances involved, and how well you know this person.",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, prompt]);
        }, 2000);
      }
    }, 1500 + Math.random() * 1000);
  };

  const getCurrentCharacter = (): string => {
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
    setGameState('intro');
    initializeScenario();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] p-4 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : message.type === 'system'
                  ? 'bg-accent/50 border-accent'
                  : 'bg-card'
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
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{getCurrentCharacter()} is typing...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Remember: You're in control. Smart choices keep you safe.
          </p>
        </div>
      </div>
    </div>
  );
};