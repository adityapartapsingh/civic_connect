import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Toast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { LogOut, LogIn, UserPlus } from 'lucide-react';

export const Layout: React.FC = () => {
  const { isOfficer, isAdmin, isSuperAdmin, setRole, user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { address, accuracy, isMockSuspected } = useGeolocation();
  const location = useLocation();

  // Hide mobile nav during active in-app camera capture to maximize viewfinder,
  // and on login / signup pages to keep the authentication flow clean and uncluttered
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register';

  const isCameraPage = location.pathname === '/report';
  const hideMobileNav = isCameraPage || isAuthPage;

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 ${hideMobileNav ? 'pb-8' : 'pb-20 sm:pb-8'}`}>
      {/* Top Notification Toast Layer */}
      <Toast />

      {/* Mock Location Alert Banner (if spoofing suspected) */}
      {isMockSuspected && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium">
          Notice: High GPS accuracy variance detected. Submissions require on-device live camera capture.
        </div>
      )}

      {/* Main Human-Designed Civic Header */}
      {!isAuthPage && (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
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

          {/* Center: Clean Text Navigation Links (Role Tailored) */}
          <nav aria-label="Main Navigation" className="hidden sm:flex items-center space-x-8 h-16">
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

            {isSuperAdmin && (
              <NavLink
                to="/super-admin"
                className={({ isActive }) =>
                  `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                    isActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                Super Admin
              </NavLink>
            )}

            {isAdmin && !isSuperAdmin && (
              <NavLink
                to="/admin-portal"
                className={({ isActive }) =>
                  `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                    isActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                Ward Admin
              </NavLink>
            )}

            {isOfficer && !isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `h-16 flex items-center px-1 text-sm font-semibold transition-colors border-b-2 ${
                    isActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                Officer Queue
              </NavLink>
            )}
          </nav>

          {/* Right: Actions, Role Badge, User Profile */}
          <div className="flex items-center gap-4">
            {/* Action Button: Super Admin, Ward Admin, Field Officer, Citizen */}
            {isSuperAdmin ? (
              <Link
                to="/super-admin"
                className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-md transition shadow-xs"
              >
                Super Admin Console
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin-portal"
                className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-md transition shadow-xs"
              >
                Ward Admin Console
              </Link>
            ) : isOfficer ? (
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-md transition shadow-xs"
              >
                Dispatch Queue
              </Link>
            ) : (
              <Link
                to="/report"
                className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-md transition shadow-xs"
              >
                Report Issue
              </Link>
            )}

            {/* Authenticated User Profile or Sign In */}
            {user ? (
              <div className="flex items-center pl-3 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center transition shadow-xs"
                  title={`View Profile (${user.name})`}
                >
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'CC'}
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Main Viewport Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${isAuthPage ? 'py-6 flex flex-col justify-center items-center' : 'py-5'}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      {!hideMobileNav && <MobileNav />}
    </div>
  );
};
