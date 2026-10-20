import React, { useState, useEffect } from 'react';
import { Issue, IssueCategory } from '../types';
import { issuesApi } from '../services/api';
import { IssueMap } from '../components/map/IssueMap';
import { HeatmapToggle } from '../components/map/Heatmap';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { CATEGORIES } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPin, Trophy, Layers, Filter, CheckCircle2 } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'map' | 'leaderboard'>('map');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            City Civic Transparency Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time public audit of municipal issues, field team dispatches, and ward rankings.
          </p>
        </div>

        {/* View Switcher: Map vs Ward Leaderboard */}
        <div className="inline-flex rounded border border-slate-300 bg-slate-100 p-0.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Map
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'leaderboard'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ward Rankings
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="space-y-4">
          {/* Controls Bar: Category filter & Heatmap toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
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
                  className={`px-3 py-1.5 rounded text-xs font-medium transition border ${
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
      ) : (
        /* Ward Leaderboard Tab */
        <div className="max-w-3xl mx-auto py-2">
          <Leaderboard />
        </div>
      )}
    </div>
  );
};
