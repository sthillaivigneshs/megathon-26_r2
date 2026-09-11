import React, { useState } from 'react';
import { UserPlus, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';
import { registerUser, getRoleDisplayName, getRoleDashboardPath } from '../../services/auth';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerUser(name, email, role, phone);
      setLoading(false);
      if (!res.success || !res.user) {
        setError(res.error || 'Registration failed');
      } else {
        setSuccessMsg(`Account created successfully as ${getRoleDisplayName(role)}! Redirecting to your dashboard...`);
        setTimeout(() => {
          onNavigate(getRoleDashboardPath(role));
        }, 600);
      }
    }, 400);
  };

  const fillTemplate = (targetRole: UserRole, targetName: string, targetEmail: string) => {
    setRole(targetRole);
    setName(targetName);
    setEmail(targetEmail);
    setPassword('secret123');
    setPhone('+91 98000 12345');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display">
            Create ReLoop Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Join the verified e-waste circularity and EPR ecosystem
          </p>
        </div>

        {/* Quick Role Templates */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Quick Fill Demo Data:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillTemplate('user', 'Anita Roy', 'anita@citizen.org')}
              className="p-1.5 text-left rounded-md bg-white border border-slate-200 hover:border-emerald-400 text-slate-700"
            >
              <span className="font-semibold text-emerald-700 block">Citizen</span>
              <span className="text-[10px] text-slate-400">Anita Roy</span>
            </button>
            <button
              type="button"
              onClick={() => fillTemplate('collector', 'Ramesh Kabadiwala', 'ramesh@collector.org')}
              className="p-1.5 text-left rounded-md bg-white border border-slate-200 hover:border-amber-400 text-slate-700"
            >
              <span className="font-semibold text-amber-700 block">Collector</span>
              <span className="text-[10px] text-slate-400">Ramesh (Informal)</span>
            </button>
            <button
              type="button"
              onClick={() => fillTemplate('recycler', 'Apex Refurbishers', 'ops@apexrefurb.in')}
              className="p-1.5 text-left rounded-md bg-white border border-slate-200 hover:border-blue-400 text-slate-700"
            >
              <span className="font-semibold text-blue-700 block">Recycler</span>
              <span className="text-[10px] text-slate-400">Apex Refurbishers</span>
            </button>
            <button
              type="button"
              onClick={() => fillTemplate('brand_cpcb', 'Nova Electronics PRO', 'epr@novabrand.in')}
              className="p-1.5 text-left rounded-md bg-white border border-slate-200 hover:border-purple-400 text-slate-700"
            >
              <span className="font-semibold text-purple-700 block">Brand / CPCH</span>
              <span className="text-[10px] text-slate-400">Nova Brand PRO</span>
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

        <form className="space-y-3.5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Role <span className="text-rose-500">*</span>
            </label>
            <select
              id="register-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            >
              <option value="user">Citizen / User (Dispose E-Waste & Earn Rewards)</option>
              <option value="collector">Informal Collector (Mobile App & Smart Route)</option>
              <option value="recycler">Recycler / Refurbisher (Verification & Circularity)</option>
              <option value="brand_cpcb">Brand / CPCH (EPR Compliance & Audit Trail)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name / Entity Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="e.g. Priya Sharma or GreenTech Ltd"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="name@organization.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number (For OTP / WhatsApp)
            </label>
            <input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Role-Based Access Control (RBAC) securely seals your dashboard. A tamper-proof JWT token will be generated upon submission.
            </span>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Registering & Generating JWT...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Log in here
          </button>
        </div>
      </div>
    </div>
  );
};
