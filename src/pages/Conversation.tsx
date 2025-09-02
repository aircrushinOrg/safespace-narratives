import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIConversationScene } from '@/components/AIConversationScene';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Heart, X } from 'lucide-react';

interface ConversationData {
  scenarioId: string;
  npcName: string;
  npcSprite: string;
  setting: string;
}

const Conversation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get conversation data from URL parameters
  const scenarioId = searchParams.get('scenarioId');
  const npcName = searchParams.get('npcName');
  const npcSprite = searchParams.get('npcSprite');
  const setting = searchParams.get('setting');

  // If required parameters are missing, show error page
  if (!scenarioId || !npcName || !npcSprite || !setting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game
          </Button>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Invalid Conversation</h2>
            <p className="text-gray-600 mb-4">
              The conversation parameters are missing or invalid.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const conversationData: ConversationData = {
    scenarioId,
    npcName,
    npcSprite,
    setting
  };

  const scenarioDescription = useMemo(() => {
    const goals: Record<string, string> = {
      'college-party': 'Practice discussing safety, consent, and responsible decision-making at parties',
      'travel-romance': 'Navigate health considerations and safety while traveling internationally',
      'relationship-milestone': 'Communicate about STI testing, protection, and comfort levels in relationships',
      'dating-app': 'Discuss safety and getting to know someone from online dating'
    };
    return goals[scenarioId] ?? setting;
  }, [scenarioId, setting]);

  const handleBack = () => {
    navigate('/');
  };

  // Allow quick exit with Escape key
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Game HUD Overlay */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-2 shadow-md backdrop-blur">
            {/* Left: Pause/Back */}
            <div className="pointer-events-auto">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <X className="h-4 w-4 mr-2" /> Exit
              </Button>
            </div>

            {/* Center: Scenario + NPC */}
            <div className="flex min-w-0 items-center gap-2 text-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-pink-500 text-xs font-bold shadow">
                {conversationData.npcName[0]}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{conversationData.npcName}</div>
                <div className="truncate text-[11px] text-slate-300">{conversationData.setting}</div>
              </div>
            </div>

            {/* Right: Hearts */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-rose-400">
                <Heart className="h-4 w-4 fill-current" />
                <Heart className="h-4 w-4 fill-current" />
                <Heart className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanlines + Vignette overlay for retro feel */}
      <div
        className="pointer-events-none fixed inset-0 z-30 mix-blend-multiply"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 2px, transparent 4px)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)'
        }}
      />

      {/* Core Conversation Scene */}
      <AIConversationScene conversationData={conversationData} onBack={handleBack} />

      {/* Controls hint */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 shadow backdrop-blur">
            <Gamepad2 className="h-3.5 w-3.5 opacity-80" />
            <span className="opacity-80">Enter = Send</span>
            <span className="opacity-30">|</span>
            <span className="opacity-80">1-3 = Suggestions</span>
            <span className="opacity-30">|</span>
            <span className="opacity-80">Esc = Pause/Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
