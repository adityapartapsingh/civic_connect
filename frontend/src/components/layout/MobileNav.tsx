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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 sm:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.03)] select-none">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-stretch">
        {isOfficer ? (
          <>
            {/* Officer Queue */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 transition-transform group-active:scale-90" />
              <span className="text-[11px] font-medium tracking-tight">Queue</span>
            </NavLink>

            {/* City Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Map</span>
            </NavLink>

            {/* Super Admin or Admin or Feed */}
            {isSuperAdmin ? (
              <NavLink
                to="/super-admin"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                    isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-[11px] font-medium tracking-tight">Super</span>
              </NavLink>
            ) : isAdmin ? (
              <NavLink
                to="/admin-portal"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                    isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[11px] font-medium tracking-tight">Admin</span>
              </NavLink>
            ) : (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                    isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span className="text-[11px] font-medium tracking-tight">Feed</span>
              </NavLink>
            )}

            {/* Rewards */}
            <NavLink
              to="/rewards"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Rewards</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Reports Feed */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Reports</span>
            </NavLink>

            {/* Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Map</span>
            </NavLink>

            {/* Report Action Button (Fitts's Law Center CTA with Exaggerated Feedback) */}
            <NavLink
              to="/report"
              className="flex flex-col items-center justify-center gap-0.5 squash-stretch"
              aria-label="Report New Civic Issue"
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:bg-blue-600 active:scale-90 transition-all duration-150">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-slate-900 tracking-tight">Report</span>
            </NavLink>

            {/* Rewards */}
            <NavLink
              to="/rewards"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Rewards</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all border-t-2 squash-stretch ${
                  isActive ? 'text-slate-900 font-bold border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-900 border-transparent'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
