import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyManagerProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('deepseek_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsStored(true);
      onApiKeySet(storedKey);
    }
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('deepseek_api_key', apiKey.trim());
    setIsStored(true);
    onApiKeySet(apiKey.trim());
    
    toast({
      title: "Success",
      description: "API key saved successfully! You can now chat with AI.",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('deepseek_api_key');
    setApiKey('');
    setIsStored(false);
    onApiKeySet('');
    
    toast({
      title: "Cleared",
      description: "API key cleared from browser storage",
    });
  };

  if (isStored) {
    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Deepseek API Key Connected
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearApiKey}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Clear Key
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">
            Connect Deepseek AI
          </h3>
        </div>
        
        <p className="text-sm text-blue-700 mb-4">
          Enter your DeepSeek API key to enable AI-powered conversations.
          You can also set <code>VITE_DEEPSEEK_API_KEY</code> in a <code>.env</code> file.
          The key entered here is stored locally and never sent to our servers.
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="sk-deepseek-xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={handleSaveApiKey} className="shrink-0">
            Save Key
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          Get your API key from{' '}
          <a 
            href="https://platform.deepseek.com/api_keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Deepseek Platform
          </a>
        </p>
      </div>
    </Card>
  );
};
