
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getStatBreakdown } from '@/utils/enhancedCharacterStats';

interface StatDisplayProps {
  player: any;
  equipment: any;
  statName: string;
  label: string;
  color: string;
}

const StatDisplay = ({ player, equipment, statName, label, color }: StatDisplayProps) => {
  const breakdown = getStatBreakdown(player, equipment, statName);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-between cursor-help">
            <span className="text-gray-400">{label}:</span>
            <span className={`font-medium ${color}`}>{breakdown.total}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-900 border-gray-600 text-white">
          <div className="space-y-1 text-xs">
            <div className="font-bold text-yellow-400 mb-2">{label} Breakdown</div>
            <div className="flex justify-between">
              <span className="text-gray-400">Base:</span>
              <span className="text-white">{breakdown.base}</span>
            </div>
            {breakdown.equipment > 0 && (
              <div className="flex justify-between">
                <span className="text-green-400">Equipment:</span>
                <span className="text-green-400">+{breakdown.equipment}</span>
              </div>
            )}
            {breakdown.attributes > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-400">Attributes:</span>
                <span className="text-blue-400">+{breakdown.attributes}</span>
              </div>
            )}
            <div className="border-t border-gray-600 pt-1 mt-1">
              <div className="flex justify-between font-bold">
                <span className="text-yellow-400">Total:</span>
                <span className="text-yellow-400">{breakdown.total}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatDisplay;
