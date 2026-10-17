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
    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl transition-colors ${
            enabled ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Civic Hotspot Density</span>
            {enabled && (
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full">
                {hotspotsCount} Hotspots active
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
