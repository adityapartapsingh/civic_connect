import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { Issue, ReportFilterParams } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatDistanceString, getSlaInfo } from '../utils/helpers';
import { StatusBadge } from '../components/common/StatusBadge';
import { IssueMap } from '../components/map/IssueMap';
import { CardSkeleton } from '../components/common/LoadingSpinner';
import { FilterBar } from '../components/common/FilterBar';
import { issuesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  ThumbsUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  FileText,
  Map as MapIcon,
  SlidersHorizontal,
  Compass,
  ArrowDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const getScreenBatch = () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4);

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { coords, address, isLoading: geoLoading, refreshLocation } = useGeolocation();

  // Proximity scope: 'auto' (500m -> 2km -> city-wide) or specific distance
  const [proximityRadius, setProximityRadius] = useState<'auto' | 500 | 2000 | 5000 | 'all'>('auto');

  // Status Tab: 'all' | 'active' | 'resolved'
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');

  // Main View Tab: 'feed' | 'my_reports'
  const [activeTab, setActiveTab] = useState<'feed' | 'my_reports'>(() => {
    return searchParams.get('tab') === 'my_reports' ? 'my_reports' : 'feed';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Screen-fit progressive stream pagination (only loads what fits on screen)
  const [visibleCount, setVisibleCount] = useState<number>(getScreenBatch);
  const scrollSentinelRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        hasScrolledRef.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my_reports') {
      setActiveTab('my_reports');
    } else if (tabParam === 'feed') {
      setActiveTab('feed');
    }
  }, [searchParams]);

  // User-Controlled Filters Drawer
  const [filters, setFilters] = useState<ReportFilterParams>({
    status: 'all',
    priority: 'all',
    date_range: 'all',
    sort_by: 'newest',
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.date_range && filters.date_range !== 'all') count++;
    if (filters.sort_by && filters.sort_by !== 'newest') count++;
    return count;
  }, [filters]);

  // City-wide issues with immediate load and live distance ranking
  const { issues, isLoading, handleUpvote, refetch } = useNearbyReports(
    coords?.latitude,
    coords?.longitude
  );

  const { user, addPoints, deductPoints } = useAuthStore();
  const { addToast } = useToastStore();
  const [upvotingIds, setUpvotingIds] = useState<Record<string, boolean>>({});

  // User's own submitted reports
  const [myReports, setMyReports] = useState<Issue[]>([]);
  const [isFetchingMyReports, setIsFetchingMyReports] = useState(false);

  const isUserReport = useCallback((i: Issue) => {
    if (!user) return false;
    const matchesId = Boolean(
      i.reporter?.id && (
        i.reporter.id === user.id ||
        (user.user_id && i.reporter.id === user.user_id)
      )
    );
    const matchesPhone = Boolean(
      user.phone && (
        (i.reporter?.phone && i.reporter.phone === user.phone) ||
        (i.reporter?.phone_masked && user.phone.endsWith(i.reporter.phone_masked.slice(-4)))
      )
    );
    return matchesId || matchesPhone;
  }, [user]);

  const fetchMyReports = useCallback(async () => {
    if (!user) {
      setMyReports([]);
      return;
    }
    setIsFetchingMyReports(true);
    try {
      const reports = await issuesApi.getAll({
        reporter_id: user.user_id || user.id,
        reporter_phone: user.phone,
        my_reports: true,
      });
      setMyReports(reports);
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setIsFetchingMyReports(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user, fetchMyReports]);

  const handleFilterChange = (updated: Partial<ReportFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setVisibleCount(getScreenBatch());
  };

  // Metrics for the tab counts
  const activeCount = useMemo(() => {
    return issues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  }, [issues]);

  const resolvedCount = useMemo(() => {
    return issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  }, [issues]);

  const pendingConfirmationsCount = useMemo(() => {
    return issues.filter((i) => i.status === 'resolved' && !i.citizen_feedback).length;
  }, [issues]);

  const slaCompliance = useMemo(() => {
    if (issues.length === 0) return '100%';
    const nonBreached = issues.filter((i) => !i.sla_breached).length;
    return `${Math.round((nonBreached / issues.length) * 100)}%`;
  }, [issues]);

  // Filter & sort logic across the entire city dataset
  const processedIssues = useMemo(() => {
    let list: Issue[] = [];

    // 1. Tab Selector (Feed vs My Reports)
    if (activeTab === 'my_reports') {
      const map = new Map<string, Issue>();
      myReports.forEach((item) => map.set(item.id, item));
      issues.forEach((item) => {
        if (isUserReport(item)) map.set(item.id, item);
      });
      list = Array.from(map.values());
    } else {
      list = [...issues];
    }

    // 2. Status Filter Tab (All vs Active vs Resolved)
    if (statusTab === 'active') {
      list = list.filter((i) => i.status !== 'resolved' && i.status !== 'closed');
    } else if (statusTab === 'resolved') {
      list = list.filter((i) => i.status === 'resolved' || i.status === 'closed');
    }

    // 3. Status filter from Drawer if set
    if (filters.status && filters.status !== 'all') {
      list = list.filter((i) => i.status === filters.status);
    }

    // 4. Proximity Radius Scope
    if (proximityRadius !== 'auto' && proximityRadius !== 'all') {
      list = list.filter((i) => {
        const dist = (i as any).distanceMeters;
        return dist === undefined || dist <= proximityRadius;
      });
    }

    // 5. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((i) => i.category === selectedCategory);
    }

    // 6. Priority Filter
    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((i) => i.priority === filters.priority);
    }

    // 7. Date Range Filter
    if (filters.date_range && filters.date_range !== 'all') {
      const now = Date.now();
      const days = filters.date_range === 'today' ? 1 : filters.date_range === '7d' ? 7 : 30;
      const cutoff = now - days * 24 * 3600 * 1000;
      list = list.filter((i) => new Date(i.created_at).getTime() >= cutoff);
    }

    // 8. Sorting
    if (filters.sort_by === 'priority') {
      const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      list.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    } else if (filters.sort_by === 'sla') {
      list.sort((a, b) => new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime());
    } else if (filters.sort_by === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      // Default: Nearest first (Instagram-style proximity expansion), then newest
      list.sort((a, b) => {
        const distA = (a as any).distanceMeters ?? 999999;
        const distB = (b as any).distanceMeters ?? 999999;
        if (Math.abs(distA - distB) > 150) {
          return distA - distB;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return list;
  }, [issues, myReports, activeTab, statusTab, proximityRadius, selectedCategory, filters, isUserReport]);

  // Progressive slice: only loads what fits the screen and expands as user scrolls
  const displayedIssues = useMemo(() => {
    return processedIssues.slice(0, visibleCount);
  }, [processedIssues, visibleCount]);

  const hasMore = visibleCount < processedIssues.length;

  const handleLoadMore = () => {
    hasScrolledRef.current = true;
    setVisibleCount((prev) => Math.min(prev + getScreenBatch(), processedIssues.length));
  };

  // Viewport-aware scroll observer: only streams subsequent items when user actively scrolls down
  useEffect(() => {
    if (!hasMore) return;
    let timeoutId: any = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only trigger if user has actually scrolled and sentinel is near viewport
        if (entry.isIntersecting && hasScrolledRef.current) {
          if (timeoutId) return;
          timeoutId = setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + getScreenBatch(), processedIssues.length));
            timeoutId = null;
          }, 150);
        }
      },
      { rootMargin: '40px', threshold: 0.1 }
    );

    const currentSentinel = scrollSentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, processedIssues.length]);

  const onUpvoteClick = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in with your mobile number to endorse community issues.',
      });
      return;
    }

    if (upvotingIds[issueId]) return;

    const targetIssue = [...issues, ...myReports].find((i) => i.id === issueId);
    const isOwnReport = Boolean(targetIssue && isUserReport(targetIssue));

    if (isOwnReport) {
      addToast({
        type: 'error',
        title: 'Action Not Allowed',
        message: 'You cannot upvote your own civic report.',
      });
      return;
    }

    setUpvotingIds((prev) => ({ ...prev, [issueId]: true }));

    try {
      const result = await handleUpvote(issueId);
      if (result.has_upvoted) {
        addPoints(5, 'Upvoted local civic issue (+5 pts)');
        addToast({
          type: 'success',
          title: 'Upvote Registered',
          message: 'You endorsed this issue (+5 pts).',
        });
      } else {
        deductPoints(5, 'Removed upvote on civic issue');
        addToast({
          type: 'info',
          title: 'Upvote Removed',
          message: 'You removed your endorsement (-5 pts).',
        });
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      addToast({
        type: 'error',
        title: 'Cannot Upvote',
        message: errorObj.message || 'Could not register upvote.',
      });
    } finally {
      setUpvotingIds((prev) => ({ ...prev, [issueId]: false }));
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

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-2 sm:pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                Civic Issues &amp; Grievance Feed
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                LIVE CITY FEED
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 mt-1">
              Real-time municipal reports, repair progress, and citizen confirmations across all wards.
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-slate-200 font-mono text-[10px] sm:text-xs">
              {address ? address.split(',').slice(0, 2).join(',') : 'Jalandhar Municipal Zone'}
            </span>
          </div>
        </div>

        {/* Compact Single-Line Metric Strip on Mobile / 3-Column on Desktop */}
        <div className="pt-2 sm:pt-3">
          {/* Mobile Single-Line Strip */}
          <div className="sm:hidden flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span>SLA: <strong className="text-slate-900">{slaCompliance}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Reports: <strong className="text-slate-900">{issues.length}</strong> <span className="text-[10px] font-normal text-slate-500">({activeCount} act · {resolvedCount} res)</span></span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">Valid: <strong>{pendingConfirmationsCount}</strong></span>
          </div>

          {/* Desktop 3-Column Strip */}
          <div className="hidden sm:grid grid-cols-3 divide-x divide-slate-100 text-xs">
            <div className="pr-4 py-0">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">SLA Compliance</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{slaCompliance}</div>
              <span className="text-[11px] text-slate-500">Resolved under statutory 48h SLA</span>
            </div>

            <div className="px-4 py-0">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Total City Reports</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{issues.length} Issues</div>
              <span className="text-[11px] text-slate-500">{activeCount} in progress · {resolvedCount} resolved</span>
            </div>

            <div className="pl-4 py-0">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Citizen Validations</span>
              <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                {pendingConfirmationsCount} Pending
              </div>
              <span className="text-[11px] text-slate-500">Repairs awaiting on-site verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (All vs Active vs Resolved vs My Reports) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('feed');
              setStatusTab('all');
              setVisibleCount(getScreenBatch());
            }}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
              activeTab === 'feed' && statusTab === 'all'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Reports ({issues.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('feed');
              setStatusTab('active');
              setVisibleCount(getScreenBatch());
            }}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
              activeTab === 'feed' && statusTab === 'active'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Repairs ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('feed');
              setStatusTab('resolved');
              setVisibleCount(getScreenBatch());
            }}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed' && statusTab === 'resolved'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved ({resolvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('my_reports');
              setVisibleCount(getScreenBatch());
              fetchMyReports();
            }}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'my_reports'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Reports</span>
            {myReports.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                {myReports.length}
              </span>
            )}
            {pendingConfirmationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {pendingConfirmationsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 cursor-pointer ${
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
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 cursor-pointer ${
              showMap
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'City Map'}</span>
          </button>
        </div>
      </div>

      {/* Proximity Radius Selector (Auto Proximity vs Explicit Radius) */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-700" />
          <span>Proximity Scope:</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setProximityRadius('auto');
            setVisibleCount(getScreenBatch());
          }}
          className={`px-2.5 py-1 rounded-md transition font-medium border cursor-pointer ${
            proximityRadius === 'auto'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          📍 Nearest First (500m → City-Wide Stream)
        </button>
        <button
          type="button"
          onClick={() => {
            setProximityRadius(500);
            setVisibleCount(getScreenBatch());
          }}
          className={`px-2.5 py-1 rounded-md transition font-medium border cursor-pointer ${
            proximityRadius === 500
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Within 500m
        </button>
        <button
          type="button"
          onClick={() => {
            setProximityRadius(2000);
            setVisibleCount(getScreenBatch());
          }}
          className={`px-2.5 py-1 rounded-md transition font-medium border cursor-pointer ${
            proximityRadius === 2000
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Within 2 km
        </button>
        <button
          type="button"
          onClick={() => {
            setProximityRadius(5000);
            setVisibleCount(getScreenBatch());
          }}
          className={`px-2.5 py-1 rounded-md transition font-medium border cursor-pointer ${
            proximityRadius === 5000
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Within 5 km
        </button>
        <button
          type="button"
          onClick={() => {
            setProximityRadius('all');
            setVisibleCount(getScreenBatch());
          }}
          className={`px-2.5 py-1 rounded-md transition font-medium border cursor-pointer ${
            proximityRadius === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All City Wards
        </button>
      </div>

      {/* Optional Interactive Map View */}
      {showMap && (
        <div className="w-full h-72 sm:h-84 rounded-xl overflow-hidden border border-slate-200 shadow-xs mb-2">
          <IssueMap
            issues={processedIssues}
            userLocation={coords}
            center={coords ? [coords.latitude, coords.longitude] : [31.3260, 75.5762]}
            zoom={14}
          />
        </div>
      )}

      {/* Horizontal Scrollable Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            setVisibleCount(getScreenBatch());
          }}
          className={`shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition border whitespace-nowrap cursor-pointer ${
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
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              setVisibleCount(getScreenBatch());
            }}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition border whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Advanced Filters
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    status: 'all',
                    priority: 'all',
                    date_range: 'all',
                    sort_by: 'newest',
                  })
                }
                className="text-xs text-red-600 hover:text-red-700 font-semibold transition cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            showStatusFilter={true}
          />
        </div>
      )}

      {/* Active Filter Chips Strip */}
      {!showFilters && activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs bg-slate-100/70 p-2 rounded-md border border-slate-200">
          <span className="text-slate-500 font-medium">Filters active:</span>
          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
              Status: {filters.status}
              <button
                type="button"
                onClick={() => handleFilterChange({ status: 'all' })}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filters.priority && filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
              Priority: {filters.priority}
              <button
                type="button"
                onClick={() => handleFilterChange({ priority: 'all' })}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
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
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              setFilters({
                status: 'all',
                priority: 'all',
                date_range: 'all',
                sort_by: 'newest',
              })
            }
            className="text-xs text-slate-600 hover:text-red-600 underline font-semibold ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Progressive Feed List (Screen-Fit Viewport Flow) */}
      <div className="space-y-4">
        {/* Dynamic Screen Viewport Stream Counter */}
        {processedIssues.length > 0 && !isLoading && (
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-700">
                Visible on screen: <strong className="text-slate-900 font-bold">{displayedIssues.length}</strong> of {processedIssues.length} reports
              </span>
            </div>
            {hasMore ? (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <span>Scroll down to stream more</span>
                <span>↓</span>
              </span>
            ) : (
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>All matching reports in view</span>
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No civic reports match this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
              Expand your proximity scope or reset filters to view all issues across Jalandhar wards.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setStatusTab('all');
                setProximityRadius('auto');
                setFilters({ status: 'all', priority: 'all', date_range: 'all', sort_by: 'newest' });
              }}
              className="text-xs font-semibold px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
            >
              Show All City Reports
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedIssues.map((issue) => {
              const sla = getSlaInfo(issue.sla_deadline, issue.status === 'resolved' || issue.status === 'closed');
              const isResolvedAwaitingFeedback = issue.status === 'resolved' && !issue.citizen_feedback;

              return (
                <div
                  key={issue.id}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '240px' }}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors p-4 sm:p-5 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {/* Top Case Meta */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {issue.tracking_id}
                        </span>
                        <StatusBadge status={issue.status} size="sm" />
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          issue.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : issue.priority === 'high'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {issue.priority}
                        </span>
                      </div>

                      {/* SLA Countdown Badge */}
                      <div className="text-xs text-slate-500 font-mono font-medium">
                        {sla.formattedText}
                      </div>
                    </div>

                    {/* Content Card Body */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {issue.photo_url ? (
                        <img
                          src={issue.photo_url}
                          alt={issue.title}
                          loading="lazy"
                          decoding="async"
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                          <MapPin className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link to={`/tickets/${issue.id}`} className="hover:text-slate-900 transition-colors">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                            {issue.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    {/* Location & Proximity Distance String */}
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 font-mono">
                      {(issue as any).distanceMeters !== undefined && (
                        <>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {formatDistanceString((issue as any).distanceMeters)} away
                          </span>
                          <span className="text-slate-300">•</span>
                        </>
                      )}
                      <span className="truncate">{issue.location.address || issue.location.landmark || 'Incident Location'}</span>
                    </div>

                    {/* Citizen Resolution Confirmation Callout if marked resolved */}
                    {isResolvedAwaitingFeedback && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Field Squad Completed Repair</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mb-2.5">
                          Did this repair solve the civic hazard? Confirm on-site to award field officer points.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleConfirmResolution(e, issue.id)}
                            className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Fixed (+30 pts)</span>
                          </button>
                          <Link
                            to={`/tickets/${issue.id}/confirm`}
                            className="px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-900 hover:bg-emerald-100 font-semibold text-xs transition"
                          >
                            Inspect / Dispute
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {(() => {
                      const isOwn = Boolean(
                        user && (
                          (user.id && issue.reporter?.id === user.id) ||
                          (user.phone && issue.reporter?.phone_masked && user.phone.endsWith(issue.reporter.phone_masked.slice(-4)))
                        )
                      );
                      const isBusy = Boolean(upvotingIds[issue.id]);

                      return (
                        <button
                          type="button"
                          disabled={isOwn || isBusy}
                          onClick={(e) => onUpvoteClick(e, issue.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition border cursor-pointer ${
                            isOwn
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-80'
                              : issue.has_upvoted
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs hover:bg-slate-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={
                            isOwn
                              ? 'You cannot upvote your own report'
                              : issue.has_upvoted
                              ? 'Click to remove upvote (-5 pts)'
                              : 'Click to upvote (+5 pts)'
                          }
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${issue.has_upvoted ? 'fill-white text-white' : ''}`} />
                          <span>
                            {isOwn
                              ? `Your Report (${issue.upvotes_count})`
                              : isBusy
                              ? 'Updating...'
                              : issue.has_upvoted
                              ? `Upvoted (${issue.upvotes_count})`
                              : `${issue.upvotes_count} Upvotes`}
                          </span>
                        </button>
                      );
                    })()}

                    <Link
                      to={`/tickets/${issue.id}`}
                      className="font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 text-xs"
                    >
                      <span>Inspect Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sentinel element for infinite scroll observer */}
        <div ref={scrollSentinelRef} className="h-4" />

        {/* Load More Button (Screen-Fit Viewport Flow) */}
        {!isLoading && hasMore && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Load Next Screen Batch ({Math.min(getScreenBatch(), processedIssues.length - visibleCount)} More · {processedIssues.length - visibleCount} remaining)</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* End of Feed Marker */}
        {!isLoading && displayedIssues.length > 0 && !hasMore && (
          <div className="pt-6 pb-2 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You're completely caught up! Viewing all {processedIssues.length} reports across Jalandhar.</span>
          </div>
        )}
      </div>
    </div>
  );
};
