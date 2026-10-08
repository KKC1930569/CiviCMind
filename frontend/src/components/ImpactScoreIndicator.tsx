import React from 'react';
import { Flame, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import type { PriorityLevel } from '../types';

interface Props {
  score: number;
  priority?: PriorityLevel | string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ImpactScoreIndicator: React.FC<Props> = ({ 
  score, 
  priority, 
  showDetails = false,
  size = 'md'
}) => {
  // Normalize score between 0 and 100
  // Handle cases where old 0-10 score is present by multiplying if < 10
  const normalized = Math.round(score <= 10.0 && score > 0 ? score * 10 : Math.max(0, Math.min(100, score)));

  let colorClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  let badgeLabel = 'LOW';
  let Icon = ShieldCheck;

  if (normalized >= 80) {
    colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10 shadow-sm';
    badgeLabel = 'CRITICAL';
    Icon = Flame;
  } else if (normalized >= 60) {
    colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    badgeLabel = 'HIGH';
    Icon = AlertTriangle;
  } else if (normalized >= 30) {
    colorClasses = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    badgeLabel = 'MEDIUM';
    Icon = AlertCircle;
  }

  const effectivePriority = priority || badgeLabel;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  }[size];

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border font-mono font-semibold tracking-wide ${colorClasses} ${sizeClasses}`}
        title={`Human Impact Score: ${normalized}/100 (${effectivePriority})`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{normalized}</span>
        <span className="opacity-60 font-sans font-normal text-[10px]">/100</span>
      </div>

      {showDetails && (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            effectivePriority === 'CRITICAL'
              ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
              : effectivePriority === 'HIGH'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
              : effectivePriority === 'MEDIUM'
              ? 'bg-yellow-950/60 text-yellow-300 border-yellow-500/30'
              : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
          }`}
        >
          {effectivePriority}
        </span>
      )}
    </div>
  );
};
