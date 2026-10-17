import React, { useState } from 'react';
import { Issue, IssueStatus, StatusUpdatePayload } from '../../types';
import { STATUS_CONFIG } from '../../utils/constants';
import { Button } from '../common/Button';
import { Camera, Check, UploadCloud, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

interface StatusUpdaterProps {
  issue: Issue;
  onUpdate: (payload: StatusUpdatePayload) => Promise<void>;
  onCancel?: () => void;
}

export const StatusUpdater: React.FC<StatusUpdaterProps> = ({
  issue,
  onUpdate,
  onCancel,
}) => {
  const [status, setStatus] = useState<IssueStatus>(
    issue.status === 'reported' ? 'acknowledged' : issue.status === 'acknowledged' ? 'in_progress' : 'resolved'
  );
  const [notes, setNotes] = useState(issue.resolution_notes || '');
  const [photoUrl, setPhotoUrl] = useState<string>(issue.resolution_photo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  // Quick mock resolution photos for easy demonstration
  const sampleProofPhotos = [
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'resolved' && !notes.trim()) {
      addToast({
        type: 'error',
        title: 'Work Notes Required',
        message: 'Please add a brief description of the repair work done to mark as resolved.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate({
        status,
        notes,
        resolution_photo_data_url: photoUrl || undefined,
        assigned_officer: 'Field AE S. K. Murthy',
        assigned_department: issue.assigned_department || 'Ward Infrastructure Unit',
      });
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Ticket ${issue.tracking_id} successfully changed to ${STATUS_CONFIG[status].label}.`,
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: errorObj.message || 'Could not update ticket status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Target Status Select */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          New Municipal Status <span className="text-red-500">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as IssueStatus)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="acknowledged">Acknowledged (Field Team Assigned)</option>
          <option value="in_progress">In Progress (Maintenance Squad On-Site)</option>
          <option value="resolved">Resolved (Work Completed with Proof)</option>
          <option value="closed">Closed & Archived</option>
        </select>
        <p className="text-[11px] text-slate-500 mt-1">
          {STATUS_CONFIG[status]?.description}
        </p>
      </div>

      {/* Resolution Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          Action Taken / Resolution Summary {status === 'resolved' && <span className="text-red-500">*</span>}
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g., Deployed 2 tons cold asphalt mix. Leveled and tamped surface with roller."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
        />
      </div>

      {/* Photo proof selection / capture */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          Attach Resolution Photo Proof
        </label>

        {photoUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200">
            <img src={photoUrl} alt="Resolution Proof" className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-xs rounded-lg font-medium"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {sampleProofPhotos.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setPhotoUrl(url)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-brand-500 h-20"
                >
                  <img src={url} alt={`Proof ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-medium">
                    Select Proof #{i + 1}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Tap a verified field proof photo above to attach to this resolution.
            </p>
          </div>
        )}
      </div>

      {/* Officer Credential Confirmation */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Signed off by: <strong>Field Officer S. K. Murthy</strong> (BBMP South Zone)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          icon={<Check className="w-4 h-4" />}
        >
          Confirm & Publish Update
        </Button>
      </div>
    </form>
  );
};
