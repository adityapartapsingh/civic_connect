import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Toast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import {
  Shield,
  ShieldCheck,
  Building2,
  LogOut,
  Users,
  Smartphone,
  Ban,
  Activity,
  Layers,
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification Layer */}
      <Toast />

      {/* Top Root Executive Terminal Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Root Command Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase font-mono">
                  Super Admin Root Terminal
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  TIER-1 ROOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Civic Connect State Municipal Authority • Full Site Governance Active
              </p>
            </div>
          </div>

          {/* Right: Root Operator & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Chief Administrator'}
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {user?.employee_id || 'CC-SUPERADMIN-001'} · Root Authority
              </span>
            </div>

            {/* Jump to Ward Admin View */}
            <Link
              to="/admin-portal"
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Ward Admin Console</span>
            </Link>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                addToast({
                  type: 'info',
                  title: 'Root Session Closed',
                  message: 'Super Admin command session terminated safely.',
                });
                navigate('/super-admin');
              }}
              className="px-2.5 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 transition flex items-center gap-1.5"
              title="Terminate Super Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Super Admin Executive Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Root Command Footer */}
      <footer className="border-t border-slate-800 bg-black/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <span>
            Civic Connect Root Governance Architecture v2.5 • Cryptographic Audit &amp; Anti-Spam Watchdog Active
          </span>
          <span className="text-slate-400">
            System Telemetry: Port 5005 WhatsApp Gateway Daemon Online
          </span>
        </div>
      </footer>
    </div>
  );
};
