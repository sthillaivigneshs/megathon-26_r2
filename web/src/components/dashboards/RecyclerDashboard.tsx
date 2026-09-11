import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  FileCheck2,
  AlertCircle,
  Package,
  Search,
  CheckCircle,
  Boxes,
  Award,
  Calendar,
  FileText
} from 'lucide-react';
import { User, CollectionBatch, CircularityPathway } from '../../types';
import {
  getStoredBatches,
  saveBatch,
  addEvent,
} from '../../services/mockData';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { RoleProfileCard } from '../common/RoleProfileCard';
import { DashboardSidebarLayout, NavSectionItem } from '../common/DashboardSidebarLayout';

interface RecyclerDashboardProps {
  currentUser: User;
}

type RecyclerTab = 'receiving' | 'assistant' | 'inventory' | 'compliance';

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({ currentUser }) => {
  const [batches, setBatches] = useState<CollectionBatch[]>(getStoredBatches());
  const [selectedBatch, setSelectedBatch] = useState<CollectionBatch | null>(
    batches.length > 0 ? batches[0] : null
  );
  const [activeTab, setActiveTab] = useState<RecyclerTab>('receiving');
  const [searchBatchId, setSearchBatchId] = useState('');
  const [receivedWeight, setReceivedWeight] = useState('11.8');
  const [selectedPathway, setSelectedPathway] = useState<CircularityPathway>('COMPONENT RECOVERY');
  const [processingNotes, setProcessingNotes] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // AI Assistant state
  const [aiItemType, setAiItemType] = useState('Laptop');
  const [aiAgeYears, setAiAgeYears] = useState('4');
  const [aiCondition, setAiCondition] = useState('Minor screen scratch, boots normally, battery holds 60% charge');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    pathway: CircularityPathway;
    confidence: string;
    reusableComponents: string[];
    notes: string;
  } | null>(null);

  const handleSearchBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = batches.find(
      (b) => b.id.toLowerCase() === searchBatchId.trim().toLowerCase()
    );
    if (found) {
      setSelectedBatch(found);
      setReceivedWeight(found.aggregatorWeightKg ? String(found.aggregatorWeightKg) : '11.8');
    } else {
      alert(`Batch ID "${searchBatchId}" not found in receiving queue.`);
    }
  };

  const handleConfirmProcessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const finalWeightNum = parseFloat(receivedWeight) || 11.8;

    // Update batch in storage
    const updatedBatch: CollectionBatch = {
      ...selectedBatch,
      recyclerWeightKg: finalWeightNum,
      circularityPath: selectedPathway,
      status: 'processed',
      notes: processingNotes,
    };

    saveBatch(updatedBatch);

    // Event 004: Recycler Received
    addEvent({
      eventCode: 'EVENT 004',
      title: 'Recycler Received and Weighed Batch',
      actorRole: 'recycler',
      actorName: currentUser.name,
      batchId: selectedBatch.id,
      timestamp: new Date().toISOString(),
      details: `Recycler dock scale confirmed ${finalWeightNum} kg. Previous weights: Collector ${selectedBatch.declaredWeightKg} kg, Aggregator ${selectedBatch.aggregatorWeightKg || '11.9'} kg.`,
      metadata: { scaleWeightKg: finalWeightNum },
    });

    // Event 005: Circularity Outcome Recorded
    addEvent({
      eventCode: 'EVENT 005',
      title: 'Circularity Outcome Classified',
      actorRole: 'recycler',
      actorName: currentUser.name,
      batchId: selectedBatch.id,
      timestamp: new Date().toISOString(),
      details: `Batch routed to "${selectedPathway}". Notes: ${processingNotes || 'Verified non-destructive recovery'}.`,
      metadata: { pathway: selectedPathway },
    });

    // Event 006: Brand EPR Credit released
    addEvent({
      eventCode: 'EVENT 006',
      title: 'EPR Credit Released to Producer',
      actorRole: 'system',
      actorName: 'ReLoop Ledger Smart Engine',
      batchId: selectedBatch.id,
      timestamp: new Date().toISOString(),
      details: `Digitally minted ${finalWeightNum} kg EPR credit attribution to EcoCorp Electronics Ltd.`,
      metadata: { eprKg: finalWeightNum },
    });

    setBatches(getStoredBatches());
    setSelectedBatch(updatedBatch);
    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 5000);
  };

  const runAiCircularityCheck = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      const age = parseInt(aiAgeYears, 10) || 4;
      if (aiItemType === 'Laptop' && age <= 5) {
        setAiResult({
          pathway: 'REFURBISH',
          confidence: '94%',
          reusableComponents: ['Motherboard', '16GB DDR4 RAM', '512GB NVMe SSD', 'FHD Display Panel'],
          notes: 'Device is under 5 years old and boots properly. Candidate for clean OS re-install and secondary educational donation rather than crushing.',
        });
      } else if (aiItemType === 'Mobile') {
        setAiResult({
          pathway: 'COMPONENT RECOVERY',
          confidence: '89%',
          reusableComponents: ['Camera Module', 'OLED Display (OEM)', 'Microphone & Speaker Assbly'],
          notes: 'High value OEM components intact. Harvester recommended before aluminum frame smelting.',
        });
      } else {
        setAiResult({
          pathway: 'RECYCLE',
          confidence: '96%',
          reusableComponents: ['Copper Motor Coils', 'ABS Plastic Pellets', 'Steel Chassis'],
          notes: 'Item obsolete or uneconomical to repair. Direct to certified dry-shredder and eddy-current sorter.',
        });
      }
    }, 1200);
  };

  const recyclerNavItems: NavSectionItem[] = [
    {
      id: 'receiving',
      label: 'Batch Receiving & Verification',
      icon: <QrCode className="w-4 h-4" />,
      badge: batches.filter((b) => b.status !== 'processed').length > 0
        ? `${batches.filter((b) => b.status !== 'processed').length} queue`
        : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
      category: 'service',
      description: 'Scale audit, weight comparison, and EPR release',
    },
    {
      id: 'assistant',
      label: 'Circularity AI Assistant',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'service',
      description: 'Reuse, Refurbish vs. Recovery evaluation',
    },
    {
      id: 'inventory',
      label: 'Material Inventory Breakdown',
      icon: <Boxes className="w-4 h-4" />,
      badge: '127 kg',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      category: 'analysis',
      description: 'Throughput and stored scrap category weights',
    },
    {
      id: 'compliance',
      label: 'EPR Credit Releases & Audit',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: 'CPCB Ready',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'analysis',
      description: 'Issued certificates & brand compliance records',
    },
  ];

  return (
    <DashboardSidebarLayout
      user={currentUser}
      navItems={recyclerNavItems}
      activeId={activeTab}
      onChangeId={(id) => setActiveTab(id as RecyclerTab)}
      accentColor="blue"
    >
      <div className="space-y-6">
        {/* 1. Basic Details of the Role Person (Role Profile Card) */}
        <RoleProfileCard
          user={currentUser}
          subtitle="Authorized formal processing facility enforcing circularity hierarchy: Reuse, Refurbish, Recover, and Recycle with immutable scale receipts."
          customDetails={[
            { label: 'Facility License', value: 'CPCB-REC-2026-BLR-884', icon: <Building className="w-3.5 h-3.5 text-slate-400" /> },
            { label: 'Dock Location', value: 'Peenya Industrial Area, Phase II, Bengaluru', icon: <Scale className="w-3.5 h-3.5 text-slate-400" /> },
          ]}
          badges={[
            {
              label: 'Receiving Dock Status',
              value: 'Active & Accepting',
              subtext: 'Weighbridge calibrated today',
              color: 'emerald',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
            },
            {
              label: 'Incoming Batches Queue',
              value: batches.length,
              subtext: 'Awaiting scale verification',
              color: 'blue',
              icon: <Package className="w-4 h-4 text-blue-600" />,
            },
            {
              label: 'Circularity Compliance',
              value: '99.2%',
              subtext: 'Zero-Landfill certified',
              color: 'purple',
              icon: <Layers className="w-4 h-4 text-purple-600" />,
            },
            {
              label: 'EPR Credits Minted',
              value: '4,120 kg',
              subtext: 'Released to registered brands',
              color: 'amber',
              icon: <Award className="w-4 h-4 text-amber-600" />,
            },
          ]}
        />

      {/* Success Notification */}
      {showSuccessBanner && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-md flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-xs font-semibold">
            Batch {selectedBatch?.id} successfully verified and circularity outcome recorded! Event 004, 005, and 006 appended to immutable ledger.
          </div>
        </div>
      )}

      {/* 3. Segregated Feature Views */}

      {/* VIEW 1: BATCH RECEIVING & VERIFICATION */}
      {activeTab === 'receiving' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: QR Lookup & Queue */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Batch Scanner / Lookup
                </h3>
              </div>

              <form onSubmit={handleSearchBatch} className="flex gap-2">
                <input
                  type="text"
                  value={searchBatchId}
                  onChange={(e) => setSearchBatchId(e.target.value)}
                  placeholder="e.g. CB-00071"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Scan
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Receiving Queue ({batches.length}):
                </span>
                <div className="space-y-2">
                  {batches.map((batch, idx) => (
                    <button
                      key={`${batch.id}-${idx}`}
                      onClick={() => {
                        setSelectedBatch(batch);
                        setReceivedWeight(batch.aggregatorWeightKg ? String(batch.aggregatorWeightKg) : '11.8');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedBatch?.id === batch.id
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="font-mono text-slate-900">{batch.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 uppercase text-slate-700">
                          {batch.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                        <span>Collector: {batch.collectorName}</span>
                        <span className="font-bold text-slate-800">{batch.declaredWeightKg} kg</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Batch Verification & Form */}
          <div className="lg:col-span-2">
            {selectedBatch ? (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold font-mono text-slate-900">
                        {selectedBatch.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-800">
                        {selectedBatch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Origin Citizen Request: <strong className="font-mono">{selectedBatch.pickupRequestId}</strong>
                    </p>
                  </div>

                  <QRCodeSVG value={selectedBatch.id} size={48} />
                </div>

                {/* Weight Progression Audit Trail */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Chain of Custody Weight Progression (Audit Trail)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-[11px]">1. Collector Recorded</div>
                      <div className="text-lg font-black text-slate-900">
                        {selectedBatch.declaredWeightKg} kg
                      </div>
                      <div className="text-[10px] text-slate-400">At field pickup</div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-[11px]">2. Aggregator Verified</div>
                      <div className="text-lg font-black text-slate-900">
                        {selectedBatch.aggregatorWeightKg || '11.9'} kg
                      </div>
                      <div className="text-[10px] text-slate-400">At aggregation dock</div>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="text-indigo-900 font-semibold text-[11px]">3. Recycler Scale</div>
                      <div className="text-lg font-black text-indigo-700">
                        {selectedBatch.recyclerWeightKg || receivedWeight} kg
                      </div>
                      <div className="text-[10px] text-indigo-600">Final verified weight</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    All three events are recorded cryptographically on the append-only ledger. No weight is overwritten.
                  </p>
                </div>

                {/* Circularity Pathways Selector */}
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Select Final Circularity Pathway
                    </span>
                    <p className="text-xs text-slate-500">
                      ReLoop enforces circularity: Prioritize reuse and parts recovery before shredding.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['REUSE', 'REFURBISH', 'COMPONENT RECOVERY', 'RECYCLE'] as CircularityPathway[]).map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setSelectedPathway(path)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          selectedPathway === path
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {path}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recycler Processing Form */}
                <form onSubmit={handleConfirmProcessing} className="space-y-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Received Scale Weight (kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={receivedWeight}
                        onChange={(e) => setReceivedWeight(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Technician / Line Notes:
                      </label>
                      <input
                        type="text"
                        value={processingNotes}
                        onChange={(e) => setProcessingNotes(e.target.value)}
                        placeholder="e.g. Dismantled RAM/SSD; housing to pelletizer"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Confirm Receipt & Release EPR Credit</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
                Select a batch from the queue or search by ID on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CIRCULARITY AI ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Circularity Pathway AI Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Analyzes device condition & recommends REUSE / REFURBISH / COMPONENT RECOVERY / RECYCLE.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Device Type:</label>
              <select
                value={aiItemType}
                onChange={(e) => setAiItemType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Laptop">Laptop (ThinkPad, Dell, MacBook)</option>
                <option value="Mobile">Smartphone (Android, iPhone)</option>
                <option value="Printer">Laser / Inkjet Printer</option>
                <option value="Television / Screen">LED Display / Television</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Age (Years):</label>
              <input
                type="number"
                value={aiAgeYears}
                onChange={(e) => setAiAgeYears(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Physical Condition:</label>
              <input
                type="text"
                value={aiCondition}
                onChange={(e) => setAiCondition(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={runAiCircularityCheck}
            disabled={aiLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiLoading ? 'Analyzing Specs & Hardware...' : 'Run Circularity AI Analysis'}</span>
          </button>

          {aiResult && (
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  AI Recommendation:{' '}
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded uppercase font-black text-xs">
                    {aiResult.pathway}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">Confidence: {aiResult.confidence}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Reusable Components Recoverable:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.reusableComponents.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-md text-[11px] font-semibold"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 pt-2 border-t border-indigo-200/60">
                {aiResult.notes}
              </p>

              <p className="text-[10px] text-slate-400 italic">
                * Note: AI provides an engineering recommendation. Final EPR eligibility is governed by verified scale receipts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MATERIAL INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Facility Downstream Storage
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Segregated Material Inventory Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current inventory stored at Peenya warehouse awaiting processing and smelting.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-700 font-semibold">Mobile Phones & Handsets:</span>
              <span className="font-extrabold text-slate-900 text-sm">42 kg</span>
            </div>
            <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-700 font-semibold">Laptops & Personal Computers:</span>
              <span className="font-extrabold text-slate-900 text-sm">31 kg</span>
            </div>
            <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-700 font-semibold">PCBs / Circuit Boards:</span>
              <span className="font-extrabold text-slate-900 text-sm">18 kg</span>
            </div>
            <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-700 font-semibold">Lithium-Ion Batteries:</span>
              <span className="font-extrabold text-amber-700 text-sm">9 kg (Hazard Isolated)</span>
            </div>
            <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-700 font-semibold">Copper Cables & Wiring:</span>
              <span className="font-extrabold text-slate-900 text-sm">27 kg</span>
            </div>
          </div>

          <div className="pt-2 text-right">
            <span className="text-xs text-slate-500">Total Material In Stock: </span>
            <span className="text-base font-black text-slate-900">127 kg</span>
          </div>
        </div>
      )}

      {/* VIEW 4: EPR CREDIT RELEASES & COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Layer 3 • Regulatory Fulfillment
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Issued EPR Credit Receipts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Batches formally received and verified by GreenTech Recyclers generating official compliance credits for brand producers.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-slate-900">CERT-EPR-2026-0089</div>
                <div className="text-[11px] text-slate-500">EcoCorp Electronics Ltd • 11.8 kg • Recycled</div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                CPCB VERIFIED
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-slate-900">CERT-EPR-2026-0074</div>
                <div className="text-[11px] text-slate-500">Apex Tech Global • 24.5 kg • Component Recovery</div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                CPCB VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardSidebarLayout>
  );
};
