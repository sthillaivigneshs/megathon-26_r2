import React from 'react';
import {
  Recycle,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenWhatsApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenWhatsApp }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Top Footer Banner / Trust Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>CPCB-Ready Verifiable Digital Chain of Custody</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>EPR Rules (2022) Compliant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Append-Only Ledger Integrity</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero-Landfill Circularity</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Recycle className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-display">
                  Re<span className="text-emerald-400">Loop</span>
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded">
                  EPR Chain
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering citizens, informal waste collectors, authorized recyclers, and electronics brands through an offline-first digital chain of custody. Driving circular economy outcomes with immutable scale receipts and automated statutory compliance.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Bengaluru Innovation Hub • Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>National E-Waste Toll-Free: 1800-RELOOP-ECO</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>compliance@reloop.eco</span>
              </div>
            </div>
          </div>

          {/* Col 3: Role Portals */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Role Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate?.('/dashboard/citizen')}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Citizen Doorstep Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('/dashboard/collector')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Informal Collector Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('/dashboard/recycler')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Authorized Recycler Dock
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('/dashboard/brand-cpcb')}
                  className="hover:text-purple-400 transition-colors text-left cursor-pointer"
                >
                  Brand & CPCB Compliance
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWhatsApp}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer flex items-center gap-1 text-emerald-400/90 font-medium"
                >
                  <span>WhatsApp Booking Bot</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services & Workflows */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Services & Tools
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Doorstep E-Waste Pickup
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Field Digital Scale Weight Capture
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Perceptual Hash Photo Proof
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Smart Route Optimization
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Circularity AI Assistant
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Instant UPI Citizen Rewards
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Regulatory & Statutory */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Statutory & Governance
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  CPCB E-Waste Rules 2022
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Form 1(A) Audit Verification
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Cryptographic Audit Ledger
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Weight Mismatch Anomaly Rules
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Privacy Policy & DPDP Act
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Terms of Service & Licensing
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-800 bg-slate-950 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <p>
              &copy; {currentYear} <strong className="text-slate-300">ReLoop Technologies Inc.</strong> All rights reserved.
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Statutory circularity system registered under Central Pollution Control Board (CPCB) Producer Responsibility Organization guidelines.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ledger Synchronized
            </span>
            <span>Version 2.4.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
