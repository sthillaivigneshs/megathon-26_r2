import React from 'react';

export interface DashboardTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  description?: string;
}

interface DashboardToggleBarProps {
  tabs: DashboardTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  accentColor?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export const DashboardToggleBar: React.FC<DashboardToggleBarProps> = ({
  tabs,
  activeTab,
  onChange,
  accentColor = 'emerald',
}) => {
  const getActiveClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20';
      case 'amber':
        return 'bg-amber-600 text-white shadow-sm shadow-amber-600/20';
      case 'blue':
        return 'bg-blue-600 text-white shadow-sm shadow-blue-600/20';
      case 'purple':
        return 'bg-purple-600 text-white shadow-sm shadow-purple-600/20';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <div className="w-full">
      {/* Scrollable Container on Mobile with smooth touch scroll */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 min-w-max sm:min-w-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? getActiveClasses(accentColor)
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab.icon && (
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {tab.icon}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
