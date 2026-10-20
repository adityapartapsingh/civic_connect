import React from 'react';
import { IssueStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils/constants';

interface StatusBadgeProps {
  status: IssueStatus;
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
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.reported;

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px] font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={config.description}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-sm ${config.dot}`}
        />
      )}
      {config.label}
    </span>
  );
};
