import React, { useState, useEffect, useMemo } from 'react';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { TicketList } from '../components/dashboard/TicketList';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { Modal } from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import { RefreshCw, ArrowRight, ShieldCheck, Wrench, Building2, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Issue | null>(null);
  const [isUpdaterOpen, setIsUpdaterOpen] = useState(false);
  const { isOfficer, user, setRole } = useAuthStore();

  // Task & Ward Scope: 'specialty' (assigned tasks in ward), 'ward' (all in ward), 'all' (all city)
  const [scope, setScope] = useState<'specialty' | 'ward' | 'all'>('specialty');

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await issuesApi.getAll();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load dashboard tickets', err);
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
    const updated = await issuesApi.updateStatus(selectedTicket.id, payload);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setIsUpdaterOpen(false);
  };

  // Scope Filtering based on Role Assigned by Ward Admin
  const officerWard = user?.ward_id;
  const officerTasks = user?.assigned_tasks || [];

  const specialtyTickets = useMemo(() => {
    if (officerTasks.length === 0) {
      return officerWard ? tickets.filter((t) => t.ward_id === officerWard || t.location?.ward === officerWard) : tickets;
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

  const displayedTickets = useMemo(() => {
    if (!isOfficer) return tickets;
    if (scope === 'specialty') return specialtyTickets;
    if (scope === 'ward') return wardTickets;
    return tickets;
  }, [scope, isOfficer, specialtyTickets, wardTickets, tickets]);

  // Operational Metrics
  const totalTickets = displayedTickets.length;
  const resolvedCount = displayedTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const breachedCount = displayedTickets.filter((t) => t.sla_breached && t.status !== 'resolved').length;
  const inFieldCount = displayedTickets.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged').length;

  return (
    <div className="space-y-5">
      {/* Ward Admin Redirect Banner (if user is Ward Admin) */}
      {user?.role === 'admin' && (
        <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-cyan-600 shrink-0" />
            <div>
              <span className="font-bold text-sm text-cyan-950 block">
                Ward Administrator Session Active ({user.name} · {user.ward_name || user.ward_id})
              </span>
              <p className="text-[11px] text-cyan-800 mt-0.5">
                You have sovereign authority assigned by the Super Admin to provision Field Officers and manage ward squads.
              </p>
            </div>
          </div>
          <Link
            to="/admin-portal"
            className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold transition whitespace-nowrap self-start sm:self-auto shadow-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Open Ward Admin Console →</span>
          </Link>
        </div>
      )}

      {/* Field Officer Specialty Assignment Banner (Assigned by Ward Admin) */}
      {isOfficer && (
        <div className="bg-white border-l-4 border-l-amber-600 border border-slate-300 p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Specialty Role Assigned by Ward Admin:
              </span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" />
                {user?.ward_name || user?.ward_id || 'Ward 2'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-600 font-medium">Assigned Tasks ({user?.created_by ? `Authorized by ${user.created_by}` : 'Municipal Squad'}):</span>
              {officerTasks.length > 0 ? (
                officerTasks.map((task) => (
                  <span key={task} className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                    {task.toUpperCase().replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                  GENERAL FIELD MAINTENANCE
                </span>
              )}
            </div>
          </div>

          {/* Performance & Rewards Stats */}
          <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-2.5 rounded border border-slate-300">
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Problems Resolved</span>
              <span className="text-base font-black text-slate-900">{user?.reports_resolved_count ?? 0}</span>
            </div>
            <div className="w-px h-8 bg-amber-200" />
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Officer Reward Tier</span>
              <span className="text-base font-black text-amber-700">{user?.badge || 'Bronze'} ({user?.points ?? 0} pts)</span>
            </div>
          </div>
        </div>
      )}

      {/* Officer Header (Administrative Human Styling) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-mono mb-1">
              Municipal Operations Hub • {user?.ward_name || user?.ward_id || 'Ward 2 - Civil Lines'}
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Field Officer Dispatch &amp; Work Queue
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Statutory SLA monitoring, crew assignments, and resolution audits.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadTickets}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {!isOfficer ? (
              <button
                onClick={() => setRole('officer')}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Switch to Officer Mode
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                {user?.employee_id && (
                  <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded">
                    {user.employee_id}
                  </span>
                )}
                <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                  {user?.designation ? `${user.designation} · ` : ''}{user?.department || 'Field Operations'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Task Scope Filter Selector (Specialty vs Ward vs All) */}
        {isOfficer && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1">Queue Scope:</span>

            <button
              type="button"
              onClick={() => setScope('specialty')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                scope === 'specialty'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>★ My Assigned Specialty Tasks</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${scope === 'specialty' ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-700'}`}>
                {specialtyTickets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScope('ward')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                scope === 'ward'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🏛️ All {user?.ward_id || 'Ward'} Issues</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${scope === 'ward' ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-700'}`}>
                {wardTickets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                scope === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All City Grievances</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${scope === 'all' ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-700'}`}>
                {tickets.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            {scope === 'specialty' ? 'Specialty Queue' : scope === 'ward' ? 'Ward Queue' : 'City Queue'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTickets}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to operational unit</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">In Field Crew</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{inFieldCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Maintenance teams on-site</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">SLA Breaches</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{breachedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Over statutory deadline</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Resolution Rate</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {totalTickets > 0 ? `${Math.round((resolvedCount / totalTickets) * 100)}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target: &gt;85% within 48h</p>
        </div>
      </div>

      {/* Officer Division & Ward Performance Strip */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Division:</span>
            <span className="text-white font-semibold">{user?.jurisdiction_zone || 'Central Zone (Ward 2)'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md font-mono">
            <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Ward Resolution Ranking:</span>
            <span className="text-emerald-400 font-semibold">Rank #1 in Velocity (129 Solved · 19.4h avg)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md font-mono">
            <span className="text-slate-400">Squad Rank:</span>
            <span className="text-amber-300 font-semibold">#2 in Division ({user?.reports_resolved_count ?? 12} Problems Resolved)</span>
          </div>
        </div>

        <Link
          to="/rewards"
          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0 group"
        >
          <span>View All Ward Rankings</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Ticket List Queue */}
      <TicketList
        tickets={displayedTickets}
        onOpenUpdater={handleOpenUpdater}
        onSelectTicket={(t) => setSelectedTicket(t)}
        selectedTicketId={selectedTicket?.id}
      />

      {/* Status Update Modal */}
      {selectedTicket && (
        <Modal
          isOpen={isUpdaterOpen}
          onClose={() => setIsUpdaterOpen(false)}
          title={`Officer Status Update: ${selectedTicket.tracking_id}`}
          description="Submit real-time field progress notes and attach completion photos."
        >
          <StatusUpdater
            issue={selectedTicket}
            onUpdate={handleStatusUpdate}
            onCancel={() => setIsUpdaterOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};
