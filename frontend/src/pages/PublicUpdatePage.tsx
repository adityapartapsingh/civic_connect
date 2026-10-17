import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Issue, StatusUpdatePayload } from '../types';
import { issuesApi } from '../services/api';
import { StatusUpdater } from '../components/dashboard/StatusUpdater';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { getSlaInfo } from '../utils/helpers';
import {
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const PublicUpdatePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchByToken = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const data = await issuesApi.getByToken(token);
        setIssue(data);
      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || 'Invalid or expired dispatch token.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchByToken();
  }, [token]);

  const handleUpdate = async (payload: StatusUpdatePayload) => {
    if (!token) return;
    const updated = await issuesApi.updateByToken(token, payload);
    setIssue(updated);
    setIsSuccess(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm">Validating field dispatch token...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="font-bold text-lg text-slate-900">Invalid Dispatch Token</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {error || 'This token has expired or is invalid. Please request a new dispatch SMS.'}
        </p>
        <Link to="/">
          <Button variant="primary" size="md">Return to Civic Connect</Button>
        </Link>
      </div>
    );
  }

  const sla = getSlaInfo(issue.sla_deadline, issue.status === 'resolved');

  return (
    <div className="max-w-xl mx-auto py-4 space-y-5">
      {/* Officer Security Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono font-medium tracking-wide text-slate-300">
            Field Officer Status Update
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Municipal Dispatch Update
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized via secure single-use token.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Status Successfully Updated!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The civic ticket <strong>{issue.tracking_id}</strong> has been updated in the municipal registry and reporting citizens have been notified.
          </p>

          <div className="pt-2">
            <Link to={`/tickets/${issue.id}`}>
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                View Public Ticket
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
          {/* Target Issue Summary Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                {issue.tracking_id}
              </span>
              <StatusBadge status={issue.status} size="sm" />
            </div>

            <h3 className="font-bold text-sm text-slate-900">{issue.title}</h3>
            <p className="text-xs text-slate-600 line-clamp-2">{issue.description}</p>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {issue.location.landmark || issue.location.ward}
              </span>
              <span className={`font-bold px-2 py-0.5 rounded ${sla.badgeColorClass}`}>
                {sla.formattedText}
              </span>
            </div>
          </div>

          {/* Issue Photo Thumbnail */}
          {issue.photo_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={issue.photo_url}
                alt="Citizen Reported Issue"
                className="w-full h-44 object-cover"
              />
              <div className="p-2 bg-slate-900 text-white text-[11px] text-center font-medium">
                Initial Citizen Evidence on Record
              </div>
            </div>
          )}

          {/* Direct Status Updater Form */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Submit Field Resolution</h4>
            <StatusUpdater issue={issue} onUpdate={handleUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};
