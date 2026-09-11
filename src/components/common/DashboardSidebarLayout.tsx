import React, { useState } from 'react';
import {
  User as UserIcon,
  Menu,
  X,
  Shield,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Sparkles,
  Smartphone,
  Layers,
  BarChart3,
  SlidersHorizontal,
  Home,
  Pencil
} from 'lucide-react';
import { User } from '../../types';
import { getRoleDisplayName, logoutUser } from '../../services/auth';

export interface NavSectionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  category: 'service' | 'analysis' | 'account';
  description?: string;
}

interface DashboardSidebarLayoutProps {
  user: User;
  navItems: NavSectionItem[];
  activeId: string;
  onChangeId: (id: string) => void;
  accentColor?: 'emerald' | 'amber' | 'blue' | 'purple';
  children: React.ReactNode;
  onOpenWhatsApp?: () => void;
}

export const DashboardSidebarLayout: React.FC<DashboardSidebarLayoutProps> = ({
  user,
  navItems,
  activeId,
  onChangeId,
  accentColor = 'emerald',
  children,
  onOpenWhatsApp,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Group items by category: Services, Data Analysis, Account & Settings
  const serviceItems = navItems.filter((item) => item.category === 'service');
  const analysisItems = navItems.filter((item) => item.category === 'analysis');
  const accountItems = navItems.filter((item) => item.category === 'account');
  const activeItem = navItems.find((item) => item.id === activeId) || navItems[0];

  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          activeBg: 'bg-emerald-600 text-white shadow-xs',
          activeText: 'text-white',
          hoverBg: 'hover:bg-emerald-50 hover:text-emerald-900',
          badgeActive: 'bg-white/20 text-white',
          badgeDefault: 'bg-emerald-100 text-emerald-800',
          avatarBg: 'bg-emerald-600 text-white',
          pillBorder: 'border-emerald-200',
          ring: 'ring-emerald-500/20',
        };
      case 'amber':
        return {
          activeBg: 'bg-amber-600 text-white shadow-xs',
          activeText: 'text-white',
          hoverBg: 'hover:bg-amber-50 hover:text-amber-900',
          badgeActive: 'bg-white/20 text-white',
          badgeDefault: 'bg-amber-100 text-amber-800',
          avatarBg: 'bg-amber-600 text-white',
          pillBorder: 'border-amber-200',
          ring: 'ring-amber-500/20',
        };
      case 'blue':
        return {
          activeBg: 'bg-blue-600 text-white shadow-xs',
          activeText: 'text-white',
          hoverBg: 'hover:bg-blue-50 hover:text-blue-900',
          badgeActive: 'bg-white/20 text-white',
          badgeDefault: 'bg-blue-100 text-blue-800',
          avatarBg: 'bg-blue-600 text-white',
          pillBorder: 'border-blue-200',
          ring: 'ring-blue-500/20',
        };
      case 'purple':
        return {
          activeBg: 'bg-purple-600 text-white shadow-xs',
          activeText: 'text-white',
          hoverBg: 'hover:bg-purple-50 hover:text-purple-900',
          badgeActive: 'bg-white/20 text-white',
          badgeDefault: 'bg-purple-100 text-purple-800',
          avatarBg: 'bg-purple-600 text-white',
          pillBorder: 'border-purple-200',
          ring: 'ring-purple-500/20',
        };
      default:
        return {
          activeBg: 'bg-slate-900 text-white shadow-xs',
          activeText: 'text-white',
          hoverBg: 'hover:bg-slate-100 hover:text-slate-900',
          badgeActive: 'bg-white/20 text-white',
          badgeDefault: 'bg-slate-200 text-slate-800',
          avatarBg: 'bg-slate-900 text-white',
          pillBorder: 'border-slate-200',
          ring: 'ring-slate-500/20',
        };
    }
  };

  const theme = getThemeClasses(accentColor);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const renderNavList = (items: NavSectionItem[]) => {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              type="button"
              onClick={() => {
                onChangeId(item.id);
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? `${theme.activeBg} font-bold`
                  : `text-slate-600 ${theme.hoverBg} bg-transparent`
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ml-2 ${
                    isActive ? theme.badgeActive : item.badgeColor || theme.badgeDefault
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Mobile Top Navigation Bar (Shows on screens < lg) */}
      <div className="lg:hidden mb-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${theme.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 font-display`}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span>{getRoleDisplayName(user.role)}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">Active View: {activeItem?.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onChangeId('profile')}
              title="Edit Profile"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Horizontal Quick-Tab Row on Mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-2">
          {navItems.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => onChangeId(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? theme.activeBg
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Sidebar + Content Area */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* DESKTOP SIDEBAR (Visible on lg and larger) */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {/* User Mini Profile Box with Edit Symbol */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl ${theme.avatarBg} flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 font-display`}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 truncate">
                    {getRoleDisplayName(user.role)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChangeId('profile')}
                title="Edit Profile Details"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  activeId === 'profile'
                    ? 'bg-white text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Selected View:</span>
              <span className="font-bold text-slate-800 truncate max-w-[130px]">{activeItem?.label}</span>
            </div>
          </div>

          {/* SECTION 1: SERVICES & WORKFLOWS */}
          <div className="space-y-1 mb-4">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Services & Actions</span>
              <Layers className="w-3 h-3 text-slate-400" />
            </div>
            {renderNavList(serviceItems)}
          </div>

          {/* SECTION 2: DATA ANALYSIS & INSIGHTS */}
          <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Data Analysis & Reports</span>
              <BarChart3 className="w-3 h-3 text-slate-400" />
            </div>
            {renderNavList(analysisItems)}
          </div>

          {/* SECTION 3: ACCOUNT & SETTINGS (If defined) */}
          {accountItems.length > 0 && (
            <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
              <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Account & Profile</span>
                <UserIcon className="w-3 h-3 text-slate-400" />
              </div>
              {renderNavList(accountItems)}
            </div>
          )}

          {/* Bottom Sidebar Status & Tools */}
          <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-semibold">Ledger Stream: Active</span>
            </div>

            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Bot</span>
              </button>
            )}
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT DRAWER / MODAL */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Slide-out Menu */}
            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${theme.avatarBg} flex items-center justify-center font-bold text-xs text-white`}>
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{getRoleDisplayName(user.role)}</div>
                  </div>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Sections */}
              <div className="space-y-4 flex-1">
                <div>
                  <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Services & Workflows
                  </div>
                  {renderNavList(serviceItems)}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Data Analysis & Reports
                  </div>
                  {renderNavList(analysisItems)}
                </div>

                {accountItems.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Account & Profile
                    </div>
                    {renderNavList(accountItems)}
                  </div>
                )}
              </div>

              {/* Bottom Drawer Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2 mt-4">
                {onOpenWhatsApp && (
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenWhatsApp();
                    }}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Launch WhatsApp Bot</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logoutUser();
                    window.location.href = '/';
                  }}
                  className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT AREA: Renders the active Service or Data Analysis */}
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
};
