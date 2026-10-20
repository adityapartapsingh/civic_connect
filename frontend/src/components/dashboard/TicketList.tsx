import React, { useState, useMemo } from 'react';
import { Issue, ReportFilterParams } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getSlaInfo, formatRelativeDate } from '../../utils/helpers';
import { FilterBar } from '../common/FilterBar';
import { Pagination } from '../common/Pagination';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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
  const [filters, setFilters] = useState<ReportFilterParams>({
    priority: 'all',
    date_range: 'all',
    sort_by: 'newest',
    page: 1,
    page_size: 6,
  });

  const handleFilterChange = (updated: Partial<ReportFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated, page: updated.page !== undefined ? updated.page : 1 }));
  };

  const processedTickets = useMemo(() => {
    let list = [...tickets];

    if (statusFilter === 'sla_breached') {
      list = list.filter((t) => {
        const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved' || t.status === 'closed');
        return sla.isBreached && t.status !== 'resolved' && t.status !== 'closed';
      });
    } else if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((t) => t.priority === filters.priority);
    }

    if (filters.date_range && filters.date_range !== 'all') {
      const now = Date.now();
      const days = filters.date_range === 'today' ? 1 : filters.date_range === '7d' ? 7 : 30;
      const cutoff = now - days * 24 * 3600 * 1000;
      list = list.filter((t) => new Date(t.created_at).getTime() >= cutoff);
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
  }, [tickets, statusFilter, filters]);

  const totalItems = processedTickets.length;
  const pageSize = filters.page_size || 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(filters.page || 1, totalPages);
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTickets.slice(start, start + pageSize);
  }, [processedTickets, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Officer Workflow Quick Status Tabs */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              handleFilterChange({ page: 1 });
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Dispatch ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('reported');
              handleFilterChange({ page: 1 });
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === 'reported'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('in_progress');
              handleFilterChange({ page: 1 });
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === 'in_progress'
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
            }`}
          >
            Field Crew Active
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('resolved');
              handleFilterChange({ page: 1 });
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === 'resolved'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Resolved
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('sla_breached');
              handleFilterChange({ page: 1 });
            }}
            className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap transition border ${
              statusFilter === 'sla_breached'
                ? 'bg-red-900 text-white border-red-900'
                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
            }`}
          >
            SLA Breached
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {processedTickets.length} cases
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        showStatusFilter={false}
      />

      {/* Case List */}
      <div className="space-y-3">
        {paginatedTickets.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-slate-200 text-center text-slate-500">
            <p className="font-bold text-slate-800 text-sm">No cases match this queue filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Select other priority or date filters to review open municipal tickets.
            </p>
          </div>
        ) : (
          paginatedTickets.map((ticket) => {
            const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
            const sla = getSlaInfo(ticket.sla_deadline, isResolved);
            const isSelected = selectedTicketId === ticket.id;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket)}
                className={`bg-white rounded-lg p-4 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.tracking_id}
                    </span>
                    <StatusBadge status={ticket.status} size="sm" />
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      ticket.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : ticket.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {formatRelativeDate(ticket.created_at)}
                    </span>
                  </div>

                  {/* SLA Indicator */}
                  <div className="font-mono text-xs font-semibold text-slate-700">
                    {sla.formattedText}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {ticket.photo_url && (
                    <img
                      src={ticket.photo_url}
                      alt={ticket.title}
                      className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="text-slate-700 truncate max-w-xs">
                        {ticket.location.landmark || ticket.location.ward}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">
                        {ticket.upvotes_count} community confirmations
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-500">
                    Dept: <span className="font-semibold text-slate-700">{ticket.assigned_department || 'General Administration'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenUpdater && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUpdater(ticket);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                      >
                        Update Status
                      </button>
                    )}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                      title="Inspect Case"
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

      {/* Pagination */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={totalItems}
        pageSize={pageSize}
        onPageChange={(p) => handleFilterChange({ page: p })}
        onPageSizeChange={(s) => handleFilterChange({ page_size: s, page: 1 })}
      />
    </div>
  );
};
