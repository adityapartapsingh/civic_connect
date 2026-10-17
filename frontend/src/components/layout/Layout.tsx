import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Toast } from '../common/Toast';
import { PointsBadge } from '../gamification/PointsBadge';
import { useAuthStore } from '../../store/authStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  Compass,
  MapPin,
  Shield,
  User,
  PlusCircle,
  Home,
  Map,
  LayoutDashboard,
  Sparkles,
  Wifi,
  AlertTriangle,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { isOfficer, toggleRole, user } = useAuthStore();
  const { ward, accuracy, isMockSuspected, isLoading: geoLoading } = useGeolocation();
  const location = useLocation();

  // Hide mobile nav during active in-app camera capture to maximize viewfinder
  const isCameraPage = location.pathname === '/report';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 sm:pb-8">
      {/* Top Notification Toast Layer */}
      <Toast />

      {/* Mock Location Alert Banner (if spoofing suspected) */}
      {isMockSuspected && (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-1.5 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Notice: High GPS accuracy variance detected. Submissions require on-device live camera capture.</span>
        </div>
      )}

      {/* Main App Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Ward badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 leading-tight">
                  Civic<span className="text-brand-600">Connect</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  SLA Transparency
                </span>
              </div>
            </Link>

            {/* GPS Ward Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span className="font-semibold">{ward || 'Koramangala Ward 18'}</span>
              <span className="text-[10px] text-slate-400">
                (±{accuracy || 8}m)
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Hyperlocal Feed</span>
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Map className="w-4 h-4" />
              <span>City Map</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Officer Queue</span>
            </NavLink>
          </nav>

          {/* Right Header Actions: Role Switcher & Points Badge */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher Toggle Button */}
            <button
              type="button"
              onClick={toggleRole}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                isOfficer
                  ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Click to toggle between Citizen App & Field Officer Portal view"
            >
              <Shield className={`w-3.5 h-3.5 ${isOfficer ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isOfficer ? 'Officer Mode' : 'Citizen Mode'}
              </span>
            </button>

            {/* Desktop Report Issue CTA Button */}
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-brand-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {/* Citizen Points Badge */}
            <PointsBadge compact={true} />
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      {!isCameraPage && <MobileNav />}
    </div>
  );
};
