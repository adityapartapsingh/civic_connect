import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Toast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { LogOut, LogIn, UserPlus, Shield, Building2, User } from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  const { user, isOfficer, isAdmin, isSuperAdmin, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { address, isMockSuspected } = useGeolocation();
  const location = useLocation();

  const isCameraPage = location.pathname === '/report';
  const hideMobileNav = isCameraPage;

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 ${hideMobileNav ? 'pb-8' : 'pb-20 sm:pb-8'}`}>
      {/* Top Notification Toast Layer */}
      <Toast />

      {/* Mock Location Alert Banner */}
      {isMockSuspected && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium">
          Notice: High GPS accuracy variance detected. Submissions require on-device live camera capture.
        </div>
      )}

      {/* Public Citizen Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Understated Municipal Jurisdiction */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-900 font-black text-xl tracking-tight hover:opacity-90 transition">
              CivicConnect
            </Link>

            <span className="hidden md:inline-flex items-center px-2 py-0.5 border border-slate-200 bg-slate-100 text-slate-700 text-xs font-mono rounded">
              {address ? address.split(',').slice(0, 2).join(',') : 'Live GPS Active'}
            </span>
          </div>

          {/* Center: Citizen Community Navigation */}
          <nav aria-label="Citizen Navigation" className="hidden sm:flex items-center space-x-6 lg:space-x-8 h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              Reports Feed
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              City Map
            </NavLink>

            <NavLink
              to="/rewards"
              className={({ isActive }) =>
                `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              Rewards &amp; Rankings
            </NavLink>

            <NavLink
              to="/volunteers"
              className={({ isActive }) =>
                `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              Youth Volunteers
            </NavLink>
          </nav>

          {/* Right: Auth & Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 transition border border-transparent hover:border-slate-200 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user.name ? user.name.slice(0, 2) : 'CU'}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {user.phone ? `+91 ${user.phone}` : 'Verified Citizen'}
                    </span>
                  </div>
                </Link>

                {/* If official logged into citizen portal, show jump link to their portal */}
                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold transition hover:bg-amber-100"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Super Admin Console →</span>
                  </Link>
                )}
                {isAdmin && !isSuperAdmin && (
                  <Link
                    to="/admin-portal"
                    className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-bold transition hover:bg-cyan-100"
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Ward Console →</span>
                  </Link>
                )}
                {isOfficer && (
                  <Link
                    to="/dashboard"
                    className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold transition hover:bg-amber-100"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span>Work Orders →</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    addToast({
                      type: 'info',
                      title: 'Signed Out',
                      message: 'You have been safely signed out.',
                    });
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition border border-slate-300"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Citizen Only) */}
      {!hideMobileNav && <MobileNav />}

      {/* Public Citizen Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px]">
            Civic Connect • Municipal Corporation of Jalandhar Public Portal
          </p>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <Link to="/map" className="hover:text-slate-900">Ward Map</Link>
            <Link to="/volunteers" className="hover:text-slate-900">Youth Corps</Link>
            <Link to="/rewards" className="hover:text-slate-900">Rewards</Link>
            <Link to="/login?portal=staff" className="text-slate-900 font-bold hover:underline">
              Official Staff Portal →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
