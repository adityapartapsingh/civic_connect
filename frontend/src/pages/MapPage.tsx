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
        <div className="inline-flex rounded-2xl bg-white p-1 border border-slate-200 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'map'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'leaderboard'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Ward Rankings</span>
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="space-y-4">
          {/* Controls Bar: Category filter & Heatmap toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Categories ({issues.length})
              </button>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
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
          <div className="h-[520px] sm:h-[600px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <IssueMap
              issues={filteredIssues}
              userLocation={coords}
              center={coords ? [coords.latitude, coords.longitude] : [12.9352, 77.6245]}
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
