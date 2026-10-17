import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Issue } from '../types';
import { issuesApi } from '../services/api';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ConfirmResolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [verificationDone, setVerificationDone] = useState<'confirmed' | 'disputed' | null>(null);

  const { addPoints } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await issuesApi.getById(id);
        setTicket(data);
      } catch (err) {
        console.error('Failed to load issue', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleConfirmFixed = async () => {
    if (!ticket) return;
    setIsSubmitting(true);
    try {
      await issuesApi.confirmResolution(ticket.id, { feedback: 'confirmed' });

      // Reward citizen +20 points!
      addPoints(20, 'Verified on-site resolution (+20 pts)');

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#059669', '#38bdf8', '#fbbf24'],
      });

      setVerificationDone('confirmed');
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not submit confirmation. Please retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (!disputeReason.trim()) {
      addToast({
        type: 'error',
        title: 'Reason Required',
        message: 'Please tell the municipal supervisor why this is not adequately resolved.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await issuesApi.confirmResolution(ticket.id, {
        feedback: 'disputed',
        dispute_reason: disputeReason,
      });

      addToast({
        type: 'warning',
        title: 'Issue Disputed',
        message: 'Your dispute has been logged and escalated to the Ward Inspector.',
      });

      setVerificationDone('disputed');
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not log dispute.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm">Loading resolution inspection...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-slate-500">Ticket not found.</p>
        <Link to="/">
          <Button variant="primary" size="sm" className="mt-4">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2 space-y-5">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Ticket Details</span>
      </button>

      {/* Header Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-5 sm:p-6 border border-emerald-900">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-xs font-bold mb-2 text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Citizen Resolution Audit</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Verify Civic Fix on the Ground
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg leading-relaxed">
          Help close the municipal feedback loop. Confirm if the reported issue has been properly resolved by municipal crews.
        </p>
      </div>

      {verificationDone === 'confirmed' ? (
        /* Confirmed Success State */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>+20 Civic Points Added to Your Profile!</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900">Resolution Confirmed!</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Thank you for verifying this fix on-site. Your community score and ward ranking have been updated!
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Updated Ticket
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
            >
              Back to Home Feed
            </Button>
          </div>
        </div>
      ) : verificationDone === 'disputed' ? (
        /* Disputed State */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">Dispute Escalated to Ward Supervisor</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            The status has been set to <strong>Disputed</strong> and flagged for inspection review. The field contractor will be held accountable.
          </p>

          <div className="pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              View Disputed Ticket
            </Button>
          </div>
        </div>
      ) : (
        /* Active Inspection Mode */
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          {/* Ticket Reference */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-slate-400">{ticket.tracking_id}</span>
              <h3 className="font-bold text-base text-slate-900 mt-0.5">{ticket.title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {ticket.location.address || ticket.location.ward}
              </p>
            </div>
            <StatusBadge status={ticket.status} size="md" />
          </div>

          {/* Before & After Visual Comparison Gallery */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Photo Evidence Comparison (Before vs After)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="relative aspect-video bg-black">
                  <img
                    src={ticket.photo_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                    alt="Before: Citizen Report"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                    Before: Citizen Report
                  </span>
                </div>
                <div className="p-3 text-xs text-slate-500">
                  Initial hazard reported by citizen
                </div>
              </div>

              {/* After Photo (Resolution) */}
              <div className="rounded-2xl overflow-hidden border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between">
                <div className="relative aspect-video bg-black">
                  <img
                    src={ticket.resolution_photo || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
                    alt="After: Officer Resolution Proof"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                    After: Crew Resolution Proof
                  </span>
                </div>
                <div className="p-3 text-xs text-emerald-900 font-medium">
                  {ticket.resolution_notes || 'Field repair completed by municipal maintenance team.'}
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Input Section (if user clicked Dispute) */}
          {isDisputeOpen ? (
            <form onSubmit={handleDispute} className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-orange-950 uppercase tracking-wide">
                Contest / Dispute Reason
              </h4>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain what is still broken (e.g., Streetlight turns off after 5 minutes, or pothole repair was incomplete)."
                className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisputeOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  loading={isSubmitting}
                >
                  Submit Official Dispute
                </Button>
              </div>
            </form>
          ) : (
            /* Action Buttons */
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <Button
                type="button"
                variant="success"
                size="lg"
                loading={isSubmitting}
                onClick={handleConfirmFixed}
                icon={<CheckCircle2 className="w-5 h-5 text-white" />}
                className="w-full sm:flex-1 shadow-lg shadow-emerald-500/20"
              >
                Yes, Fixed! (+20 pts)
              </Button>

              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => setIsDisputeOpen(true)}
                icon={<XCircle className="w-5 h-5 text-white" />}
                className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700 shadow-orange-500/20"
              >
                No, Still Broken (Dispute)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
