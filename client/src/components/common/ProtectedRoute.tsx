import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-forest text-ivory flex items-center justify-center p-6 paper-grain-dark">
        <div className="max-w-md w-full bg-ivory text-forest rounded-3xl p-8 sm:p-10 shadow-lift border border-ivory/20 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-forest/50">
              Role Permission Boundary
            </span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-forest">
              Access Restricted
            </h2>
            <p className="text-forest/70 text-xs sm:text-sm">
              Your account is signed in as a{' '}
              <strong className="text-forest capitalize">{user.role}</strong>. This module is restricted to{' '}
              {allowedRoles.join(' or ')} access only.
            </p>
          </div>

          <Link
            to={
              user.role === 'nutritionist'
                ? '/nutritionist'
                : user.role === 'admin'
                ? '/admin'
                : '/dashboard'
            }
            className="w-full bg-forest text-ivory font-semibold py-3.5 rounded-full hover:bg-forest-light shadow-subtle transition-all flex items-center justify-center gap-2 text-sm inline-flex"
          >
            <span>Return to My Authorized Workspace</span>
            <ArrowRight className="w-4 h-4 text-lime" />
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

