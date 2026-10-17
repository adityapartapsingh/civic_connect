import React from 'react';
import { NearbyIssueItem } from '../../hooks/useNearbyReports';
import { formatDistanceString } from '../../utils/helpers';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { ThumbsUp, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NearbyCheckProps {
  nearbyIssues: NearbyIssueItem[];
  onConfirmDuplicate: (issueId: string) => void;
  onProceedAnyway: () => void;
  isUpvoting?: boolean;
}

export const NearbyCheck: React.FC<NearbyCheckProps> = ({
  nearbyIssues,
  onConfirmDuplicate,
  onProceedAnyway,
  isUpvoting = false,
}) => {
  const { addPoints } = useAuthStore();

  const handleUpvoteDuplicate = (issueId: string) => {
    addPoints(5, 'Upvoted existing civic report (+5 pts)');
    onConfirmDuplicate(issueId);
  };

  if (nearbyIssues.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-950">
            Duplicate Check: {nearbyIssues.length} nearby report{nearbyIssues.length > 1 ? 's' : ''} found!
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            Avoid duplicate tickets! Upvoting an existing report boosts its municipal priority SLA and earns you <strong>+5 Civic Points</strong>.
          </p>
        </div>
      </div>

      {/* List of nearby open issues */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {nearbyIssues.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-3 border border-amber-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              {item.photo_url ? (
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-100 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="text-[11px] font-bold text-brand-600">
                    {formatDistanceString(item.distanceMeters)} away
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 truncate mt-1">{item.title}</h5>
                <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isUpvoting}
              onClick={() => handleUpvoteDuplicate(item.id)}
              icon={<ThumbsUp className="w-3.5 h-3.5" />}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
            >
              I See This Too (+5 pts)
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
        <span className="text-xs text-amber-900 font-medium">None of these match your report?</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onProceedAnyway}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          className="bg-white hover:bg-amber-100 text-amber-950 border border-amber-300"
        >
          No, Submit New Issue
        </Button>
      </div>
    </div>
  );
};
