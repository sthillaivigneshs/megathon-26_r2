import React, { useState, useEffect } from 'react';
import { LogIn, Shield, KeyRound, ArrowRight, UserCheck, AlertCircle, CheckCircle2, LogOut, LayoutDashboard } from 'lucide-react';
import { User, UserRole } from '../../types';
import { loginUser, logoutUser, getCurrentSession, getRoleDisplayName, getRoleDashboardPath } from '../../services/auth';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentSession().user);
  const [email, setEmail] = useState('priya@citizen.reloop.eco');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentSession().user);
    };
    window.addEventListener('reloop_auth_changed', handleAuthChange);
    return () => window.removeEventListener('reloop_auth_changed', handleAuthChange);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = loginUser(email, selectedRole);
      setLoading(false);

      if (!result.success || !result.user) {
        setError(result.error || 'Authentication failed');
      } else {
        setSuccessMsg(`Authenticated as ${result.user.name} (${getRoleDisplayName(result.user.role)}). Single-user session active.`);
        setTimeout(() => {
          onNavigate(getRoleDashboardPath(result.user!.role));
        }, 600);
      }
    }, 400);
  };

  const handleQuickSelect = (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  const handleCurrentLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setSuccessMsg('Logged out successfully. You can now sign in as any authorized user.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display">
            Sign in to ReLoop
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in as an authorized stakeholder (Single user session)
          </p>
        </div>

        {/* Existing Active Session Notice */}
        {currentUser && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Currently Logged In
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-semibold rounded text-[10px]">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
            <div className="text-xs text-amber-950 font-medium">
              You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.email}).
            </div>
            <div className="text-[11px] text-amber-700">
              ReLoop enforces one user at a time. Signing in below will replace this session.
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to My Dashboard</span>
              </button>
              <button
                type="button"
                onClick={handleCurrentLogout}
                className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Credentials Fill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Account Credentials to Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              id="demo-btn-user"
              onClick={() => handleQuickSelect('user', 'priya@citizen.reloop.eco')}
              className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                selectedRole === 'user' && email === 'priya@citizen.reloop.eco'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium text-emerald-700">Citizen / User</div>
              <div className="text-[10px] text-slate-500 truncate">priya@citizen.reloop.eco</div>
            </button>

            <button
              type="button"
              id="demo-btn-collector"
              onClick={() => handleQuickSelect('collector', 'rajesh@collector.reloop.eco')}
              className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                selectedRole === 'collector' && email === 'rajesh@collector.reloop.eco'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium text-amber-700">Informal Collector</div>
              <div className="text-[10px] text-slate-500 truncate">rajesh@collector.reloop.eco</div>
            </button>

            <button
              type="button"
              id="demo-btn-aggregator"
              onClick={() => handleQuickSelect('aggregator', 'aggregator@demo.com')}
              className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                selectedRole === 'aggregator' && email === 'aggregator@demo.com'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium text-blue-600">Aggregator Hub</div>
              <div className="text-[10px] text-slate-500 truncate">aggregator@demo.com</div>
            </button>

            <button
              type="button"
              id="demo-btn-recycler"
              onClick={() => handleQuickSelect('recycler', 'contact@greentech.eco')}
              className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                selectedRole === 'recycler' && email === 'contact@greentech.eco'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium text-indigo-700">Recycler / Refurbisher</div>
              <div className="text-[10px] text-slate-500 truncate">contact@greentech.eco</div>
            </button>

            <button
              type="button"
              id="demo-btn-brand"
              onClick={() => handleQuickSelect('brand_cpcb', 'compliance@ecocorp.com')}
              className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                selectedRole === 'brand_cpcb' && email === 'compliance@ecocorp.com'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium text-purple-700">Brand / CPCB (PRO)</div>
              <div className="text-[10px] text-slate-500 truncate">compliance@ecocorp.com</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Operating Role
            </label>
            <select
              id="login-role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            >
              <option value="user">Citizen / User</option>
              <option value="collector">Informal Collector</option>
              <option value="recycler">Recycler / Refurbisher</option>
              <option value="brand_cpcb">Brand / CPCB (PRO Compliance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Single-User Active Session
            </span>
            <span className="text-slate-400">Default pwd: password123</span>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In as This User'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Register new account
          </button>
        </div>
      </div>
    </div>
  );
};
