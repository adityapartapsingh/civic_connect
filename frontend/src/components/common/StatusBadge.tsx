import React from 'react';
import { IssueStatus } from '../../types';

interface StatusBadgeProps {
  status: IssueStatus | 'critical' | 'in_progress' | 'resolved' | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const normStatus = (status || 'reported').toLowerCase();

  // Strict Swiss Civic Status Tokens
  let bg = 'bg-[#F8FAFC]';
  let text = 'text-[#475569]';
  let border = 'border-[#E2E8F0]';
  let dot = 'bg-[#64748B]';
  let label = status;

  if (normStatus === 'reported' || normStatus === 'critical' || normStatus === 'urgent' || normStatus === 'sla_breached' || normStatus === 'disputed') {
    bg = 'bg-[#FEF2F2]';
    text = 'text-[#DC2626]';
    border = 'border-[#FCA5A5]';
    dot = 'bg-[#DC2626]';
    label = normStatus === 'sla_breached' ? 'SLA Breached' : normStatus === 'reported' ? 'Reported' : normStatus === 'disputed' ? 'Disputed' : 'Critical Hazard';
  } else if (normStatus === 'in_progress' || normStatus === 'acknowledged' || normStatus === 'pending') {
    bg = 'bg-[#FFFBEB]';
    text = 'text-[#D97706]';
    border = 'border-[#FCD34D]';
    dot = 'bg-[#D97706]';
    label = normStatus === 'acknowledged' ? 'Acknowledged' : normStatus === 'in_progress' ? 'In Progress' : 'Pending';
  } else if (normStatus === 'resolved' || normStatus === 'closed' || normStatus === 'operational') {
    bg = 'bg-[#F0FDF4]';
    text = 'text-[#16A34A]';
    border = 'border-[#86EFAC]';
    dot = 'bg-[#16A34A]';
    label = normStatus === 'closed' ? 'Closed' : 'Resolved';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] font-semibold leading-tight'
      : 'px-2.5 py-1 text-xs font-semibold leading-tight';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border ${bg} ${text} ${border} ${sizeClasses} font-mono tracking-tight ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
