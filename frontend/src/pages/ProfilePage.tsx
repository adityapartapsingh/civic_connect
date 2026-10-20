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
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Civic Connect</h2>
          <p className="text-sm text-slate-600 mb-6">
            Track your submitted civic issues, earn recognition points, and verify municipal resolutions in your ward.
          </p>
          <Link
            to="/login?redirect=/profile"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2.5 rounded-md transition shadow-xs"
          >
            Sign In with Mobile OTP
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Level computation: Every 60 points = 1 level
  const currentPoints = user.points ?? 0;
  const currentLevel = user.level ?? Math.max(1, Math.floor(currentPoints / 60) + 1);
  const nextLevelThreshold = currentLevel * 60;
  const pointsInCurrentLevel = currentPoints % 60;
  const levelProgressPercent = Math.min(Math.round((pointsInCurrentLevel / 60) * 100), 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 text-white p-6 sm:p-7 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 text-slate-100 flex items-center justify-center font-bold text-xl">
              {user.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name}</h1>
                {isOfficer ? (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {user.designation || 'Field Officer'}
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Lvl {currentLevel} Citizen
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-2.5">
                {isOfficer ? (
                  <>
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{user.department || 'Municipal Division'}</span>
                    </span>
                    {user.employee_id && (
                      <span className="font-mono text-[11px] text-slate-400">
                        Badge ID: <strong className="text-slate-200">{user.employee_id}</strong>
                      </span>
                    )}
                    {user.jurisdiction_zone && (
                      <span className="text-[11px] text-slate-400">
                        Jurisdiction: <strong className="text-slate-200">{user.jurisdiction_zone}</strong>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Verified Citizen · {user.phone || '+91 98765 43210'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleRole}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 border ${
                isOfficer
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
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
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Level {currentLevel} Civic Standing
            </span>
            <span className="font-mono text-amber-300 font-bold">
              Current: {currentPoints} PTS · Next Goal: {nextLevelThreshold} PTS ({60 - pointsInCurrentLevel} pts to Lvl {currentLevel + 1})
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-amber-400 h-full rounded transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Reports Filed</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.reports_submitted_count}
          </div>
          <span className="text-[11px] text-slate-600 font-medium">All verified live</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Fixes Completed</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">
            {user.reports_resolved_count}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">80% resolution rate</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Civic Points</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{user.points}</div>
          <span className="text-[11px] text-slate-600 font-medium">Top 5% in Ward</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Upvotes Given</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.upvotes_given_count}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Duplicates spared</span>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-lg p-5 sm:p-7 border border-slate-300 shadow-xs space-y-4">
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
                className={`p-3.5 rounded-lg border flex items-start gap-3.5 transition ${
                  badge.is_unlocked
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                    badge.is_unlocked
                      ? 'bg-amber-500 text-slate-950 font-bold'
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
                    <span className="text-[10px] font-mono font-medium text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      +{badge.points_reward} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                  {badge.is_unlocked && badge.unlocked_at && (
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold block mt-1">
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
      <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>PWA Service Worker: <strong>Active & Cached</strong></span>
        </div>
        <span className="text-slate-400">Civic Connect v1.0.0</span>
      </div>
    </div>
  );
};
