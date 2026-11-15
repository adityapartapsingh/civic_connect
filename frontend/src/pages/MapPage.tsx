import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { issuesApi } from '../services/api';
import { IssueMap } from '../components/map/IssueMap';
import { HeatmapToggle } from '../components/map/Heatmap';
import { CATEGORIES } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';

export const MapPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  const { coords } = useGeolocation();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const all = await issuesApi.getAll();
        setIssues(all);
      } catch (err) {
        console.error('Failed to load map issues', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const activeCount = issues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  const filteredIssues = issues.filter((i) => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
    if (selectedStatus === 'active' && (i.status === 'resolved' || i.status === 'closed')) return false;
    if (selectedStatus === 'resolved' && i.status !== 'resolved' && i.status !== 'closed') return false;
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Compact Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
              City Civic Map
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 mt-1">
              Real-time public audit of municipal issues, field dispatches, and resolved repairs across all wards.
            </p>
          </div>

          {/* Quick Heatmap Toggle for Mobile */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 border ${
                showHeatmap
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <span>🔥 Heatmap</span>
            </button>
          </div>
        </div>

        {/* Status Mode Switcher: Single-Line on Mobile */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition whitespace-nowrap text-[11px] sm:text-xs ${
              selectedStatus === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('active')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition whitespace-nowrap text-[11px] sm:text-xs ${
              selectedStatus === 'active'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('resolved')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs ${
              selectedStatus === 'resolved'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* Controls Bar: Single horizontal scroll row for categories */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer border whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition border cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block shrink-0">
            <HeatmapToggle
              enabled={showHeatmap}
              onToggle={setShowHeatmap}
              hotspotsCount={3}
            />
          </div>
        </div>

        {/* Interactive Leaflet Map Box: Expansive on phone */}
        <div className="h-[calc(100vh-210px)] min-h-[420px] sm:h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
          <IssueMap
            issues={filteredIssues}
            userLocation={coords}
            center={coords ? [coords.latitude, coords.longitude] : [31.3260, 75.5762]}
            zoom={14}
            showHeatmap={showHeatmap}
          />
        </div>
      </div>
    </div>
  );
};
