import React, { useState } from 'react';
import {
  Recycle,
  ShieldCheck,
  Smartphone,
  QrCode,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  MapPin,
  Mail,
  Phone,
  Layers,
  Award,
  Wallet,
  Compass,
  Check,
  LogIn,
  UserPlus,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';
import { getRoleDashboardPath, getRoleDisplayName } from '../../services/auth';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenWhatsApp: () => void;
  onOpenInteractiveFace: () => void;
  currentUser: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenWhatsApp,
  onOpenInteractiveFace,
  currentUser,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('brand');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-xs mb-6 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bringing 90%+ Informal Collectors into the Formal EPR Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display max-w-4xl mx-auto leading-tight">
            The Trusted Digital Chain of Custody for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              E-Waste & EPR Compliance
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ReLoop connects citizens, informal collectors, aggregators, recyclers, and brands into an offline-first verifiable digital ledger. No fake numbers. No unverified credits.
          </p>

          {/* Context-aware CTAs for Single Authenticated User */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            {currentUser ? (
              <>
                <button
                  id="hero-btn-my-dashboard"
                  onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard ({getRoleDisplayName(currentUser.role)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Bot</span>
                </button>

                <button
                  onClick={onOpenInteractiveFace}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 font-bold text-sm border border-indigo-700/60 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Eco Avatar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="hero-btn-login"
                  onClick={() => onNavigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-btn-register"
                  onClick={() => onNavigate('/register')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Register Account</span>
                </button>

                <button
                  onClick={onOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Bot</span>
                </button>

                <button
                  onClick={onOpenInteractiveFace}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 font-bold text-sm border border-indigo-700/60 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Eco Avatar</span>
                </button>
              </>
            )}
          </div>

          {/* Active single session indicator banner */}
          {currentUser && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Active Session: <strong className="text-white">{currentUser.name}</strong> ({getRoleDisplayName(currentUser.role)})
              </span>
            </div>
          )}

          {/* Ecosystem Architecture Strip */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Stakeholder EPR Ecosystem (Role-Isolated Access)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-left">
                <div className="text-emerald-400 font-bold">1. Citizen / User</div>
                <div className="text-[10px] text-slate-400">Book pickup & trace</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-left">
                <div className="text-amber-400 font-bold">2. Informal Collector</div>
                <div className="text-[10px] text-slate-400">Offline SQLite & Smart Route</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-left">
                <div className="text-blue-400 font-bold">3. Recycler / Refurb</div>
                <div className="text-[10px] text-slate-400">Verify weight & circularity</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-left">
                <div className="text-purple-400 font-bold">4. Brand / CPCB</div>
                <div className="text-[10px] text-slate-400">EPR audit & event ledger</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: What is ReLoop? */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Project Overview • Section 1
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display mt-1">
              What is ReLoop?
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              ReLoop is an <strong>offline-first digital platform</strong> that brings informal e-waste collectors into the formal recycling and EPR ecosystem. The main problem is not simply collecting e-waste. The difficult part is making the <strong>informal first-mile collection visible, trusted, verifiable, and economically useful</strong>.
            </p>
          </div>

          {/* Ecosystem Journey Diagram */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
              ReLoop Connects the Entire Chain:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold">
                  1
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Citizen</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Requests pickup via WhatsApp or Web; receives Impact Receipt
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 font-bold">
                  2
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Informal Collector</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Weighs items, snaps photo, operates offline, navigates Smart Route
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center mx-auto mb-2 font-bold">
                  3
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Aggregator Hub</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Scans Batch QR, conducts dock weighing, aggregates materials
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 font-bold">
                  4
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Recycler / Refurb</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Confirms receipt, selects pathway (Refurbish, Recovery, Recycle)
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-bold">
                  5
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Brand / PRO (CPCB)</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Receives tamper-proof EPR credit & CPCB-ready audit documentation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Problem (Crisp & Streamlined) */}
      <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 3 Crisp Problems */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                The Core Challenge • Section 2
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-1">
                Why Legacy E-Waste Tracking Fails
              </h2>
              <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
                Informal collectors handle over 90% of discarded electronics, yet paper receipts and broken reporting cause severe failure points:
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">1. Invisible First-Mile Collection</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Patchy mobile internet and zero formal digital tools leave grassroot collectors untracked and underpaid.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">2. Phantom Weights & Paper Fraud</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Manual log entries without timestamped scale proofs enable fake recycled volumes and counterfeit EPR credits.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">3. Disconnected Audit Trails</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Weight loss during packaging or dismantling breaks chain-of-custody, leaving brands without CPCB audit compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Legacy Assumption: Collected = Recycled</span>
              <span className="font-bold text-rose-600">Audit Failure Rate: High</span>
            </div>
          </div>

          {/* Right: The ReLoop Fix */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                The ReLoop Verifiable Fix
              </div>
              <h3 className="text-lg font-bold font-display text-white mt-3">
                Digital Multi-Stage Verification
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Zero manual estimates. Every handover records physical weight, GPS coordinates, and perceptual photo hashes into an immutable ledger.
              </p>

              <div className="mt-5 space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-amber-400 font-semibold text-[11px]">1. Field Pickup</span>
                  <span className="text-white font-bold">12.4 kg <span className="text-[10px] text-slate-400">(GPS + Hash)</span></span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-blue-400 font-semibold text-[11px]">2. Aggregator Dock</span>
                  <span className="text-white font-bold">11.9 kg <span className="text-[10px] text-slate-400">(-4% verified)</span></span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold text-[11px]">3. Recycler Intake</span>
                  <span className="text-emerald-300 font-black">11.7 kg <span className="text-[10px] text-emerald-400">(CPCB Sealed)</span></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All 3 weigh-ins preserved on the immutable ledger.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Four Pillars (Crisp & Streamlined) */}
      <section id="pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Core Architecture • Section 3
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-1">
            The Four Pillars of ReLoop
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Engineered to connect grassroots collectors with formal EPR compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: ACCESS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">1. Access</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Zero friction onboarding. WhatsApp bot for citizens and offline-first mobile app with voice inputs for collectors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">WhatsApp Bot</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">Offline SQLite</span>
            </div>
          </div>

          {/* Pillar 2: IDENTITY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">2. Identity</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Persistent Digital Waste Passports via single QR-coded batch tags, avoiding single-item labeling fatigue.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">Batch QR Code</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">Digital Passport</span>
            </div>
          </div>

          {/* Pillar 3: TRUST */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">3. Trust</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Automatic GPS tagging, image hashing, scale progression audits, and an append-only cryptographic event ledger.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold">GPS + Image Hash</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">Event Ledger</span>
            </div>
          </div>

          {/* Pillar 4: VALUE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">4. Value</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Empowers collectors with transparent digital wallets, trust ratings, and direct routing to highest paying recyclers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold">Collector Wallet</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">Smart Route</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 & 5: Interactive Chain of Custody */}
      <section id="chain-of-custody" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Layer 2 • The Heart of ReLoop
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-1">
                The Multi-Stage Verification Chain
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect how batch CB-00071 retains all 3 distinct physical measurements on the ledger.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
              <span>Batch ID: CB-00071</span>
              <span>•</span>
              <span>Pickup: PR-1024</span>
            </div>
          </div>

          {/* Stepper with Weight progression */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700">Stage 1: Collection</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono">Rajesh (COL-771)</span>
              </div>
              <div className="text-2xl font-black text-slate-900">12.4 kg</div>
              <p className="text-[11px] text-slate-500">
                Logged with photo hash and GPS (12.9352, 77.6245) at Koramangala residence.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Stage 2: Aggregator</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono">Hub Dock-3</span>
              </div>
              <div className="text-2xl font-black text-slate-900">11.9 kg</div>
              <p className="text-[11px] text-slate-500">
                QR scanned at receiving dock. Weight variance -4.0% within standard packaging tolerances.
              </p>
            </div>

            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800">Stage 3: Recycler</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">GreenTech REC-884</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">11.7 kg</div>
              <p className="text-[11px] text-emerald-800">
                All 3 values remain stored. 11.7 kg verified credit granted for CPCB compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 12: Smart Route Innovation */}
      <section id="innovation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              ReLoop Breakthrough • Smart Circular Route
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
              Smart Route Engine: Maximizing Collector Recovery Value
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              The core of ReLoop’s grassroots economic model: rather than informal kabadiwalas getting exploited by middlemen, ReLoop algorithmically matches them with verified recyclers offering the highest payouts, shortest transit distance, and guaranteed CPCB compliance.
            </p>
          </div>

          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden text-xs">
            <div className="p-4 bg-slate-800 border-b border-slate-700 font-bold text-slate-300 flex justify-between">
              <span>Smart Route Recycler Matching Engine (Live Benchmark)</span>
              <span className="text-emerald-400 font-mono">Status: Optimized</span>
            </div>
            <div className="divide-y divide-slate-700/80 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div>
                  <div className="font-bold text-white text-sm">Recycler A (GreenTech Eco-Park)</div>
                  <div className="text-slate-400 text-[11px]">8 km • Trust Score: 96/100 • Accepting All Categories</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400 font-mono">₹4,200</div>
                    <div className="text-[10px] text-slate-400">Indicative Payout</div>
                  </div>
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full font-black text-xs">
                    🏆 Best
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
                <div>
                  <div className="font-bold text-white text-sm">Recycler B (CleanEarth Solutions)</div>
                  <div className="text-slate-400 text-[11px]">5 km • Trust Score: 91/100 • Peak Capacity (94%)</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-300 font-mono">₹3,700</div>
                    <div className="text-[10px] text-slate-400">Indicative Payout</div>
                  </div>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full font-semibold text-xs">
                    Alternative
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
                <div>
                  <div className="font-bold text-white text-sm">Recycler C (Apex Metal Scrap)</div>
                  <div className="text-slate-400 text-[11px]">12 km • Trust Score: 82/100 • Limited Intake</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-300 font-mono">₹4,500</div>
                    <div className="text-[10px] text-slate-400">Indicative Payout</div>
                  </div>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full font-semibold text-xs">
                    Further away
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Contact & EPR Inquiries */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Get in Touch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display mt-1">
              Connect with the ReLoop Network
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Whether you are an electronics brand seeking verifiable EPR compliance, a municipality looking for informal collector integration, or a recycler wanting to join our verified exchange.
            </p>

            <div className="mt-6 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Headquarters:</span> Koramangala 4th Block, Bengaluru, KA 560034
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Compliance Inquiries:</span> compliance@reloop.eco
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Helpline / WhatsApp:</span> +91 98765 43210
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={onOpenWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Open WhatsApp Support</span>
              </button>
              <button
                onClick={onOpenInteractiveFace}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Ask Eco Voice Bot</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
              Send an Inquiry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Our EPR solutions team will respond within 24 hours.
            </p>

            {contactSuccess && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your inquiry has been logged in our partnership pipeline.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email:</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. ramesh@electronics-brand.in"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">I Represent:</label>
                <select
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="brand">Brand / Producer Seeking EPR Fulfillment</option>
                  <option value="recycler">Authorized Recycler / Refurbisher</option>
                  <option value="aggregator">E-Waste Aggregator / Hub</option>
                  <option value="collector">Informal Collector Network / NGO</option>
                  <option value="citizen">Citizen E-Waste Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message:</label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us about your estimated volumes or onboarding timeline..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-extrabold text-slate-800 font-display">ReLoop</span> — E-Waste Circularity & EPR Platform © 2026.
        </div>
        <div className="flex gap-4">
          <span>Digital Transparency Receipt</span>
          <span>•</span>
          <span>Compliance-Ready Reports</span>
          <span>•</span>
          <span>Offline SQLite Protocol</span>
        </div>
      </footer>
    </div>
  );
};
