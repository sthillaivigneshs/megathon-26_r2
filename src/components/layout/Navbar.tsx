import React, { useState } from 'react';
import {
  Recycle,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Smartphone,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { User } from '../../types';
import { getRoleDisplayName, getRoleDashboardPath, logoutUser } from '../../services/auth';

interface NavbarProps {
  currentUser: User | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenWhatsApp: () => void;
  onOpenInteractiveFace: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentPath,
  onNavigate,
  onOpenWhatsApp,
  onOpenInteractiveFace,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="nav-logo"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                  Re<span className="text-emerald-600">Loop</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  EPR Chain
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                Offline-First E-Waste Digital Ledger
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Bot & WhatsApp Buttons */}
            <button
              id="nav-btn-whatsapp"
              onClick={onOpenWhatsApp}
              title="WhatsApp Chatbot Redirector"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp Bot</span>
            </button>

            <button
              id="nav-btn-face-ai"
              onClick={onOpenInteractiveFace}
              title="Interactive AI Avatar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden md:inline">Eco Avatar</span>
            </button>

            {/* If a single person is logged in */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Active user badge */}
                <div
                  id="nav-user-profile"
                  className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl"
                  title={`Logged in as ${currentUser.name} (${currentUser.email})`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight max-w-[110px] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 leading-tight">
                      {getRoleDisplayName(currentUser.role)}
                    </div>
                  </div>
                </div>

                {/* Direct link to this user's dedicated dashboard */}
                <button
                  id="nav-btn-dashboard"
                  onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">My Dashboard</span>
                </button>

                {/* Explicit Logout Button - Single user session */}
                <button
                  id="nav-btn-logout"
                  onClick={handleLogout}
                  title="Log out of this account"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Log Out</span>
                </button>
              </div>
            ) : (
              /* If not logged in: Login & Register */
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-login"
                  onClick={() => onNavigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  id="nav-btn-register"
                  onClick={() => onNavigate('/register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {currentUser ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs text-slate-500">Currently logged in:</div>
              <div className="font-bold text-slate-800 text-sm">{currentUser.name}</div>
              <div className="text-xs font-semibold text-emerald-700">
                Role: {getRoleDisplayName(currentUser.role)}
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(getRoleDashboardPath(currentUser.role));
                  }}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/login');
                }}
                className="py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/register');
                }}
                className="py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWhatsApp();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <Smartphone className="w-4 h-4" />
              Open WhatsApp Bot Redirector
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInteractiveFace();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <Sparkles className="w-4 h-4" />
              Open Eco Avatar Assistant
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
