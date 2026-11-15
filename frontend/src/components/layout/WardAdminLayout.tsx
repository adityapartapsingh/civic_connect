import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Toast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import {
  Building2,
  Clock,
  Shield,
  Users,
  LogOut,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const WardAdminLayout: React.FC = () => {
  const { user, isSuperAdmin, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-slate-950">
      {/* Toast Notification Layer */}
      <Toast />

      {/* Top Zonal Command Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Ward Jurisdiction Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase font-mono">
                  {user?.ward_name || user?.ward_id || 'Ward 2 - Civil Lines'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  ZONAL DISPATCH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Municipal Corporation Jalandhar · Sovereign Ward Authority
              </p>
            </div>
          </div>

          {/* Right: Administrator Identity & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Ward Administrator'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {user?.designation || 'Ward Administrator'} · {user?.employee_id || 'PB-MCJ-ADM'}
              </span>
            </div>

            {/* If Super Admin inspecting Ward Portal, show button to jump back */}
            {isSuperAdmin && (
              <Link
                to="/super-admin"
                className="px-2.5 py-1.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-200 text-xs font-bold border border-amber-800 transition flex items-center gap-1.5"
                title="Return to Super Admin Console"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Root Console</span>
              </Link>
            )}

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                addToast({
                  type: 'info',
                  title: 'Console Logged Off',
                  message: 'Ward Administrator console session ended safely.',
                });
                navigate('/login?portal=staff');
              }}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Sign Out of Ward Console"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Ward Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Zonal Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <span>
            Ward Tactical Console • 48-Hour Statutory Municipal SLA Enforcement Engine
          </span>
          <span className="text-slate-400">
            Municipal Ward Operations Core · Punjab Urban Local Bodies
          </span>
        </div>
      </footer>
    </div>
  );
};
