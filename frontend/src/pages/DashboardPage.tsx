import React, { useState, useEffect, useMemo } from 'react';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { getSlaInfo, formatRelativeDate } from '../utils/helpers';
import {
  Wrench,
  Navigation,
  Camera,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Flame,
  ArrowRight,
  ExternalLink,
  Shield,
  Filter,
  X,
  Building2,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Issue | null>(null);
  const [isUpdaterOpen, setIsUpdaterOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'resolved' | 'breached'>('all');
  const [scope, setScope] = useState<'specialty' | 'ward'>('specialty');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const { isOfficer, user } = useAuthStore();
  const { addToast } = useToastStore();

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await issuesApi.getAll();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load work orders', err);
      addToast({
        type: 'error',
        title: 'Network Sync Error',
        message: 'Could not fetch latest municipal work orders.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenUpdater = (ticket: Issue) => {
    setSelectedTicket(ticket);
    setIsUpdaterOpen(true);
  };

  const handleStatusUpdate = async (payload: StatusUpdatePayload) => {
    if (!selectedTicket) return;
    try {
      const updated = await issuesApi.updateStatus(selectedTicket.id, payload);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setIsUpdaterOpen(false);
      addToast({
        type: 'success',
        title: 'Work Order Updated',
        message: `Order ${updated.tracking_id} updated to ${payload.status.toUpperCase()}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message || 'Could not update work order status.',
      });
    }
  };

  // Scope Filtering based on Officer's Assigned Ward & Tasks
  const officerWard = user?.ward_id;
  const officerTasks = user?.assigned_tasks || [];

  const specialtyTickets = useMemo(() => {
    if (officerTasks.length === 0) {
      return officerWard
        ? tickets.filter((t) => t.ward_id === officerWard || t.location?.ward === officerWard)
        : tickets;
    }
    return tickets.filter((t) => {
      const matchCat = officerTasks.includes(t.category);
      const matchWard = !officerWard || t.ward_id === officerWard || t.location?.ward === officerWard;
      return matchCat && matchWard;
    });
  }, [tickets, officerTasks, officerWard]);

  const wardTickets = useMemo(() => {
    if (!officerWard) return tickets;
    return tickets.filter((t) => t.ward_id === officerWard || t.location?.ward === officerWard);
  }, [tickets, officerWard]);

  const scopedTickets = useMemo(() => {
    if (scope === 'specialty' && officerTasks.length > 0) return specialtyTickets;
    return wardTickets.length > 0 ? wardTickets : tickets;
  }, [scope, officerTasks, specialtyTickets, wardTickets, tickets]);

  // Tab Filtering (All vs In Progress vs Completed vs Breached)
  const displayedOrders = useMemo(() => {
    switch (filterTab) {
      case 'in_progress':
        return scopedTickets.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged');
      case 'resolved':
        return scopedTickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
      case 'breached':
        return scopedTickets.filter((t) => {
          const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved' || t.status === 'closed');
          return (sla.isBreached || t.sla_breached) && t.status !== 'resolved' && t.status !== 'closed';
        });
      default:
        return scopedTickets;
    }
  }, [scopedTickets, filterTab]);

  // Operational Metrics
  const totalCount = scopedTickets.length;
  const inProgressCount = scopedTickets.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged').length;
  const resolvedCount = scopedTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const breachedCount = scopedTickets.filter((t) => {
    const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved' || t.status === 'closed');
    return (sla.isBreached || t.sla_breached) && t.status !== 'resolved' && t.status !== 'closed';
  }).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Officer Header & Deployment Context Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                {user?.employee_id || 'PB-MCJ-FIELD-SQUAD'}
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-500">
                {user?.ward_name || user?.ward_id || 'Ward 2 - Civil Lines Zone'}
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
              <span>Field Dispatch Queue</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500">
              Assigned Field Officer: <strong className="text-slate-800">{user?.name || 'On-Duty Officer'}</strong> · {user?.designation || 'Junior Engineer'} · {user?.department || 'Civil Infrastructure Cell'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadTickets}
              disabled={isLoading}
              className="p-1.5 sm:p-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
              title="Refresh Work Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-slate-900' : ''}`} />
            </button>

            {user?.role === 'admin' && (
              <Link
                to="/admin-portal"
                className="hidden sm:inline-flex px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md border border-slate-200 transition items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Ward Console</span>
              </Link>
            )}
          </div>
        </div>

        {/* Assigned Task Domain Tags (Desktop only / compact mobile) */}
        {officerTasks.length > 0 && (
          <div className="hidden sm:flex mt-4 pt-3 border-t border-slate-200 flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Assigned Squad Specialty:
              </span>
              {officerTasks.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold uppercase"
                >
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            {/* Scope Toggle Button */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setScope('specialty')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  scope === 'specialty'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ★ My Specialty ({specialtyTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('ward')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  scope === 'ward'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏛️ All Ward ({wardTickets.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Sleek Single-Line Tab Strip */}
      <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border squash-stretch min-h-[36px] flex items-center ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('in_progress')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border squash-stretch min-h-[36px] flex items-center ${
            filterTab === 'in_progress'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-blue-700 border-blue-200'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('resolved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border squash-stretch min-h-[36px] flex items-center ${
            filterTab === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-emerald-700 border-emerald-200'
          }`}
        >
          Completed ({resolvedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('breached')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border squash-stretch min-h-[36px] flex items-center ${
            filterTab === 'breached'
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white text-red-700 border-red-200'
          }`}
        >
          Breached ({breachedCount})
        </button>
      </div>

      {/* Desktop: Field KPI Counter Grid */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`p-4 rounded-xl border text-left transition ${
            filterTab === 'all'
              ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
            Total Work Orders
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">{totalCount}</div>
          <span className="text-xs text-slate-500">Active in queue</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('in_progress')}
          className={`p-4 rounded-xl border text-left transition ${
            filterTab === 'in_progress'
              ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 block flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            In Progress
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-800 font-mono mt-1">{inProgressCount}</div>
          <span className="text-xs text-slate-500">Squad on-site</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('resolved')}
          className={`p-4 rounded-xl border text-left transition ${
            filterTab === 'resolved'
              ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-1">{resolvedCount}</div>
          <span className="text-xs text-slate-500">Verified resolved</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('breached')}
          className={`p-4 rounded-xl border text-left transition ${
            filterTab === 'breached'
              ? 'bg-white border-red-600 shadow-sm ring-1 ring-red-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-red-700 block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            SLA Breached
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-800 font-mono mt-1">{breachedCount}</div>
          <span className="text-xs text-slate-500">Exceeded 48h limit</span>
        </button>
      </div>

      {/* Work Orders List Feed */}
      <div className="space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Orders in this Queue</h3>
            <p className="text-xs text-slate-500">
              All assigned municipal work orders for this filter have been addressed.
            </p>
          </div>
        ) : (
          displayedOrders.map((ticket) => {
            const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
            const sla = getSlaInfo(ticket.sla_deadline, isResolved);
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ticket.location.latitude},${ticket.location.longitude}`;

            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 anticipation-lift elevation-1 space-y-4"
              >
                {/* Order Top Bar: Tracking ID + Category + SLA Radar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-mono text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-slate-900 px-2.5 py-1 rounded transition-colors"
                      title="Inspect Report Case Details"
                    >
                      {ticket.tracking_id}
                    </Link>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-semibold border border-slate-200">
                      {ticket.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : ticket.priority === 'high'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ticket.priority} PRIORITY
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {formatRelativeDate(ticket.created_at)}
                    </span>
                  </div>

                  {/* SLA Radar Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-semibold border self-start sm:self-auto ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : sla.isBreached
                        ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sla.formattedText}</span>
                  </div>
                </div>

                {/* Order Content: Photo Thumbnail + Details */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {ticket.photo_url && (
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoPreview(ticket.photo_url || null)}
                      className="relative shrink-0 group rounded-lg overflow-hidden border border-slate-200"
                      title="Inspect Citizen Evidence"
                    >
                      <img
                        src={ticket.photo_url}
                        alt={ticket.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-[10px] font-bold text-white uppercase bg-slate-900/80 px-1.5 py-0.5 rounded">
                          Zoom
                        </span>
                      </div>
                    </button>
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="hover:text-blue-600 transition-colors inline-block"
                      title="Inspect Report Case Details"
                    >
                      <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 leading-snug">
                        {ticket.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ticket.description}
                    </p>

                    {/* Landmark & GPS */}
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span className="truncate max-w-sm">
                          {ticket.location.landmark || ticket.location.address || ticket.location.ward}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span>
                        GPS: {ticket.location.latitude.toFixed(4)}°N, {ticket.location.longitude.toFixed(4)}°E
                      </span>
                    </div>

                    {/* Existing Resolution / Materials Note */}
                    {ticket.materials_used && (
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                        <strong className="text-slate-900">Materials Used:</strong> {ticket.materials_used}
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">
                      Status:
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase border ${
                        ticket.status === 'resolved' || ticket.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Inspect Report Case Details Button */}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-2 shadow-xs squash-stretch min-h-[40px]"
                      title="Inspect Complete Report Details & Case History"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                      <span>Inspect Report</span>
                    </Link>

                    {/* Google Maps Turn-by-Turn Navigation Button (Fitts's Law + Squash/Stretch) */}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-2 shadow-xs squash-stretch min-h-[40px]"
                    >
                      <Navigation className="w-4 h-4 text-slate-600" />
                      <span>Navigate to Site</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    {/* Resolution & Status Update Button (Primary CTA) */}
                    <button
                      type="button"
                      onClick={() => handleOpenUpdater(ticket)}
                      className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs squash-stretch min-h-[40px]"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Update &amp; Resolution Proof</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Status Updater Modal (Clean Unified Modal with Arc Entrance) */}
      {isUpdaterOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-900 my-8 animate-arc-in">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-700" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    On-Site Resolution &amp; Status Station
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    Work Order: {selectedTicket.tracking_id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUpdaterOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <StatusUpdater
                issue={selectedTicket}
                onUpdate={handleStatusUpdate}
                onCancel={() => setIsUpdaterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhotoPreview}
              alt="Evidence zoom"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg border border-white/20 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
