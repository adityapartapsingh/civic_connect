import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PointsBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user } = useAuthStore();

  if (!user) return null;

  if (compact) {
    return (
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-xs font-bold">{user.points} pts</span>
      </Link>
    );
  }

  return (
    <Link
      to="/profile"
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors"
    >
      <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
        <Award className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold leading-none">{user.points} PTS</span>
          <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-semibold">
            Lvl {user.level}
          </span>
        </div>
        <span className="text-[10px] text-amber-100">Civic Rank</span>
      </div>
    </Link>
  );
};
