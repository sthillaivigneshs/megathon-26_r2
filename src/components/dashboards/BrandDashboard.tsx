import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  Layers,
  TrendingUp,
  Clock,
  Printer,
  Building,
  UserCheck,
  Award,
  Calendar,
  Sparkles,
  BarChart3,
  UserCog
} from 'lucide-react';
import { User, EventLedgerItem, RiskAnomaly, EPRObligationStats } from '../../types';
import {
  getStoredEvents,
  getStoredRisks,
  updateRiskStatus,
  INITIAL_EPR_STATS,
} from '../../services/mockData';
import { DashboardTaskHeader } from '../common/DashboardTaskHeader';
import { DashboardSidebarLayout, NavSectionItem } from '../common/DashboardSidebarLayout';
import { BrandProfileSettings } from './brand/BrandProfileSettings';

interface BrandDashboardProps {
  currentUser: User;
}

type BrandTab = 'epr_targets' | 'risk_anomaly' | 'ledger' | 'cpcb_report' | 'profile';

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ currentUser: initialCurrentUser }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  React.useEffect(() => {
    setCurrentUser(initialCurrentUser);
  }, [initialCurrentUser]);

  const [events, setEvents] = useState<EventLedgerItem[]>(getStoredEvents());
  const [risks, setRisks] = useState<RiskAnomaly[]>(getStoredRisks());
  const [stats, setStats] = useState<EPRObligationStats>(INITIAL_EPR_STATS);
  const [activeTab, setActiveTab] = useState<BrandTab>('epr_targets');
  const [showReportModal, setShowReportModal] = useState(false);

  const flaggedRisksCount = risks.filter((r) => r.status === 'flagged').length;

  const handleResolveRisk = (riskId: string, status: 'cleared' | 'rejected') => {
    const notes =
      status === 'cleared'
        ? 'Reviewed and approved by CPCB compliance officer.'
        : 'Rejected due to weight mismatch verification failure.';
    updateRiskStatus(riskId, status, notes);
    setRisks(getStoredRisks());
  };

  const brandNavItems: NavSectionItem[] = [
    {
      id: 'risk_anomaly',
      label: 'Audit Flags & Discrepancies',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: flaggedRisksCount > 0 ? `${flaggedRisksCount} flags` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'service',
      description: 'Image hash, GPS jumps, and weight swing review',
    },
    {
      id: 'cpcb_report',
      label: 'CPCB-Ready Compliance Report',
      icon: <FileText className="w-4 h-4" />,
      category: 'service',
      description: 'Form 1(A) statutory filing report generator',
    },
    {
      id: 'epr_targets',
      label: 'EPR Targets & Obligations',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: `${stats.percentageFulfillment}%`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'analysis',
      description: 'Annual statutory progress & informal attribution',
    },
    {
      id: 'ledger',
      label: 'Cryptographic Event Ledger',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: events.length,
      badgeColor: 'bg-purple-100 text-purple-800',
      category: 'analysis',
      description: 'Immutable append-only chain of custody events',
    },
    {
      id: 'profile',
      label: 'Brand & CPCB Profile',
      icon: <UserCog className="w-4 h-4" />,
      category: 'account',
      description: 'CPCB Reg No, GSTIN, Producer Type & Compliance Officer',
    },
  ];

  const getTaskHeaderInfo = (): {
    title: string;
    description: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
  } => {
    switch (activeTab) {
      case 'epr_targets':
        return {
          title: 'EPR Targets & Statutory Obligations',
          description: 'Monitor annual Extended Producer Responsibility target fulfillment under E-Waste (Management) Rules.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats.percentageFulfillment}% Fulfilled
            </span>
          ),
          actions: (
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Form 1(A)</span>
            </button>
          ),
        };
      case 'risk_anomaly':
        return {
          title: 'Audit Flags & Discrepancies',
          description: 'AI-driven anomaly detection across GPS jumps, weight mismatches, and duplicate image hashes.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {flaggedRisksCount} Active Flags
            </span>
          ),
        };
      case 'cpcb_report':
        return {
          title: 'CPCB-Ready Compliance Report',
          description: 'Form 1(A) statutory filing report with cryptographically verified chain of custody evidence.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              CPCB Certified
            </span>
          ),
        };
      case 'ledger':
        return {
          title: 'Cryptographic Event Ledger',
          description: 'Immutable append-only chain of custody events tracking each e-waste batch from doorstep to certified recycler.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {events.length} Events Logged
            </span>
          ),
        };
      case 'profile':
        return {
          title: 'Brand & CPCB Registration Profile',
          description: 'Manage official PRO/CPCB registration credentials, producer categories, authorized officer details, and GSTIN.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {currentUser.cpcbRegNumber || 'PRO-302'}
            </span>
          ),
        };
      default:
        return {
          title: 'Brand & CPCB Dashboard',
          description: 'Extended Producer Responsibility monitoring and regulatory compliance',
        };
    }
  };

  const headerInfo = getTaskHeaderInfo();

  return (
    <DashboardSidebarLayout
      user={currentUser}
      navItems={brandNavItems}
      activeId={activeTab}
      onChangeId={(id) => setActiveTab(id as BrandTab)}
      accentColor="purple"
    >
      <div className="space-y-6">
        {/* Dynamic Task & Data Header (Replacing bulky static profile card) */}
        <DashboardTaskHeader
          user={currentUser}
          title={headerInfo.title}
          description={headerInfo.description}
          badge={headerInfo.badge}
          actions={headerInfo.actions}
        />

      {/* 3. Segregated Feature Views */}

      {/* VIEW 1: EPR TARGETS & OBLIGATIONS */}
      {activeTab === 'epr_targets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Progress Bar & Category Breakdown */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">
                EPR Target Fulfillment Progress: {stats.verifiedFulfillmentKg.toLocaleString()} / {stats.targetKg.toLocaleString()} kg
              </span>
              <span className="font-black text-emerald-600 text-sm sm:text-base">
                {stats.percentageFulfillment}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${stats.percentageFulfillment}%` }}
              />
            </div>

            {/* Category Breakdown Cards */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Mandatory Material Categories Breakdown (kg):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 truncate">{cat.name}</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">
                      {cat.kg.toLocaleString()} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* First-Mile Attribution Highlight */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Verifiable First-Mile Informal Sector Integration</span>
            </div>
            <p className="text-xs text-purple-950 leading-relaxed">
              <strong>{stats.informalChannelKg.toLocaleString()} kg</strong> (38.4% of your total fulfillment) was sourced directly from informal waste pickers and authorized collectors using ReLoop's offline-first custody app. This satisfies both CPCB statutory targets and brand ESG inclusion goals.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: RISK & ANOMALY DETECTION */}
      {activeTab === 'risk_anomaly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Automated Rule-Based Audit Flags</span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                Discrepancy & Fraud Prevention Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detects duplicate photos via perceptual image hashing, unusual weight swings (&gt;10%), and GPS jumps without blackbox complexity.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {risks.map((risk, idx) => (
              <div
                key={`${risk.id}-${idx}`}
                className={`p-4 rounded-xl border transition-all ${
                  risk.status === 'flagged'
                    ? 'bg-amber-50/60 border-amber-300'
                    : risk.status === 'cleared'
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-rose-50/60 border-rose-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                      Batch: {risk.batchId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        risk.status === 'flagged'
                          ? 'bg-amber-200 text-amber-900'
                          : risk.status === 'cleared'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {risk.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {risk.description}
                    </span>
                  </div>

                  {risk.status === 'flagged' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveRisk(risk.id, 'cleared')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Clear Flag
                      </button>
                      <button
                        onClick={() => handleResolveRisk(risk.id, 'rejected')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Batch
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>Recorded: <strong className="font-mono text-slate-800">{risk.recordedValue}</strong></div>
                  <div>Expected: <strong className="font-mono text-slate-800">{risk.expectedValue}</strong></div>
                  <div>Detected: {new Date(risk.detectedAt).toLocaleString()}</div>
                </div>

                {risk.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                    Resolution Note: {risk.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: IMMUTABLE EVENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Event Ledger (Heart of ReLoop)
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
              Cryptographic Append-Only Audit Trail
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Answers Who, What, When, Where, Which batch, and Which role with zero overwrites.
            </p>
          </div>

          <div className="space-y-3">
            {events.map((evt, idx) => (
              <div
                key={`${evt.id}-${idx}`}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                      {evt.eventCode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      [{evt.batchId}]
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{evt.details}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Actor: <strong className="text-slate-700">{evt.actorName}</strong></span>
                    <span>•</span>
                    <span>{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {evt.metadata && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 space-y-0.5 shrink-0 sm:max-w-xs">
                    {Object.entries(evt.metadata).map(([k, v]) => (
                      <div key={k} className="truncate">
                        {k}: <strong>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: CPCB-READY COMPLIANCE REPORT */}
      {activeTab === 'cpcb_report' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Statutory Regulatory Filing
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                CPCB Form 1(A) Compliance-Ready Audit Report
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically pre-filled and formatted for submission to the Central Pollution Control Board (CPCB) portal.
              </p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Preview & Print Full Report</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800">Report Reference:</span>
              <span className="font-mono font-bold text-slate-900">RELOOP-EPR-2026-0910-B9</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block">Total Target:</span>
                <span className="font-black text-slate-900 text-sm">10,000 kg</span>
              </div>
              <div>
                <span className="text-slate-500 block">Verified Recycled:</span>
                <span className="font-black text-emerald-600 text-sm">7,420 kg (74.2%)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Informal Sourced:</span>
                <span className="font-black text-purple-700 text-sm">2,850 kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: BRAND & CPCB PROFILE UPDATE */}
      {activeTab === 'profile' && (
        <BrandProfileSettings
          currentUser={currentUser}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
          onNavigateTab={(tab) => setActiveTab(tab as BrandTab)}
        />
      )}

      {/* CPCB-Ready Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Form 1(A) • Extended Producer Responsibility Audit Verification
              </div>
              <h3 className="text-xl font-black text-slate-900 font-display mt-1">
                COMPLIANCE-READY / CPCB-READY REPORT
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generated via ReLoop Digital Chain-of-Custody Architecture
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 font-mono text-[11px] text-slate-800 rounded font-semibold">
                Report Reference: RELOOP-EPR-2026-0910-B9
              </div>
            </div>

            {/* Report Content Table */}
            <div className="space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Brand / PRO Entity</div>
                  <div className="font-bold text-slate-900">EcoCorp Electronics Ltd (PRO-302)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Reporting Period</div>
                  <div className="font-bold text-slate-900">FY 2025-2026 (Q4 Complete)</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  1. Quantitative Fulfillment Summary:
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 text-left text-xs min-w-[450px]">
                    <thead className="bg-slate-100 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Material Category</th>
                        <th className="p-2">Obligation (kg)</th>
                        <th className="p-2">Verified Recycled (kg)</th>
                        <th className="p-2">Fulfillment %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-2">IT & Telecom (ITEW1 to ITEW16)</td>
                        <td className="p-2">5,500</td>
                        <td className="p-2">4,100</td>
                        <td className="p-2 text-emerald-600 font-bold">74.5%</td>
                      </tr>
                      <tr>
                        <td className="p-2">Consumer Electronics (CEEW1 to CEEW5)</td>
                        <td className="p-2">3,000</td>
                        <td className="p-2">2,200</td>
                        <td className="p-2 text-emerald-600 font-bold">73.3%</td>
                      </tr>
                      <tr>
                        <td className="p-2">Batteries & Lead Acid</td>
                        <td className="p-2">1,500</td>
                        <td className="p-2">1,120</td>
                        <td className="p-2 text-emerald-600 font-bold">74.6%</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-2">Total Verified Fulfillment</td>
                        <td className="p-2">10,000</td>
                        <td className="p-2">7,420</td>
                        <td className="p-2 text-emerald-700">74.2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  2. First-Mile Informal Collector Attribution:
                </span>
                <p className="text-slate-600 text-[11px]">
                  <strong>2,850 kg (38.4% of total volume)</strong> was collected directly through certified informal collectors using ReLoop's offline-first mobile app with GPS tagging and tamper-evident digital scales.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  3. Circularity Pathways Applied:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-blue-700">Refurbished</div>
                    <div className="font-mono">1,840 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-indigo-700">Component Recovery</div>
                    <div className="font-mono">1,210 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-emerald-700">Materials Recycling</div>
                    <div className="font-mono">4,120 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-purple-700">Direct Reuse</div>
                    <div className="font-mono">250 kg</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <strong>Audit Disclaimer:</strong> This document is labeled as a "Compliance-ready / CPCB-ready report" based on digitally verified chain of custody events. It is designed to be submitted alongside formal CPCB portal filings.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowReportModal(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardSidebarLayout>
  );
};
