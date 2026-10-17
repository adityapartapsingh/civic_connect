import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Plus, LayoutDashboard, User, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const MobileNav: React.FC = () => {
  const { isOfficer } = useAuthStore();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-3 py-1.5 sm:hidden shadow-md pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Nearby</span>
        </NavLink>

        {/* Map */}
        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px]">City Map</span>
        </NavLink>

        {/* Center Floating Report Button */}
        <NavLink
          to="/report"
          className="relative -top-5 flex flex-col items-center group"
          aria-label="Report New Civic Issue"
        >
          <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center border-2 border-white shadow-sm">
            <Plus className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-[10px] font-medium text-slate-700 mt-0.5">Report</span>
        </NavLink>

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          {isOfficer ? (
            <Shield className="w-5 h-5 text-purple-600" />
          ) : (
            <LayoutDashboard className="w-5 h-5" />
          )}
          <span className="text-[10px]">{isOfficer ? 'Officer' : 'Tickets'}</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
