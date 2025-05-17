import { PriorityLevel } from '@prisma/client';
import { AlertCircle, AlertTriangle, CircleCheck } from 'lucide-react';
import React from 'react';

interface AppointmentPriorityIndicatorProps {
  priorityLevel: PriorityLevel;
  priorityScore: number;
  priorityOverride: boolean;
}

const AppointmentPriorityIndicator: React.FC<AppointmentPriorityIndicatorProps> = ({
  priorityLevel,
  priorityScore,
  priorityOverride,
}) => {
  const getPriorityColor = () => {
    switch (priorityLevel) {
      case 'NORMAL':
        return 'bg-blue-600';
      case 'URGENT':
        return 'bg-amber-500';
      case 'EMERGENCY':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getPriorityIcon = () => {
    switch (priorityLevel) {
      case 'NORMAL':
        return <CircleCheck className="h-4 w-4 text-blue-200" />;
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-amber-200" />;
      case 'EMERGENCY':
        return <AlertCircle className="h-4 w-4 text-red-200" />;
      default:
        return <CircleCheck className="h-4 w-4 text-blue-200" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`rounded-full p-1.5 ${getPriorityColor()}`}>
        {getPriorityIcon()}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-100">
            {priorityLevel}
          </span>
          {priorityOverride && (
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-purple-600/60 text-purple-100 border border-purple-400/50">
              Override
            </span>
          )}
        </div>
        <div className="w-16 h-1.5 bg-emerald-900/50 rounded-full mt-1">
          <div 
            className={`h-full rounded-full ${getPriorityColor()}`} 
            style={{ width: `${priorityScore}%` }}
          ></div>
        </div>
        <span className="text-xs text-emerald-400/80">Score: {priorityScore}</span>
      </div>
    </div>
  );
};

export default AppointmentPriorityIndicator;