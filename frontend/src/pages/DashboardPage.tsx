import React, { useState, useEffect } from 'react';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { TicketList } from '../components/dashboard/TicketList';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { Modal } from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import { RefreshCw } from 'lucide-react';

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

  // Operational Metrics
  const totalTickets = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const breachedCount = tickets.filter((t) => t.sla_breached && t.status !== 'resolved').length;
  const inFieldCount = tickets.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged').length;

  return (
    <div className="space-y-5">
      {/* Officer Header (Administrative Human Styling) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-mono mb-1">
              Municipal Operations Hub • Phillaur Division
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
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Active Queue</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTickets}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to municipal unit</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-500">In Field Crew</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{inFieldCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Maintenance teams on-site</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-500">SLA Breaches</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{breachedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Over statutory deadline</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Resolution Rate</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {totalTickets > 0 ? `${Math.round((resolvedCount / totalTickets) * 100)}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target: &gt;85% within 48h</p>
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
