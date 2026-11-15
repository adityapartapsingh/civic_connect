import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Toast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  Wrench,
  Navigation,
  LogOut,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const OfficerLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { address, coords } = useGeolocation();
  const latitude = coords?.latitude;
  const longitude = coords?.longitude;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Toast Notification Layer */}
      <Toast />

      {/* Top Rugged Officer Header */}
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Officer Workstation Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase font-mono">
                  Field Squad Terminal
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ON-SITE DISPATCH
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {user?.ward_name || user?.ward_id || 'Ward 2 - Civil Lines'} · {user?.department || 'Field Operations'}
              </p>
            </div>
          </div>

          {/* Right: Officer Profile & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Field Officer'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {user?.designation || 'Junior Engineer'} · {user?.employee_id || 'SQUAD-OFFICER'}
              </span>
            </div>

            {/* GPS Telemetry Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300">
              <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>{latitude && longitude ? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` : 'GPS Tracking'}</span>
            </div>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                addToast({
                  type: 'info',
                  title: 'Squad Logged Off',
                  message: 'Field Officer workstation session ended safely.',
                });
                navigate('/login?portal=staff');
              }}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
              title="Sign Out of Workstation"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Log Off</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workstation Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Rugged Footer / Telemetry Bar */}
      <footer className="border-t border-zinc-800 bg-zinc-900/60 py-3 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <span>
            Civic Connect Field Dispatch Utility v2.4 • Municipal Engineering Division
          </span>
          <span className="text-zinc-400">
            Emergency Field Hotline: <strong>0181-2227001</strong> · Control Room
          </span>
        </div>
      </footer>
    </div>
  );
};
