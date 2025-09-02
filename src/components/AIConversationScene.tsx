import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, ArrowLeft, CheckCircle, XCircle, Square, Shield, Heart, AlertTriangle, Sparkles, Flame, Dice6, Check } from 'lucide-react';
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

interface Evaluation {
  success: boolean;
  score: number;
  feedback: string;
  summary: string;
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [api, setApi] = useState<DeepseekApi | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  
  // Gamified overlays state
  const prevScoresRef = useRef<{ trust: number; rapport: number; risk: number }>({ trust: 0, rapport: 0, risk: 0 });
  const [gains, setGains] = useState<Array<{ id: string; label: string; delta: number }>>([]);
  const [combo, setCombo] = useState(0);
  const lastComboAtRef = useRef<number>(0);

  // Lightweight WebAudio synth for SFX
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSfx = (type: 'send' | 'tokenStart' | 'tokenEnd' | 'success' | 'error') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      let freq = 440;
      if (type === 'send') freq = 520;
      if (type === 'tokenStart') freq = 660;
      if (type === 'tokenEnd') freq = 400;
      if (type === 'success') freq = 740;
      if (type === 'error') freq = 220;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (error) {
      // Ignore audio errors - they're not critical
      console.debug('Audio playback failed:', error);
    }
  };

  const trustScore = (() => {
    const keywords = ['consent', 'boundary', 'boundaries', 'protection', 'condom', 'sti', 'testing', 'safe', 'comfort', 'birth control'];
    const userTexts = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');
    const hits = keywords.reduce((acc, k) => acc + (userTexts.includes(k) ? 1 : 0), 0);
    const normalized = Math.min(100, Math.round((hits / Math.max(4, keywords.length)) * 100));
    return normalized;
  })();

  const rapportScore = (() => {
    const pos = ['thank', 'appreciate', 'understand', 'comfortable', 'respect', 'listen', 'care', 'feel', 'glad'];
    const text = messages.map(m => m.content.toLowerCase()).join(' ');
    const hits = pos.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
    return Math.min(100, Math.round((hits / 6) * 100));
  })();

  const riskScore = (() => {
    const risk = ['drunk', 'alcohol', 'drink', 'party', 'unprotected', 'no condom', 'unsafe', 'random', 'tonight'];
    const text = messages.map(m => m.content.toLowerCase()).join(' ');
    const hits = risk.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
    return Math.min(100, Math.round((hits / 6) * 100));
  })();

  // Track and surface "gains" overlays when HUD values change
  useEffect(() => {
    const prev = prevScoresRef.current;
    const addGain = (label: string, delta: number) => {
      if (!delta) return;
      const id = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setGains((g) => [...g, { id, label, delta }]);
      // Auto-remove after animation
      setTimeout(() => setGains((g) => g.filter((x) => x.id !== id)), 1400);
    };
    const dTrust = Math.max(0, trustScore - prev.trust);
    const dRapport = Math.max(0, rapportScore - prev.rapport);
    const dRisk = Math.max(0, prev.risk - riskScore); // lower risk is good
    if (dTrust) addGain('Trust', dTrust);
    if (dRapport) addGain('Rapport', dRapport);
    if (dRisk) addGain('Risk ↓', dRisk);
    prevScoresRef.current = { trust: trustScore, rapport: rapportScore, risk: riskScore };
  }, [trustScore, rapportScore, riskScore]);

  const scenarioGoals = useMemo(() => ({
    'college-party': 'Practice discussing safety, consent, and responsible decision-making at parties',
    'travel-romance': 'Navigate health considerations and safety while traveling internationally', 
    'relationship-milestone': 'Communicate about STI testing, protection, and comfort levels in relationships',
    'dating-app': 'Discuss safety and getting to know someone from online dating'
  }), []);

  const suggestions = useMemo(() => [
    "I want to make sure we're both safe and comfortable.",
    "Let's discuss protection and what we're both comfortable with.",
    "Maybe we should slow down and get to know each other better first."
  ], []);

  const randomSuggestion = useCallback(() => {
    const idx = Math.floor(Math.random() * suggestions.length);
    setUserInput(suggestions[idx]);
  }, [suggestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = useCallback(async (deepseekApi: DeepseekApi) => {
    setIsLoading(true);
    try {
      const systemPrompt = deepseekApi.getScenarioSystemPrompt(conversationData.scenarioId, conversationData.npcName);
      // Start the first AI line directly
      setMessages([{ id: 'ai-intro', role: 'assistant', content: '', timestamp: new Date() }]);
      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      let first = true;
      await deepseekApi.chatStream([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Start the conversation naturally based on the scenario.' }
      ], (token) => {
        if (first) { playSfx('tokenStart'); first = false; }
        setMessages(prev => prev.map(m => m.id === 'ai-intro' ? { ...m, content: m.content + token } : m));
      }, controller.signal);
      playSfx('tokenEnd');
      setIsStreaming(false);
    } catch (error: unknown) {
      if ((error as Error)?.name !== 'AbortError') {
        toast({
          title: "Connection Error",
          description: "Failed to start conversation. Please check your API key.",
          variant: "destructive"
        });
        playSfx('error');
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [conversationData.scenarioId, conversationData.npcName, scenarioGoals, toast]);

  useEffect(() => {
    if (apiKey) {
      const deepseekApi = new DeepseekApi(apiKey);
      setApi(deepseekApi);
      initializeConversation(deepseekApi);
    }
  }, [apiKey, initializeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple combo system: consecutive helpful messages increase streak
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'user') return;
    const text = last.content.toLowerCase();
    const helpful = ['consent', 'boundary', 'boundaries', 'protection', 'condom', 'sti', 'testing', 'safe', 'comfortable', 'birth control'].some(k => text.includes(k));
    const now = Date.now();
    if (helpful) {
      // within 20s window continues combo
      if (now - lastComboAtRef.current < 20000) {
        setCombo((c) => Math.min(9, c + 1));
      } else {
        setCombo(1);
      }
      lastComboAtRef.current = now;
    } else if (now - lastComboAtRef.current > 20000) {
      setCombo(0);
    }
  }, [messages]);

  // Quick-select suggestions via keyboard 1/2/3
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isLoading || isStreaming || conversationEnded) return;
      if (['1','2','3'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const text = suggestions[idx];
        if (text) setUserInput(text);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLoading, isStreaming, conversationEnded, suggestions]);

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
  }, [toast]);

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
    setIsStreaming(true);
    playSfx('send');

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

      const aiId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: new Date() }]);
      const controller = new AbortController();
      abortRef.current = controller;
      let first = true;
      await api.chatStream(chatMessages, (token) => {
        if (first) { playSfx('tokenStart'); first = false; }
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + token } : m));
      }, controller.signal);
      playSfx('tokenEnd');

      // Check if conversation should end (after 4+ exchanges)
      if (conversationHistory.filter(msg => msg.role === 'user').length >= 4) {
        setTimeout(() => {
          handleEndConversation();
        }, 2000);
      }

    } catch (error: unknown) {
      if ((error as Error)?.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive"
        });
        playSfx('error');
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      abortRef.current = null;
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
      if (evaluation?.success) playSfx('success'); else playSfx('error');
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Game</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {conversationEnded && evaluation && (
            <Button 
              onClick={() => handleEndConversation()}
              disabled={isLoading}
              className="shrink-0 w-full sm:w-auto"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              <span className="hidden sm:inline">Evaluate Again</span>
              <span className="sm:hidden">Re-evaluate</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="xl:col-span-2">
            <Card className="relative h-[72vh] sm:h-[78vh] min-h-[560px] flex flex-col border-2 border-black/10 shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
              <div className="relative p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold float-y shadow-md">
                    {conversationData.npcName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{conversationData.npcName}</h3>
                    <p className="text-sm text-gray-600 truncate">AI-powered conversation</p>
                  </div>
                </div>
                {/* Move HUD bars to a separate row for better responsiveness */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <HudBar label="Trust" value={trustScore} icon={<Shield className="h-3 w-3" />} gradient="linear-gradient(90deg,#22c55e,#3b82f6)" />
                  <HudBar label="Rapport" value={rapportScore} icon={<Heart className="h-3 w-3" />} gradient="linear-gradient(90deg,#f472b6,#a78bfa)" />
                  <HudBar label="Risk" value={riskScore} icon={<AlertTriangle className="h-3 w-3" />} gradient="linear-gradient(90deg,#f59e0b,#ef4444)" />
                </div>

                {/* Floating gains overlay */}
                <div className="pointer-events-none absolute right-3 top-3 space-y-1">
                  {gains.map(g => (
                    <div key={g.id} className="flex items-center gap-1 rounded bg-black/40 px-2 py-0.5 text-[11px] text-white shadow-sm animate-pulse">
                      <Sparkles className="h-3 w-3 text-yellow-300" />
                      <span>{g.label} +{Math.min(99, g.delta)}</span>
                    </div>
                  ))}
                </div>

                {/* Combo badge */}
                {combo > 1 && (
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 flex items-center gap-1 rounded-full bg-rose-600 text-white px-3 py-1 text-xs shadow">
                    <Flame className="h-4 w-4" /> Combo x{combo}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.7),rgba(255,255,255,0))]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg border border-black/5 shadow-sm text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.role === 'system'
                          ? 'bg-yellow-100 text-yellow-800 text-center w-full'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-snug">{message.content}{message.role === 'assistant' && isStreaming && message.id === messages[messages.length - 1]?.id ? <span className="blinking-cursor">▍</span> : null}</p>
                      <p className="text-[11px] mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator when AI is streaming */}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg border border-black/5 shadow-sm inline-flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    </div>
                  </div>
                )}

                {isLoading && !isStreaming && (
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
                  <div className="flex flex-wrap gap-2 items-center">
                    {suggestions.map((s, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setUserInput(s)}
                        className="text-xs text-left justify-start h-auto py-2 flex-1 min-w-0 sm:flex-none sm:min-w-[200px]"
                        disabled={isLoading || isStreaming}
                        title={`Shortcut: ${i + 1}`}
                      >
                        <span className="mr-1">{i === 0 ? '💡' : i === 1 ? '🛡️' : '⏸️'}</span>
                        <span className="truncate">"{s}"</span>
                      </Button>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={randomSuggestion}
                      disabled={isLoading || isStreaming}
                      title="Pick a random suggestion"
                      className="shrink-0"
                    >
                      <Dice6 className="h-4 w-4 mr-1" /> Hint
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message or choose a suggestion..."
                      disabled={isLoading || isStreaming}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isLoading || isStreaming}
                        className="flex-1 sm:flex-none"
                      >
                        <Send className="h-4 w-4 sm:mr-0" />
                        <span className="ml-2 sm:hidden">Send</span>
                      </Button>
                      {isStreaming ? (
                        <Button
                          variant="destructive"
                          onClick={() => { abortRef.current?.abort(); }}
                          disabled={!isStreaming}
                          title="Stop generation"
                          className="flex-1 sm:flex-none"
                        >
                          <Square className="h-4 w-4 mr-1" /> 
                          <span className="hidden sm:inline">Stop</span>
                        </Button>
                      ) : null}
                      <Button 
                        variant="outline"
                        onClick={() => handleEndConversation()}
                        disabled={isLoading || isStreaming}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">End & Evaluate</span>
                        <span className="sm:hidden">Evaluate</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Evaluation Panel */}
          <div className="space-y-4">
            {/* Scenario Goal moved out of chat page to top HUD in Conversation.tsx */}
            
            {/* Quest Log: micro-objectives that encourage healthy communication */}
            <QuestLog messages={messages} />

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

// Lightweight HUD bar component
const HudBar: React.FC<{ label: string; value: number; icon?: React.ReactNode; gradient: string }> = ({ label, value, icon, gradient }) => (
  <div>
    <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
      <span className="flex items-center gap-1">{icon}{label}</span>
      <span>{Math.max(0, Math.min(100, Math.round(value)))}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className="h-2 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: gradient }} />
    </div>
  </div>
);

// Quest log component with live objectives
const QuestLog: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const text = messages.map(m => m.content.toLowerCase()).join(' ');
  const goals = [
    { label: 'Affirm consent', done: text.includes('consent') },
    { label: 'Discuss protection', done: ['protection', 'condom', 'birth control'].some(k => text.includes(k)) },
    { label: 'Mention STI testing', done: ['sti', 'testing', 'test'].some(k => text.includes(k)) },
    { label: 'Check comfort/boundaries', done: ['comfortable', 'comfort', 'boundary', 'boundaries'].some(k => text.includes(k)) },
  ];
  const completed = goals.filter(g => g.done).length;
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Quest Log</h3>
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        {completed}/{goals.length} completed
      </div>
      <ul className="space-y-2">
        {goals.map((g, i) => (
          <li key={i} className={`flex items-center gap-2 text-sm ${g.done ? 'text-green-700' : 'text-gray-700'}`}>
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded border ${g.done ? 'bg-green-500 text-white border-green-600' : 'bg-white border-gray-300'}`}>
              {g.done ? <Check className="h-3 w-3" /> : null}
            </span>
            {g.label}
          </li>
        ))}
      </ul>
    </Card>
  );
};
