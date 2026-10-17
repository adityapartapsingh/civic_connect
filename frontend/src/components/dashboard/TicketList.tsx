import React, { useState } from 'react';
import { Issue, IssueStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getSlaInfo, formatRelativeDate } from '../../utils/helpers';
import { Button } from '../common/Button';
import {
  Clock,
  ThumbsUp,
  MapPin,
  AlertOctagon,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketListProps {
  tickets: Issue[];
  onSelectTicket?: (ticket: Issue) => void;
  selectedTicketId?: string;
  onOpenUpdater?: (ticket: Issue) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onSelectTicket,
  selectedTicketId,
  onOpenUpdater,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'sla_breached') {
      const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved');
      return sla.isBreached && t.status !== 'resolved' && t.status !== 'closed';
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Queue ({tickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('reported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'reported'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Pending New
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'in_progress'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            In Field
          </button>
          <button
            onClick={() => setStatusFilter('sla_breached')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
              statusFilter === 'sla_breached'
                ? 'bg-red-700 text-white shadow-sm ring-2 ring-red-400'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            SLA Breached
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredTickets.length} tickets
        </div>
      </div>

      {/* Ticket Cards List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-slate-700 text-sm">No tickets found in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              All municipal issues in this category are up to date.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
            const sla = getSlaInfo(ticket.sla_deadline, isResolved);
            const isSelected = selectedTicketId === ticket.id;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket)}
                className={`group bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-brand-600 ring-2 ring-brand-500/20 bg-brand-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ticket.tracking_id}
                    </span>
                    <StatusBadge status={ticket.status} size="sm" />
                    <span className="text-[11px] font-semibold text-slate-400">
                      • {formatRelativeDate(ticket.created_at)}
                    </span>
                  </div>

                  {/* SLA Countdown Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sla.badgeColorClass}`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{sla.formattedText}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  {ticket.photo_url && (
                    <img
                      src={ticket.photo_url}
                      alt={ticket.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {ticket.location.landmark || ticket.location.ward}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-brand-600">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {ticket.upvotes_count} upvotes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    Assigned: <span className="font-semibold text-slate-600">{ticket.assigned_department || 'Pending Assignment'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenUpdater && (
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUpdater(ticket);
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Inspect full ticket details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
