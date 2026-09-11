import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import { User, UserRole } from '../../types';
import { checkRoleAccess, getRoleDisplayName, getRoleDashboardPath, logoutUser } from '../../services/auth';

interface RBACGuardProps {
  currentUser: User | null;
  requiredRole: UserRole | UserRole[];
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  currentUser,
  requiredRole,
  onNavigate,
  children,
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please log in with valid credentials to access this dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
            >
              Go to Login
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = checkRoleAccess(requiredRole, currentUser.role);

  if (!hasAccess) {
    const requiredRoleDisplay = Array.isArray(requiredRole)
      ? requiredRole.map(getRoleDisplayName).join(' or ')
      : getRoleDisplayName(requiredRole);

    const handleLogoutToSwitch = () => {
      logoutUser();
      onNavigate('/login');
    };

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-rose-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 uppercase tracking-wider mb-2">
            Single-User Access Control Active
          </div>

          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Role Permission Required
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            This dashboard is restricted to authorized <strong className="text-slate-900">{requiredRoleDisplay}</strong> accounts.
          </p>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Currently Logged In:</span>
              <span className="font-bold text-slate-900">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono text-slate-700">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Your Active Role:</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Required Role:</span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                {requiredRoleDisplay}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Only one user is authenticated at a time. To access this dashboard, please log out and sign in with an account having {requiredRoleDisplay} credentials.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to My Dashboard
            </button>

            <button
              onClick={handleLogoutToSwitch}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out & Switch User
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
