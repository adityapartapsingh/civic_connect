import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../common/Button';

interface ProtectedRouteProps {
  allowedRoles?: Array<'citizen' | 'volunteer' | 'officer' | 'admin' | 'super_admin'>;
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

  // If role is not allowed with hierarchical access control
  // super_admin -> has access to all portals
  // admin -> has access to admin and officer queues
  const hasAccess = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (role === 'super_admin') return true;
    if (role === 'admin' && (allowedRoles.includes('admin') || allowedRoles.includes('officer') || allowedRoles.includes('citizen'))) return true;
    return allowedRoles.includes(role);
  };

  if (!hasAccess()) {
    const requiredTitle = allowedRoles?.includes('super_admin')
      ? 'Super Admin Access Required'
      : allowedRoles?.includes('admin')
      ? 'Municipal Corporation Administrator Access Required'
      : 'Municipal Officer Authorization Required';

    const requiredDesc = allowedRoles?.includes('super_admin')
      ? 'This portal is restricted to Civic Connect platform super administrators.'
      : allowedRoles?.includes('admin')
      ? 'This portal is restricted to Municipal Corporation Ward Administrators.'
      : 'This queue is restricted to verified municipal engineers and field inspectors.';

    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg border border-slate-300 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          {requiredTitle}
        </h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {requiredDesc}
          <br />
          You are currently signed in as <strong>{user.name} ({role.replace('_', ' ')})</strong>.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link to="/login">
            <Button variant="primary" className="w-full justify-center text-xs" icon={<LogIn className="w-3.5 h-3.5" />}>
              Sign In with Authorized Account
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
