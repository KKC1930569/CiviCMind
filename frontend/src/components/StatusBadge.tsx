import React from 'react';
import type { ReportStatus } from '../types';
import { Clock, Eye, UserCheck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const configs: Record<
    ReportStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    OPEN: {
      label: 'Open',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.OPEN;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${padding}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
