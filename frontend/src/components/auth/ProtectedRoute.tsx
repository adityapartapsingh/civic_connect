import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../common/Button';

interface ProtectedRouteProps {
  allowedRoles?: Array<'citizen' | 'officer' | 'admin'>;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, role } = useAuthStore();
  const location = useLocation();

  // If unauthenticated, redirect to login with return path
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If role is not allowed (e.g. Citizen trying to access Officer Queue)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg border border-slate-300 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Municipal Authorization Required
        </h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The <strong>Officer Dispatch Queue</strong> is restricted to verified municipal engineers and field inspectors.
          You are currently signed in as <strong>{user.name} (Citizen)</strong>.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link to="/login">
            <Button variant="primary" className="w-full justify-center text-xs" icon={<LogIn className="w-3.5 h-3.5" />}>
              Sign In as Municipal Officer
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full justify-center text-xs" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Return to Public Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
