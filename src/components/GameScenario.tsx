import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plane, Heart, Smartphone } from 'lucide-react';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  setting: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface GameScenarioProps {
  scenario: Scenario;
  onSelect: (scenarioId: string) => void;
}

const riskColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-red-100 text-red-800'
};

export const GameScenario: React.FC<GameScenarioProps> = ({ scenario, onSelect }) => {
  return (
    <Card className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:scale-105 group">
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: 'var(--gradient-card)' }}
      />
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {scenario.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground">{scenario.setting}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[scenario.riskLevel]}`}>
            {scenario.riskLevel} risk
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scenario.description}
        </p>
        
        <Button 
          variant="hero"
          className="w-full"
          onClick={() => onSelect(scenario.id)}
        >
          Start Scenario
        </Button>
      </div>
    </Card>
  );
};

export const scenarios: Scenario[] = [
  {
    id: 'college-party',
    title: 'College Party Encounter',
    description: "Navigate social pressures and intimate decisions at a lively campus party. Test your knowledge of STI prevention in social settings with alcohol and peer pressure.",
    icon: <Users className="w-5 h-5" />,
    setting: 'Campus Party',
    riskLevel: 'medium'
  },
  {
    id: 'travel-romance',
    title: 'Overseas Travel Romance',
    description: "Experience a romantic encounter while traveling abroad. Learn about health considerations in unfamiliar settings with potential language and cultural barriers.",
    icon: <Plane className="w-5 h-5" />,
    setting: 'Foreign Country',
    riskLevel: 'high'
  },
  {
    id: 'relationship-milestone',
    title: 'Long-term Relationship Milestone',
    description: "Navigate important conversations about health and trust in a committed relationship. Explore testing, communication, and mutual responsibility.",
    icon: <Heart className="w-5 h-5" />,
    setting: 'Committed Relationship',
    riskLevel: 'low'
  },
  {
    id: 'dating-app',
    title: 'Dating App Hook-up',
    description: "Make quick decisions about safety and protection with someone you met online. Practice digital communication about health and boundaries.",
    icon: <Smartphone className="w-5 h-5" />,
    setting: 'Coffee Shop/Home',
    riskLevel: 'medium'
  }
];