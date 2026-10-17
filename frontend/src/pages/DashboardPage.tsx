import React, { useState, useEffect } from 'react';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { TicketList } from '../components/dashboard/TicketList';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { Modal } from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Issue | null>(null);
  const [isUpdaterOpen, setIsUpdaterOpen] = useState(false);
  const { isOfficer, user, setRole } = useAuthStore();

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

  // Metrics
  const totalTickets = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const breachedCount = tickets.filter((t) => t.sla_breached && t.status !== 'resolved').length;
  const inFieldCount = tickets.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Municipal Operations Hub · BBMP South Zone
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Field Officer Dispatch Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time SLA monitoring and resolution verification for Ward 18 (Koramangala).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadTickets}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {!isOfficer && (
            <button
              onClick={() => setRole('officer')}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-sm"
            >
              Enable Officer Privileges
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Queue</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalTickets}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to local division</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{inFieldCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Crew deployed on-site</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">SLA Breaches</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">{breachedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires urgent escalation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Resolved Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {totalTickets > 0 ? `${Math.round((resolvedCount / totalTickets) * 100)}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target: 85% within 48h</p>
        </div>
      </div>

      {/* Ticket List Queue */}
      <TicketList
        tickets={tickets}
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
