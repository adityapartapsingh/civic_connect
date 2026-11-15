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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            City Civic Transparency Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time public audit of municipal issues, field dispatches, and resolved repairs across all wards.
          </p>
        </div>

        {/* Status Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-md transition ${
              selectedStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1.5 rounded-md transition ${
              selectedStatus === 'active'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
              selectedStatus === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Controls Bar: Category filter & Heatmap toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer border ${
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="md:col-span-1">
            <HeatmapToggle
              enabled={showHeatmap}
              onToggle={setShowHeatmap}
              hotspotsCount={3}
            />
          </div>
        </div>

        {/* Interactive Leaflet Map Box */}
        <div className="h-[520px] sm:h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
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
