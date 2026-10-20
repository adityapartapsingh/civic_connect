import React, { useState, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { Issue, ReportFilterParams } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatDistanceString, getSlaInfo } from '../utils/helpers';
import { StatusBadge } from '../components/common/StatusBadge';
import { IssueMap } from '../components/map/IssueMap';
import { CardSkeleton } from '../components/common/LoadingSpinner';
import { FilterBar } from '../components/common/FilterBar';
import { Pagination } from '../components/common/Pagination';
import { issuesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ThumbsUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  FileText,
  Map,
  SlidersHorizontal,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { coords, address, accuracy, isLoading: geoLoading, refreshLocation } = useGeolocation();
  const [radiusMeters, setRadiusMeters] = useState<number>(500);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'my_reports'>('feed');

  // User-Controlled Priority & Date Filters
  const [filters, setFilters] = useState<ReportFilterParams>({
    priority: 'all',
    date_range: 'all',
    sort_by: 'newest',
    page: 1,
    page_size: 6,
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.date_range && filters.date_range !== 'all') count++;
    if (filters.sort_by && filters.sort_by !== 'newest') count++;
    return count;
  }, [filters]);

  const { issues, isLoading, handleUpvote, refetch } = useNearbyReports(
    coords?.latitude,
    coords?.longitude,
    radiusMeters
  );

  const { user, addPoints } = useAuthStore();
  const { addToast } = useToastStore();

  const handleFilterChange = (updated: Partial<ReportFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated, page: updated.page !== undefined ? updated.page : 1 }));
  };

  // Filter & sort logic
  const processedIssues = useMemo(() => {
    let list = [...issues];

    if (activeTab === 'my_reports') {
      list = list.filter((i) => i.reporter?.id === user?.id || i.status === 'resolved');
    }

    if (selectedCategory !== 'all') {
      list = list.filter((i) => i.category === selectedCategory);
    }

    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((i) => i.priority === filters.priority);
    }

    if (filters.date_range && filters.date_range !== 'all') {
      const now = Date.now();
      const days = filters.date_range === 'today' ? 1 : filters.date_range === '7d' ? 7 : 30;
      const cutoff = now - days * 24 * 3600 * 1000;
      list = list.filter((i) => new Date(i.created_at).getTime() >= cutoff);
    }

    if (filters.sort_by === 'priority') {
      const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      list.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    } else if (filters.sort_by === 'sla') {
      list.sort((a, b) => new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime());
    } else if (filters.sort_by === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [issues, activeTab, selectedCategory, filters, user?.id]);

  // Pagination calculation
  const totalItems = processedIssues.length;
  const pageSize = filters.page_size || 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(filters.page || 1, totalPages);
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedIssues.slice(start, start + pageSize);
  }, [processedIssues, currentPage, pageSize]);

  const onUpvoteClick = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in with your mobile number to endorse or upvote community issues.',
      });
      return;
    }
    try {
      await handleUpvote(issueId);
      addPoints(5, 'Upvoted local civic issue (+5 pts)');
    } catch {
      // Handled
    }
  };

  const handleConfirmResolution = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to verify on-site resolution and award officer points.',
      });
      return;
    }
    try {
      await issuesApi.confirmResolution(issueId, { feedback: 'confirmed' });
      addPoints(30, 'Verified resolution on-site (+30 pts)');
      addToast({
        type: 'success',
        title: 'Resolution Confirmed',
        message: 'Thank you for verifying! Your civic confirmation has been recorded.',
      });
      refetch();
    } catch {
      addToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: 'Unable to register confirmation. Please try again.',
      });
    }
  };

  const pendingConfirmationsCount = issues.filter(
    (i) => i.status === 'resolved' && !i.citizen_feedback
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Civic Issues & Grievance Feed
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Active community reports and repair statuses in your area
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
              {address ? address.split(',').slice(0, 2).join(',') : 'Current Location'}
            </span>
          </div>
        </div>

        {/* 3-Column Performance Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 pt-4 text-sm">
          <div className="sm:pr-4 py-2 sm:py-0">
            <span className="text-slate-500 font-medium">SLA Compliance</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">94.2%</div>
            <span className="text-xs text-slate-500">Resolved under 48 hours</span>
          </div>

          <div className="sm:px-4 py-2 sm:py-0">
            <span className="text-slate-500 font-medium">Active Issues</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{issues.length} Reported</div>
            <span className="text-xs text-slate-500">Within {formatDistanceString(radiusMeters)} radius</span>
          </div>

          <div className="sm:pl-4 py-2 sm:py-0">
            <span className="text-slate-500 font-medium">Pending Citizen Review</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">
              {pendingConfirmationsCount}
            </div>
            <span className="text-xs text-slate-500">Repairs waiting confirmation</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & View Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('feed');
              handleFilterChange({ page: 1 });
            }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'feed'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Reports ({issues.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('my_reports');
              handleFilterChange({ page: 1 });
            }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'my_reports'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Reports</span>
            {pendingConfirmationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {pendingConfirmationsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 pb-2">
          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 ${
              showFilters || activeFiltersCount > 0
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle priority and date filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                showFilters || activeFiltersCount > 0 ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Map Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 ${
              showMap
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Map'}</span>
          </button>
        </div>
      </div>

      {/* Optional Map View */}
      {showMap && (
        <div className="w-full h-72 sm:h-80 rounded-lg overflow-hidden border border-slate-300 shadow-xs mb-2">
          <IssueMap
            issues={processedIssues}
            userLocation={coords}
            center={coords ? [coords.latitude, coords.longitude] : undefined}
            zoom={15}
          />
        </div>
      )}

      {/* Horizontal Scrollable Category Bar (Single Clean Row) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            handleFilterChange({ page: 1 });
          }}
          className={`shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition border whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          All
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              handleFilterChange({ page: 1 });
            }}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition border whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {showFilters && (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Advanced Filters
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: 'all',
                    date_range: 'all',
                    sort_by: 'newest',
                    page: 1,
                  }))
                }
                className="text-xs text-red-600 hover:text-red-700 font-semibold transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            showStatusFilter={false}
          />
        </div>
      )}

      {/* Active Filter Chips Strip (Shown only when drawer is closed to indicate active filters) */}
      {!showFilters && activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs bg-slate-100/70 p-2 rounded-md border border-slate-200">
          <span className="text-slate-500 font-medium">Filters active:</span>
          {filters.priority && filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
              Priority: {filters.priority}
              <button
                type="button"
                onClick={() => handleFilterChange({ priority: 'all' })}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                aria-label="Remove priority filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.date_range && filters.date_range !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
              Date: {filters.date_range}
              <button
                type="button"
                onClick={() => handleFilterChange({ date_range: 'all' })}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                aria-label="Remove date filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.sort_by && filters.sort_by !== 'newest' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
              Sort: {filters.sort_by}
              <button
                type="button"
                onClick={() => handleFilterChange({ sort_by: 'newest' })}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                aria-label="Remove sort filter"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                priority: 'all',
                date_range: 'all',
                sort_by: 'newest',
                page: 1,
              }))
            }
            className="text-xs text-slate-600 hover:text-red-600 underline font-semibold ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Incident List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : paginatedIssues.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-slate-200 text-center">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No records match the current filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
              Adjust priority, date range, or category filter to inspect other civic reports.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setFilters({ priority: 'all', date_range: 'all', sort_by: 'newest', page: 1, page_size: 6 });
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedIssues.map((issue) => {
              const sla = getSlaInfo(issue.sla_deadline, issue.status === 'resolved');
              const isResolvedAwaitingFeedback = issue.status === 'resolved' && !issue.citizen_feedback;

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Case Header */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {issue.tracking_id}
                        </span>
                        <StatusBadge status={issue.status} size="sm" />
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                          issue.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : issue.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {issue.priority}
                        </span>
                      </div>

                      {/* SLA Indicator */}
                      <div className="text-xs text-slate-600 font-medium">
                        {sla.formattedText}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {issue.photo_url ? (
                        <img
                          src={issue.photo_url}
                          alt={issue.title}
                          className="w-20 h-20 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <MapPin className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link to={`/tickets/${issue.id}`} className="hover:text-slate-900 transition-colors">
                          <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                            {issue.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-500 mb-3">
                      <span className="font-medium text-slate-700">
                        {formatDistanceString(issue.distanceMeters)} away
                      </span>
                      <span className="text-slate-300 mx-1.5">•</span>
                      <span>{issue.location.address || issue.location.landmark || 'Incident Location'}</span>
                    </div>

                    {/* Citizen Resolution Confirmation Box */}
                    {isResolvedAwaitingFeedback && (
                      <div className="mt-3 p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-sm">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Field Crew Marked Resolved</span>
                        </div>
                        <p className="text-xs text-emerald-800 mb-3">
                          Did this repair solve the hazard? Verify on-site to complete resolution.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleConfirmResolution(e, issue.id)}
                            className="px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Fixed (+30 pts)</span>
                          </button>
                          <Link
                            to={`/tickets/${issue.id}/confirm`}
                            className="px-3 py-1.5 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100 font-medium text-xs transition"
                          >
                            Inspect / Dispute
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={(e) => onUpvoteClick(e, issue.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                        issue.has_upvoted
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${issue.has_upvoted ? 'fill-slate-900 text-slate-900' : ''}`} />
                      <span>{issue.upvotes_count} Upvotes</span>
                    </button>

                    <Link
                      to={`/tickets/${issue.id}`}
                      className="font-semibold text-slate-900 hover:text-brand-600 flex items-center gap-1"
                    >
                      Inspect Case <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination */}
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => handleFilterChange({ page: p })}
          onPageSizeChange={(s) => handleFilterChange({ page_size: s, page: 1 })}
          className="mt-3"
        />
      </div>
    </div>
  );
};
