import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Plus, LayoutDashboard, User, Trophy, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const MobileNav: React.FC = () => {
  const { isOfficer, isAdmin, isSuperAdmin } = useAuthStore();
  const location = useLocation();

  // Never display mobile navigation bar on login or signup pages
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 sm:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-xs">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {isOfficer ? (
          <>
            {/* Officer Queue */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[11px] font-medium">Queue</span>
            </NavLink>

            {/* City Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-[11px] font-medium">Map</span>
            </NavLink>

            {/* Super Admin or Admin or Feed */}
            {isSuperAdmin ? (
              <NavLink
                to="/super-admin"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                    isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-[11px] font-medium">Super</span>
              </NavLink>
            ) : isAdmin ? (
              <NavLink
                to="/admin-portal"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                    isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[11px] font-medium">Admin</span>
              </NavLink>
            ) : (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                    isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span className="text-[11px] font-medium">Feed</span>
              </NavLink>
            )}

            {/* Rewards */}
            <NavLink
              to="/rewards"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[11px] font-medium">Rewards</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Reports Feed */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px] font-medium">Reports</span>
            </NavLink>

            {/* Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-[11px] font-medium">Map</span>
            </NavLink>

            {/* Report Action Button */}
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
              aria-label="Report New Civic Issue"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-800">Report</span>
            </NavLink>

            {/* Rewards */}
            <NavLink
              to="/rewards"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[11px] font-medium">Rewards</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors border-t-2 ${
                  isActive ? 'text-slate-900 font-bold border-slate-900' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
