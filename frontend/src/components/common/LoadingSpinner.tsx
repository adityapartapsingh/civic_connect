import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className={`${sizeMap[size]} text-brand-600 animate-spin`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95">
        {content}
      </div>
    );
  }

  return content;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-5 bg-slate-200 rounded w-20"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-full"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      <div className="h-32 bg-slate-100 rounded w-full"></div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 bg-slate-200 rounded w-28"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
};
