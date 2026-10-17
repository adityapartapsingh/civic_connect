import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import {
  Award,
  Zap,
  Shield,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Video,
  MapPin,
  TrendingUp,
  Lock,
  Sparkles,
  Phone,
  User,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const badgeIcons: Record<string, React.ElementType> = {
  Eye,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Video,
};

export const ProfilePage: React.FC = () => {
  const { user, isOfficer, toggleRole, addPoints } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-slate-500">Please log in to view your profile.</p>
      </div>
    );
  }

  // Level computation: Every 60 points = 1 level
  const currentLevel = user.level;
  const currentPoints = user.points;
  const nextLevelThreshold = currentLevel * 60;
  const pointsInCurrentLevel = currentPoints % 60;
  const levelProgressPercent = Math.min(Math.round((pointsInCurrentLevel / 60) * 100), 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-7 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl">
              {user.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name}</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Lvl {user.level} Citizen
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>{user.ward || 'Ward 18 - Koramangala'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleRole}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isOfficer
                  ? 'bg-purple-700 text-white border-purple-600'
                  : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isOfficer ? 'Officer View' : 'Citizen View'}</span>
            </button>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Level {currentLevel} Civic Standing
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {currentPoints} / {nextLevelThreshold} PTS ({60 - pointsInCurrentLevel} pts to Lvl {currentLevel + 1})
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Reports Filed</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.reports_submitted_count}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">All verified live</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Fixes Completed</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">
            {user.reports_resolved_count}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">80% resolution rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Civic Points</span>
          <div className="text-2xl font-black text-amber-600 mt-0.5">{user.points}</div>
          <span className="text-[11px] text-amber-700 font-medium">Top 5% in Ward</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Upvotes Given</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.upvotes_given_count}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Duplicates spared</span>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Civic Badges & Achievements ({user.badges.filter((b) => b.is_unlocked).length}/{user.badges.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Unlock badges to earn points</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {user.badges.map((badge) => {
            const IconComponent = badgeIcons[badge.icon] || Award;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition ${
                  badge.is_unlocked
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.is_unlocked
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {badge.is_unlocked ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900">{badge.name}</h4>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                      +{badge.points_reward} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                  {badge.is_unlocked && badge.unlocked_at && (
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PWA App Information & Offline Readiness Card */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>PWA Service Worker: <strong>Active & Cached</strong></span>
        </div>
        <span className="text-slate-400">Civic Connect v1.0.0</span>
      </div>
    </div>
  );
};
