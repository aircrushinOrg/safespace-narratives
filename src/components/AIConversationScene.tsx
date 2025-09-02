import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { DeepseekApi } from '@/services/deepseekApi';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ConversationData {
  scenarioId: string;
  npcName: string;
  npcSprite: string;
  setting: string;
}

interface AIConversationSceneProps {
  conversationData: ConversationData;
  onBack: () => void;
}

export const AIConversationScene: React.FC<AIConversationSceneProps> = ({ 
  conversationData, 
  onBack 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [api, setApi] = useState<DeepseekApi | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scenarioGoals = {
    'college-party': 'Practice discussing safety, consent, and responsible decision-making at parties',
    'travel-romance': 'Navigate health considerations and safety while traveling internationally', 
    'relationship-milestone': 'Communicate about STI testing, protection, and comfort levels in relationships',
    'dating-app': 'Discuss safety and getting to know someone from online dating'
  };

  useEffect(() => {
    if (apiKey) {
      const deepseekApi = new DeepseekApi(apiKey);
      setApi(deepseekApi);
      initializeConversation(deepseekApi);
    }
  }, [apiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Use API key from environment variables
  useEffect(() => {
    const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      setApiKey(envKey.trim());
    } else {
      console.error('VITE_DEEPSEEK_API_KEY environment variable is not set or empty');
      toast({
        title: "Configuration Error",
        description: "API key not found in environment variables. Please restart the dev server after setting your .env file.",
        variant: "destructive"
      });
    }
  }, []);

  const initializeConversation = async (deepseekApi: DeepseekApi) => {
    setIsLoading(true);
    try {
      const systemPrompt = deepseekApi.getScenarioSystemPrompt(conversationData.scenarioId, conversationData.npcName);
      const introMessage = await deepseekApi.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Start the conversation naturally based on the scenario.' }
      ]);

      setMessages([
        {
          id: 'intro',
          role: 'system',
          content: `Scenario: ${scenarioGoals[conversationData.scenarioId as keyof typeof scenarioGoals]}`,
          timestamp: new Date()
        },
        {
          id: 'ai-intro',
          role: 'assistant',
          content: introMessage,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to start conversation. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !api || isLoading || conversationEnded) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, newUserMessage];
      const systemPrompt = api.getScenarioSystemPrompt(conversationData.scenarioId, conversationData.npcName);
      
      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      ];

      const aiResponse = await api.chat(chatMessages);

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Check if conversation should end (after 4+ exchanges)
      if (conversationHistory.filter(msg => msg.role === 'user').length >= 4) {
        setTimeout(() => {
          handleEndConversation([...conversationHistory, newAiMessage]);
        }, 2000);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async (finalMessages?: Message[]) => {
    if (!api || conversationEnded) return;

    setConversationEnded(true);
    setIsLoading(true);

    try {
      const conversationHistory = (finalMessages || messages).filter(msg => msg.role !== 'system');
      const evaluation = await api.evaluateScenario(
        conversationData.scenarioId,
        conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        scenarioGoals[conversationData.scenarioId as keyof typeof scenarioGoals]
      );

      setEvaluation(evaluation);
    } catch (error) {
      console.error('Evaluation failed:', error);
      setEvaluation({
        success: false,
        score: 0,
        feedback: "Unable to evaluate conversation.",
        summary: "Technical error occurred during evaluation."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game
          </Button>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Required</h2>
            <p className="text-gray-600 mb-4">
              You're about to enter <strong>{conversationData.setting}</strong> with <strong>{conversationData.npcName}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Please set <code>VITE_DEEPSEEK_API_KEY</code> in your <code>.env</code> file to enable AI conversations.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm font-mono">
              VITE_DEEPSEEK_API_KEY=your_api_key_here
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game
          </Button>
          
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {conversationData.setting}
          </Badge>
          
          {conversationEnded && evaluation && (
            <Button 
              onClick={() => handleEndConversation()}
              disabled={isLoading}
              className="ml-4"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Evaluate Again
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversationData.npcName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{conversationData.npcName}</h3>
                    <p className="text-sm text-gray-600">AI-powered conversation</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.role === 'system'
                          ? 'bg-yellow-100 text-yellow-800 text-center w-full'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {!conversationEnded && (
                <div className="p-4 border-t space-y-3">
                  {/* Quick suggestions to guide healthy communication */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserInput("I want to make sure we're both safe and comfortable.")}
                      className="text-xs text-left justify-start h-auto py-2"
                      disabled={isLoading}
                    >
                      💡 "I want to make sure we're both safe and comfortable."
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserInput("Let's discuss protection and what we're both comfortable with.")}
                      className="text-xs text-left justify-start h-auto py-2"
                      disabled={isLoading}
                    >
                      🛡️ "Let's discuss protection and boundaries."
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserInput("Maybe we should slow down and get to know each other better first.")}
                      className="text-xs text-left justify-start h-auto py-2"
                      disabled={isLoading}
                    >
                      ⏸️ "Maybe we should take things slower."
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message or choose a suggestion..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleEndConversation()}
                      disabled={isLoading}
                    >
                      End & Evaluate
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Evaluation Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Scenario Goal</h3>
              <p className="text-sm text-gray-600">
                {scenarioGoals[conversationData.scenarioId as keyof typeof scenarioGoals]}
              </p>
            </Card>

            {evaluation && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {evaluation.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className="font-semibold">
                    {evaluation.success ? 'Success!' : 'Needs Improvement'}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Score: {evaluation.score}/100</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${evaluation.score}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Summary:</p>
                    <p className="text-xs text-gray-600">{evaluation.summary}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Feedback:</p>
                    <p className="text-xs text-gray-600">{evaluation.feedback}</p>
                  </div>
                </div>
              </Card>
            )}

            {conversationEnded && !evaluation && (
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Evaluating conversation...</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
