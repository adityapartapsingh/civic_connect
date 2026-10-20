import React from 'react';
import { Flame, Info } from 'lucide-react';

interface HeatmapToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  hotspotsCount?: number;
}

export const HeatmapToggle: React.FC<HeatmapToggleProps> = ({
  enabled,
  onToggle,
  hotspotsCount = 3,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-300 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded transition-colors ${
            enabled ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Density Heatmap</span>
            {enabled && (
              <span className="text-[10px] bg-rose-50 text-rose-700 font-mono font-medium px-1.5 py-0.5 border border-rose-200 rounded">
                {hotspotsCount} Clusters
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {enabled
              ? 'Displaying high-density issue clusters & unresolved problem areas'
              : 'Show municipal cluster density overlay'}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-red-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
