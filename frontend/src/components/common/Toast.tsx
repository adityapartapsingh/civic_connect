import React from 'react';
import { useToastStore, ToastItem } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (toast: ToastItem) => {
    switch (toast.type) {
      case 'points':
        return <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isPoints = toast.type === 'points';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-200 ${
              isPoints
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/10'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">{renderIcon(toast)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isPoints ? 'text-white' : 'text-slate-900'}`}>
                  {toast.title}
                </p>
                {toast.points && (
                  <span className="text-xs font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                    +{toast.points} PTS
                  </span>
                )}
              </div>
              {toast.message && (
                <p className={`text-xs mt-0.5 leading-relaxed ${isPoints ? 'text-amber-100' : 'text-slate-500'}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-lg transition-colors ${
                isPoints ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
