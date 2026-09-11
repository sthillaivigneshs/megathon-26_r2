import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { getCurrentSession, getRoleDashboardPath } from './services/auth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { RBACGuard } from './components/auth/RBACGuard';
import { CitizenDashboard } from './components/dashboards/CitizenDashboard';
import { CollectorDashboard } from './components/dashboards/CollectorDashboard';
import { RecyclerDashboard } from './components/dashboards/RecyclerDashboard';
import { BrandDashboard } from './components/dashboards/BrandDashboard';
import { WhatsAppRedirectorModal } from './components/modals/WhatsAppRedirectorModal';
import { InteractiveFaceModal } from './components/modals/InteractiveFaceModal';
import { WhatsAppMobileBot } from './components/whatsapp/WhatsAppMobileBot';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getCurrentSession().user;
  });

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  // Sync auth state
  useEffect(() => {
    const handleAuthChange = () => {
      const session = getCurrentSession();
      setCurrentUser(session.user);
    };

    window.addEventListener('reloop_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('reloop_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isWhatsAppRoute =
    currentPath === '/whatsapp' ||
    currentPath === '/wa' ||
    currentPath.startsWith('/whatsapp') ||
    (typeof window !== 'undefined' && window.location.search.includes('whatsapp')) ||
    (typeof window !== 'undefined' && window.location.hash === '#whatsapp');

  if (isWhatsAppRoute) {
    return (
      <div className="min-h-screen bg-[#111b21] flex flex-col items-center justify-center sm:p-4">
        <div className="w-full max-w-md bg-[#efeae2] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-screen sm:h-[740px]">
          <div className="bg-[#1f2c34] text-slate-300 px-3 py-1.5 text-xs flex items-center justify-between shrink-0 border-b border-slate-700/50">
            <button
              onClick={() => navigate('/')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>← ReLoop Portal</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Mobile WhatsApp Bot</span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <WhatsAppMobileBot standalone onBack={() => navigate('/')} />
          </div>
        </div>
      </div>
    );
  }

  // Route matching
  const renderCurrentView = () => {
    // Exact home
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          onOpenInteractiveFace={() => setIsFaceModalOpen(true)}
          currentUser={currentUser}
        />
      );
    }

    // Login
    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    // Register
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }

    // Citizen Dashboard
    if (currentPath === '/dashboard/citizen' || currentPath === '/dashboard/user') {
      return (
        <RBACGuard currentUser={currentUser} requiredRole="user" onNavigate={navigate}>
          <CitizenDashboard
            currentUser={currentUser!}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          />
        </RBACGuard>
      );
    }

    // Collector Dashboard
    if (currentPath === '/dashboard/collector') {
      return (
        <RBACGuard currentUser={currentUser} requiredRole="collector" onNavigate={navigate}>
          <CollectorDashboard currentUser={currentUser!} />
        </RBACGuard>
      );
    }

    // Recycler Dashboard
    if (currentPath === '/dashboard/recycler') {
      return (
        <RBACGuard currentUser={currentUser} requiredRole="recycler" onNavigate={navigate}>
          <RecyclerDashboard currentUser={currentUser!} />
        </RBACGuard>
      );
    }

    // Brand / CPCH Dashboard
    if (currentPath === '/dashboard/brand-cpcb' || currentPath === '/dashboard/brand') {
      return (
        <RBACGuard currentUser={currentUser} requiredRole="brand_cpcb" onNavigate={navigate}>
          <BrandDashboard currentUser={currentUser!} />
        </RBACGuard>
      );
    }

    // Fallback: If unknown path, show Home
    return (
      <HomePage
        onNavigate={navigate}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenInteractiveFace={() => setIsFaceModalOpen(true)}
        currentUser={currentUser}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenInteractiveFace={() => setIsFaceModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Global Footer with Copyright & Regulatory Disclaimers */}
      <Footer
        onNavigate={navigate}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
      />

      {/* WhatsApp Chatbot Redirector & Simulator Modal */}
      <WhatsAppRedirectorModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* Interactive Face / AI Avatar Assistant Modal */}
      <InteractiveFaceModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
      />
    </div>
  );
}
