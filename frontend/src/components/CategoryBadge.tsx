import React from 'react';
import type { ReportCategory } from '../types';
import { 
  AlertTriangle, 
  Footprints, 
  Trash2, 
  TrafficCone, 
  ShieldAlert, 
  Accessibility, 
  HelpCircle 
} from 'lucide-react';

interface Props {
  category: ReportCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<Props> = ({ category, showIcon = true }) => {
  const configs: Record<
    ReportCategory,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    ACCESSIBILITY: {
      label: 'Accessibility Barrier',
      bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      text: 'text-indigo-300',
      icon: <Accessibility className="w-3.5 h-3.5" />,
    },
    POTHOLE: {
      label: 'Pothole',
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    ROAD_DAMAGE: {
      label: 'Road Hazard',
      bg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
      text: 'text-orange-300',
      icon: <TrafficCone className="w-3.5 h-3.5" />,
    },
    SIDEWALK: {
      label: 'Broken Sidewalk',
      bg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      text: 'text-teal-300',
      icon: <Footprints className="w-3.5 h-3.5" />,
    },
    GARBAGE: {
      label: 'Garbage & Waste',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      text: 'text-emerald-300',
      icon: <Trash2 className="w-3.5 h-3.5" />,
    },
    SIGNAGE: {
      label: 'Damaged Signage',
      bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      text: 'text-sky-300',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    OTHER: {
      label: 'Infrastructure Other',
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-300',
      text: 'text-slate-300',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[category] || configs.OTHER;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${config.bg}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
