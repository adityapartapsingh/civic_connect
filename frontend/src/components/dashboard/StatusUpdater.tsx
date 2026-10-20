import React, { useState } from 'react';
import { Issue, IssueStatus, StatusUpdatePayload } from '../../types';
import { STATUS_CONFIG } from '../../utils/constants';
import { Button } from '../common/Button';
import { Camera, Check, UploadCloud, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

import { useAuthStore } from '../../store/authStore';

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
  const { user } = useAuthStore();
  const [status, setStatus] = useState<IssueStatus>(
    issue.status === 'reported' ? 'acknowledged' : issue.status === 'acknowledged' ? 'in_progress' : 'resolved'
  );
  const [notes, setNotes] = useState(issue.resolution_notes || '');
  const [photoUrl, setPhotoUrl] = useState<string>(issue.resolution_photo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick proof photos for convenient verification
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
      const officerTitle = user
        ? `${user.name}${user.designation ? ` (${user.designation})` : ''}`
        : 'Field Officer';
      const officerDept = user?.department || issue.assigned_department || 'Municipal Division';

      await onUpdate({
        status,
        notes,
        resolution_photo_data_url: photoUrl || undefined,
        assigned_officer: officerTitle,
        assigned_department: officerDept,
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
          className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
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
          className="w-full px-3 py-2 rounded border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Photo proof selection / capture */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          Attach Resolution Photo Proof
        </label>

        {photoUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-300">
            <img src={photoUrl} alt="Resolution Proof" className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="absolute top-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black text-white text-xs rounded font-medium"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 hover:border-slate-800 rounded bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>Upload Camera Proof Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">Or select standard municipal field proof:</div>
            <div className="grid grid-cols-3 gap-2">
              {sampleProofPhotos.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setPhotoUrl(url)}
                  className="group relative rounded overflow-hidden border border-slate-300 hover:border-slate-900 h-20"
                >
                  <img src={url} alt={`Proof ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[10px] py-0.5 text-center font-medium">
                    Proof #{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Officer Credential Confirmation */}
      <div className="p-3 bg-slate-50 rounded border border-slate-300 flex items-center gap-2.5 text-xs text-slate-600">
        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div>
          <span>
            Signed off by: <strong>{user?.name || 'Field Inspector'}</strong>
            {user?.designation ? ` (${user.designation})` : ''}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Unit: {user?.department || issue.assigned_department || 'Municipal Division'}
            {user?.employee_id ? ` · Badge: ${user.employee_id}` : ''}
          </p>
        </div>
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
