import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIConversationScene } from '@/components/AIConversationScene';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <AIConversationScene 
      conversationData={conversationData}
      onBack={handleBack}
    />
  );
};

export default Conversation;
