import React from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  Shield,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Wallet,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { getRoleDisplayName } from '../../services/auth';

export interface ProfileBadge {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  icon?: React.ReactNode;
}

interface RoleProfileCardProps {
  user: User;
  badges?: ProfileBadge[];
  actions?: React.ReactNode;
  subtitle?: string;
  customDetails?: { label: string; value: string; icon?: React.ReactNode }[];
}

export const RoleProfileCard: React.FC<RoleProfileCardProps> = ({
  user,
  badges = [],
  actions,
  subtitle,
  customDetails = [],
}) => {
  // Theme styling based on role
  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'user':
        return {
          bannerBg: 'from-emerald-800 via-teal-900 to-slate-900',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          avatarBg: 'bg-emerald-600 text-white',
          accentText: 'text-emerald-400',
        };
      case 'collector':
        return {
          bannerBg: 'from-amber-900 via-slate-900 to-slate-900',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          avatarBg: 'bg-amber-600 text-white',
          accentText: 'text-amber-400',
        };
      case 'recycler':
        return {
          bannerBg: 'from-blue-900 via-indigo-950 to-slate-900',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          avatarBg: 'bg-blue-600 text-white',
          accentText: 'text-blue-400',
        };
      case 'brand_cpcb':
        return {
          bannerBg: 'from-purple-950 via-slate-900 to-slate-900',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          avatarBg: 'bg-purple-600 text-white',
          accentText: 'text-purple-400',
        };
    }
  };

  const theme = getRoleTheme(user.role);

  // Initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      id="role-profile-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
    >
      {/* Top Banner with gradient & user identity */}
      <div className={`bg-gradient-to-r ${theme.bannerBg} p-5 sm:p-6 text-white relative`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${theme.avatarBg} flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-2 border-white/20 shrink-0 font-display`}
            >
              {initials}
            </div>

            {/* Name & Role Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${theme.badgeBg}`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{getRoleDisplayName(user.role)}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>KYC Verified</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display truncate">
                {user.name}
              </h1>

              <p className="text-xs text-slate-300 mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-none">
                {subtitle ||
                  (user.role === 'user'
                    ? 'Empowered citizen disposing e-waste via verified, offline-first digital chain of custody.'
                    : user.role === 'collector'
                    ? 'Informal recovery partner bridging first-mile collections to certified recyclers.'
                    : user.role === 'recycler'
                    ? 'Authorized processing facility enforcing circularity hierarchy: Reuse, Refurbish, Recover & Recycle.'
                    : 'Registered brand & compliance team managing verifiable EPR targets and audit readiness.')}
              </p>
            </div>
          </div>

          {/* Optional Action on Header */}
          {actions && <div className="shrink-0 pt-2 sm:pt-0">{actions}</div>}
        </div>
      </div>

      {/* Identity & Contact Details Bar (Responsive Grid) */}
      <div className="bg-slate-50/70 border-b border-slate-100 px-5 py-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500">Email:</span>
            <span className="font-semibold text-slate-900 truncate">{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-900">{user.phone}</span>
            </div>
          )}

          {user.organization && (
            <div className="flex items-center gap-2 truncate">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500">Org:</span>
              <span className="font-semibold text-slate-900 truncate">{user.organization}</span>
            </div>
          )}

          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500">Member ID:</span>
            <span className="font-mono font-semibold text-slate-800">{user.id}</span>
          </div>

          {customDetails.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-2 truncate">
              {detail.icon || <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <span className="text-slate-500">{detail.label}:</span>
              <span className="font-semibold text-slate-900 truncate">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges Strip (Segregated summary metrics) */}
      {badges.length > 0 && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((b, idx) => {
              const colorClasses =
                b.color === 'emerald'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : b.color === 'amber'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : b.color === 'blue'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : b.color === 'purple'
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-slate-50 border-slate-200 text-slate-900';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${colorClasses} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    <span>{b.label}</span>
                    {b.icon}
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold font-display">
                    {b.value}
                  </div>
                  {b.subtext && (
                    <div className="text-[11px] opacity-80 mt-0.5 truncate">
                      {b.subtext}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
