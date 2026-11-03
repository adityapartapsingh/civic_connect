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
  const [selectedStatus] = useState<string>('all');
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

  const filteredIssues = issues.filter((i) => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          City Civic Transparency Map
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time public audit of municipal issues and field team dispatches.
        </p>
      </div>

      <div className="space-y-4">
        {/* Controls Bar: Category filter & Heatmap toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Categories ({issues.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition border cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
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
        <div className="h-[520px] sm:h-[600px] w-full rounded-lg overflow-hidden border border-slate-300 shadow-xs">
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
