import React from 'react';
import { Compass } from 'lucide-react';
import { ReportFilterParams } from '../../types';

export type ProximityRadiusOption = 'auto' | 500 | 2000 | 5000 | 'all';

interface FilterBarProps {
  filters: ReportFilterParams;
  onChange: (updated: Partial<ReportFilterParams>) => void;
  showStatusFilter?: boolean;
  proximityRadius?: ProximityRadiusOption;
  onProximityChange?: (radius: ProximityRadiusOption) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  showStatusFilter = false,
  proximityRadius,
  onProximityChange,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1">
            Priority:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'urgent', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ].map((p) => {
            const isSelected = (filters.priority || 'all') === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ priority: p.id, page: 1 })}
                className={`px-2.5 py-1 rounded font-medium text-xs transition border ${
                  isSelected
                    ? p.id === 'urgent'
                      ? 'bg-red-700 text-white border-red-700'
                      : p.id === 'high'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1">
            Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
          ].map((d) => {
            const isSelected = (filters.date_range || 'all') === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onChange({ date_range: d.id as any, page: 1 })}
                className={`px-2.5 py-1 rounded font-medium text-xs transition border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">
            Sort:
          </span>
          <select
            value={filters.sort_by || 'newest'}
            onChange={(e) => onChange({ sort_by: e.target.value as any, page: 1 })}
            aria-label="Sort reports order"
            className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="newest">Newest First</option>
            <option value="priority">Highest Priority</option>
            <option value="sla">SLA Deadline</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {showStatusFilter && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'reported', label: 'Reported' },
            { id: 'acknowledged', label: 'Acknowledged' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'closed', label: 'Closed' },
          ].map((s) => {
            const isSelected = (filters.status || 'all') === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ status: s.id, page: 1 })}
                className={`px-2.5 py-1 rounded font-medium text-xs transition border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {proximityRadius !== undefined && onProximityChange && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>Proximity Scope:</span>
          </span>
          {[
            { id: 'auto' as const, label: '📍 Nearest First (500m → City-Wide Stream)' },
            { id: 500 as const, label: 'Within 500m' },
            { id: 2000 as const, label: 'Within 2 km' },
            { id: 5000 as const, label: 'Within 5 km' },
            { id: 'all' as const, label: 'All City Wards' },
          ].map((scope) => {
            const isSelected = proximityRadius === scope.id;
            return (
              <button
                key={String(scope.id)}
                type="button"
                onClick={() => onProximityChange(scope.id)}
                className={`px-2.5 py-1 rounded-md transition font-medium text-xs border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {scope.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
