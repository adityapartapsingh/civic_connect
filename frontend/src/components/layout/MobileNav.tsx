import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Plus, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const MobileNav: React.FC = () => {
  const { isOfficer } = useAuthStore();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 sm:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <div className={`grid ${isOfficer ? 'grid-cols-4' : 'grid-cols-4'} h-16 max-w-md mx-auto`}>
        {isOfficer ? (
          <>
            {/* Officer Queue */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs">Queue</span>
            </NavLink>

            {/* City Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-xs">Map</span>
            </NavLink>

            {/* Public Reports Feed */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Feed</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Reports Feed */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Reports</span>
            </NavLink>

            {/* Map */}
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Map className="w-5 h-5" />
              <span className="text-xs">Map</span>
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
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Report</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-slate-900 font-bold border-t-2 border-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
