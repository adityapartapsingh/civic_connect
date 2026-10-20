import React, { useState, useEffect } from 'react';
import { WardLeaderboardItem } from '../../types';
import { issuesApi } from '../../services/api';
import { Trophy, Clock, CheckCircle2, Users, ArrowUpRight, Flame } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Leaderboard: React.FC = () => {
  const [data, setData] = useState<WardLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'speed' | 'rate'>('speed');
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await issuesApi.getLeaderboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const sortedList = [...data].sort((a, b) => {
    if (sortBy === 'speed') {
      return a.avg_resolution_hours - b.avg_resolution_hours;
    }
    return b.resolution_rate_percent - a.resolution_rate_percent;
  });

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded text-amber-400 border border-slate-700">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Ward Resolution Leaderboard</h3>
              <p className="text-xs text-slate-400">Public transparency ranking of municipal zones</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded">
            Live Metrics
          </span>
        </div>

        {/* Sort switch */}
        <div className="mt-4 flex rounded bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => setSortBy('speed')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded transition-colors ${
              sortBy === 'speed'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fastest Resolution Speed
          </button>
          <button
            onClick={() => setSortBy('rate')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded transition-colors ${
              sortBy === 'rate'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Highest Resolution Rate
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading ward scores...</div>
        ) : (
          sortedList.map((ward, idx) => {
            const isUserWard = user?.ward === ward.ward_name;
            return (
              <div
                key={ward.ward_id}
                className={`p-4 transition-colors flex items-center justify-between gap-3 ${
                  isUserWard ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(idx)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 truncate">{ward.ward_name}</p>
                      {isUserWard && (
                        <span className="text-[10px] uppercase font-bold bg-brand-100 text-brand-700 px-1.5 py-0.2 rounded-md">
                          Your Ward
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{ward.zone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {ward.active_citizens} citizens
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div className="flex items-center justify-end gap-1 font-bold text-sm text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{ward.avg_resolution_hours}h avg</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ward.resolution_rate_percent}% resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Rankings are updated automatically as civic field officers resolve issues and citizens confirm completion.
        </p>
      </div>
    </div>
  );
};
