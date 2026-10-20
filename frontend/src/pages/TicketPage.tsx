import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { getSlaInfo, formatDateTime, formatRelativeDate } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import {
  Clock,
  MapPin,
  ThumbsUp,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Layers,
  ExternalLink,
  Edit,
  Sparkles,
} from 'lucide-react';

export const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { isOfficer, addPoints } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await issuesApi.getById(id);
        setTicket(data);
      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || 'Failed to load ticket.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const handleUpvote = async () => {
    if (!ticket) return;
    try {
      const result = await issuesApi.upvote(ticket.id);
      setTicket((prev) =>
        prev ? { ...prev, upvotes_count: result.upvotes_count, has_upvoted: result.has_upvoted } : null
      );
      if (result.has_upvoted) {
        addPoints(5, `Upvoted ticket ${ticket.tracking_id}`);
      }
    } catch {
      //
    }
  };

  const handleStatusUpdate = async (payload: StatusUpdatePayload) => {
    if (!ticket) return;
    const updated = await issuesApi.updateStatus(ticket.id, payload);
    setTicket(updated);
    setIsUpdateModalOpen(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'info',
        title: 'Link Copied',
        message: 'Direct ticket tracking URL copied to clipboard.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">
        <Clock className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm">Retrieving ticket details and evidence stack...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white rounded-lg p-8 border border-slate-300">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="font-bold text-lg text-slate-800">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {error || "The ticket you're looking for does not exist or has been removed."}
        </p>
        <Link to="/">
          <Button variant="primary" size="md">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
  const sla = getSlaInfo(ticket.sla_deadline, isResolved);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back & action navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            icon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>

          {isOfficer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUpdateModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Update Status & Proof
            </Button>
          )}
        </div>
      </div>

      {/* SLA Target Banner */}
      <div
        className={`rounded-lg p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isResolved
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : sla.isBreached
            ? 'bg-red-50 border-red-300 text-red-950'
            : sla.urgency === 'critical'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-slate-50 border-slate-300 text-slate-950'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isResolved
                ? 'bg-emerald-600 text-white'
                : sla.isBreached
                ? 'bg-red-700 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-medium tracking-wider opacity-75">
              Resolution Target
            </span>
            <h3 className="text-lg font-bold tracking-tight">{sla.formattedText}</h3>
          </div>
        </div>

        <div className="text-left sm:text-right text-sm">
          <p className="text-xs opacity-75">Deadline</p>
          <p className="font-semibold">{formatDateTime(ticket.sla_deadline)}</p>
        </div>
      </div>

      {/* Citizen Verification Call-to-Action (If marked resolved) */}
      {ticket.status === 'resolved' && !ticket.citizen_feedback && (
        <div className="bg-emerald-800 text-white p-5 rounded-lg border border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Municipal field crew marked this resolved</h4>
            <p className="text-sm text-emerald-100 mt-1">
              Inspect the resolution proof and verify on-site to complete resolution and earn +20 points.
            </p>
          </div>

          <Link to={`/tickets/${ticket.id}/confirm`}>
            <Button
              variant="primary"
              size="md"
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shrink-0 shadow-sm"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            >
              Verify Resolution Now
            </Button>
          </Link>
        </div>
      )}

      {/* Main Ticket Information Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-300 shadow-xs space-y-6">
        {/* Header meta */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 border border-slate-300 rounded">
              {ticket.tracking_id}
            </span>
            <StatusBadge status={ticket.status} size="md" />
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {ticket.priority} priority
            </span>
            <span className="text-sm text-slate-500 ml-auto">
              Filed {formatRelativeDate(ticket.created_at)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
            {ticket.title}
          </h1>

          <p className="text-base text-slate-700 mt-3 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Incident File Location metadata */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">
                {ticket.location.address || `GPS: ${ticket.location.latitude.toFixed(5)}, ${ticket.location.longitude.toFixed(5)}`}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {ticket.location.landmark ? `Landmark: ${ticket.location.landmark} · ` : ''}
                Record GPS: {ticket.location.latitude.toFixed(5)}, {ticket.location.longitude.toFixed(5)}
                {ticket.location.ward ? ` (${ticket.location.ward})` : ''}
              </p>
            </div>
          </div>

          <Link
            to="/map"
            className="text-brand-600 font-semibold hover:underline self-start sm:self-center shrink-0 text-sm"
          >
            Locate on City Map &rarr;
          </Link>
        </div>

        {/* Evidence Stack Gallery (Photos over time) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Verified Evidence Stack ({ticket.evidence.length} Record{ticket.evidence.length > 1 ? 's' : ''})
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Tamper-proof on-device capture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ticket.evidence.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-lg overflow-hidden border border-slate-300 flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {item.media_type === 'video' ? (
                    <video src={item.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || `Evidence stage ${item.stage}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded uppercase border border-white/20">
                    Stage {idx + 1}: {item.stage}
                  </span>
                </div>

                <div className="p-3 text-xs">
                  <p className="font-semibold text-slate-800">{item.caption || 'Live photo captured on-site'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recorded {formatDateTime(item.created_at)}
                    {item.uploaded_by && ` by ${item.uploaded_by}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Notes (If present) */}
        {ticket.resolution_notes && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-lg">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-1">
              Official Resolution Notes
            </h4>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              {ticket.resolution_notes}
            </p>
            {ticket.assigned_officer && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                Signed off by: {ticket.assigned_officer} ({ticket.assigned_department})
              </p>
            )}
          </div>
        )}

        {/* Upvote & Engagement Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant={ticket.has_upvoted ? 'primary' : 'outline'}
            size="md"
            onClick={handleUpvote}
            icon={<ThumbsUp className={`w-4 h-4 ${ticket.has_upvoted ? 'fill-white' : ''}`} />}
          >
            {ticket.has_upvoted ? 'Upvoted' : 'I See This Too (+5 pts)'} ({ticket.upvotes_count})
          </Button>

          {/* Quick link to Magic Officer Link (for demo testing convenience) */}
          {ticket.public_token && (
            <Link
              to={`/update/${ticket.public_token}`}
              className="text-xs font-bold text-slate-500 hover:text-brand-600 transition flex items-center gap-1"
            >
              <span>Magic Officer Link</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Officer Status Updater Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Status: ${ticket.tracking_id}`}
        description="Change municipal stage, attach proof, and notify citizens."
      >
        <StatusUpdater
          issue={ticket}
          onUpdate={handleStatusUpdate}
          onCancel={() => setIsUpdateModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
