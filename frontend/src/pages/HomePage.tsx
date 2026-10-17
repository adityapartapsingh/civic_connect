import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { IssueCategory, IssueStatus } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatDistanceString, getSlaInfo } from '../utils/helpers';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { IssueMap } from '../components/map/IssueMap';
import { CardSkeleton } from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ThumbsUp,
  Camera,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Award,
  Navigation,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const HomePage: React.FC = () => {
  const { coords, ward, accuracy, isLoading: geoLoading, refreshLocation } = useGeolocation();
  const [radiusMeters, setRadiusMeters] = useState<number>(500);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mapPreviewExpanded, setMapPreviewExpanded] = useState<boolean>(false);

  const { issues, isLoading, handleUpvote, refetch } = useNearbyReports(
    coords?.latitude,
    coords?.longitude,
    radiusMeters
  );

  const { user, addPoints } = useAuthStore();

  const filteredIssues = issues.filter((i) => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const onUpvoteClick = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await handleUpvote(issueId);
      addPoints(5, 'Upvoted local civic issue (+5 pts)');
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct Report Card */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 border border-slate-800">
        <div className="max-w-xl">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Report Local Civic Hazards
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Submit potholes, garbage, or broken streetlights with camera capture. Track official resolution timelines and municipal follow-up directly.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/report">
              <Button
                variant="primary"
                size="md"
                icon={<Camera className="w-4 h-4 text-white" />}
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium"
              >
                Report New Hazard (+20 pts)
              </Button>
            </Link>

            <Link to="/map">
              <Button
                variant="outline"
                size="md"
                className="bg-transparent text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                View City Map
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hyperlocal Radar Bar: Ward & Radius controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">
                Issues within {formatDistanceString(radiusMeters)}
              </h3>
              <button
                onClick={refreshLocation}
                className="text-slate-400 hover:text-brand-600 transition"
                title="Refresh GPS"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {geoLoading ? 'Acquiring GPS...' : `${ward || 'Koramangala Ward 18'} · Accuracy ±${accuracy || 10}m`}
            </p>
          </div>
        </div>

        {/* Radius selector buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-100 p-1 rounded-xl">
          {[250, 500, 1000].map((dist) => (
            <button
              key={dist}
              onClick={() => setRadiusMeters(dist)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                radiusMeters === dist
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dist === 1000 ? '1 km' : `${dist}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Map Preview Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Hyperlocal Map View</h2>
          <button
            onClick={() => setMapPreviewExpanded(!mapPreviewExpanded)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {mapPreviewExpanded ? 'Minimize Map' : 'Expand Map'}
          </button>
        </div>

        <div className={`transition-all duration-300 ${mapPreviewExpanded ? 'h-96' : 'h-52'}`}>
          <IssueMap
            issues={filteredIssues}
            userLocation={coords}
            center={coords ? [coords.latitude, coords.longitude] : undefined}
            zoom={15}
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Issues ({issues.length})
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Issues Feed List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Nearby Community Reports ({filteredIssues.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">Sorted by distance</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No active issues within {radiusMeters}m</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Your street appears clear! If you notice an unaddressed pothole, leaking pipe, or dark streetlight, be the first to report it.
            </p>
            <Link to="/report">
              <Button variant="primary" size="md" icon={<Camera className="w-4 h-4" />}>
                Report First Issue (+20 pts)
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map((issue) => {
              const sla = getSlaInfo(issue.sla_deadline, issue.status === 'resolved');

              return (
                <Link
                  key={issue.id}
                  to={`/tickets/${issue.id}`}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/50 shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Meta info */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={issue.status} size="sm" />
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {issue.tracking_id}
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${sla.badgeColorClass}`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{sla.formattedText}</span>
                      </div>
                    </div>

                    {/* Image & Title */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {issue.photo_url ? (
                        <img
                          src={issue.photo_url}
                          alt={issue.title}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0 group-hover:scale-102 transition-transform"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <MapPin className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                          {issue.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-brand-700">
                        {formatDistanceString(issue.distanceMeters)} away
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="truncate">{issue.location.landmark || issue.location.ward}</span>
                    </div>
                  </div>

                  {/* Card Footer: Upvote action */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => onUpvoteClick(e, issue.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        issue.has_upvoted
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${issue.has_upvoted ? 'fill-brand-600 text-brand-600' : ''}`} />
                      <span>{issue.upvotes_count} Upvotes</span>
                    </button>

                    <span className="text-xs font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
