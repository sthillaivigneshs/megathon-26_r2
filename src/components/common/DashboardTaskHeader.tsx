import React from 'react';
import { Sparkles } from 'lucide-react';
import { User } from '../../types';
import { getRoleDisplayName } from '../../services/auth';

interface DashboardTaskHeaderProps {
  user: User;
  title: string;
  description?: string;
  badge?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const DashboardTaskHeader: React.FC<DashboardTaskHeaderProps> = ({
  user,
  title,
  description,
  badge,
  actions,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {user.name}
          </span>
          <span className="text-[11px] font-medium text-slate-400">•</span>
          <span className="text-[11px] font-semibold text-slate-500">
            {getRoleDisplayName(user.role)}
          </span>
          {badge && (
            <div className="shrink-0">{badge}</div>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
