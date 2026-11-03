import React from 'react';
import { useToastStore, ToastItem } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Award, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (toast: ToastItem) => {
    switch (toast.type) {
      case 'points':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isPoints = toast.type === 'points';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded border transition-none ${
              isPoints
                ? 'bg-slate-900 text-white border-slate-950 shadow-md'
                : 'bg-white text-slate-900 border-slate-300 shadow-sm'
            }`}
          >
            <div className="mt-0.5 shrink-0">{renderIcon(toast)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${isPoints ? 'text-white' : 'text-slate-900'}`}>
                  {toast.title}
                </p>
                {toast.points && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    +{toast.points} PTS
                  </span>
                )}
              </div>
              {toast.message && (
                <p className={`text-xs mt-1 leading-snug ${isPoints ? 'text-slate-300' : 'text-slate-600'}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded transition-colors ${
                isPoints ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'
              }`}
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
