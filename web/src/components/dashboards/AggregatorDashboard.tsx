import React, { useState } from 'react';
import { User, CollectionBatch, RecyclerPartner, CircularityPathway } from '../../types';
import { INITIAL_BATCHES, INITIAL_RECYCLER_PARTNERS } from '../../services/mockData';
import { DashboardSidebarLayout, NavSectionItem } from '../common/DashboardSidebarLayout';
import { 
  Building2, 
  Scale, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck, 
  Sparkles, 
  MapPin, 
  Truck, 
  Boxes, 
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface AggregatorDashboardProps {
  currentUser: User;
}

export const AggregatorDashboard: React.FC<AggregatorDashboardProps> = ({ currentUser }) => {
  const [batches, setBatches] = useState<CollectionBatch[]>(INITIAL_BATCHES);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(INITIAL_BATCHES[0]?.id || 'CB-00071');
  const [scaleWeight, setScaleWeight] = useState<string>('11.9');
  const [selectedPathway, setSelectedPathway] = useState<CircularityPathway>('RECYCLE');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('rp-1');
  const [activeTab, setActiveTab] = useState<string>('dock');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || batches[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReceiveDock = (batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          status: 'aggregator_verified' as const,
          aggregatorWeightKg: parseFloat(scaleWeight) || b.declaredWeightKg
        };
      }
      return b;
    }));
    showToast(`Batch ${batchId} received at Aggregator Dock!`);
  };

  const handleVerifyWeightAndSort = (batchId: string) => {
    const w = parseFloat(scaleWeight) || 11.9;
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          aggregatorWeightKg: w,
          circularityPath: selectedPathway,
          status: 'aggregator_verified' as const
        };
      }
      return b;
    }));
    showToast(`Batch ${batchId} verified at ${w} kg & routed for ${selectedPathway}!`);
  };

  const totalInventoryKg = batches.reduce((acc, b) => acc + (b.aggregatorWeightKg || b.declaredWeightKg || 0), 0);
  const incomingCount = batches.filter(b => b.status === 'collected').length;
  const verifiedCount = batches.filter(b => b.status === 'aggregator_verified').length;

  const navItems: NavSectionItem[] = [
    {
      id: 'dock',
      label: 'Dock Scale & Verification',
      icon: <Scale className="w-4 h-4" />,
      category: 'service',
      badge: incomingCount > 0 ? incomingCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'inventory',
      label: 'Hub Inventory',
      icon: <Boxes className="w-4 h-4" />,
      category: 'service',
      badge: `${totalInventoryKg.toFixed(0)} kg`,
    },
    {
      id: 'routing',
      label: 'Smart Route Dispatch',
      icon: <Truck className="w-4 h-4" />,
      category: 'analysis',
      badge: 'Circularity',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <DashboardSidebarLayout
      user={currentUser}
      navItems={navItems}
      activeId={activeTab}
      onChangeId={setActiveTab}
      accentColor="blue"
    >
      <div className="space-y-6">
        {/* Header Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Hub Inventory</p>
              <p className="text-2xl font-bold text-slate-900">{totalInventoryKg.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kg</span></p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Dock Inbound</p>
              <p className="text-2xl font-bold text-slate-900">{incomingCount} <span className="text-xs text-slate-400 font-normal">batches</span></p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Scale Verified</p>
              <p className="text-2xl font-bold text-slate-900">{verifiedCount} <span className="text-xs text-slate-400 font-normal">batches</span></p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Compliance State</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Non-repudiable
              </p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-2xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active Tab: Dock Scale & Verification */}
        {activeTab === 'dock' && selectedBatch && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batch Queue */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center justify-between">
                <span>Dock Inbound Queue</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                  {batches.length} Batches
                </span>
              </h3>
              <div className="space-y-2">
                {batches.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBatchId(b.id);
                      setScaleWeight(b.aggregatorWeightKg ? String(b.aggregatorWeightKg) : String(b.declaredWeightKg));
                    }}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      selectedBatchId === b.id
                        ? 'bg-blue-50/70 border-blue-500 text-blue-950'
                        : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono font-bold text-sm text-blue-600">{b.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        b.status === 'aggregator_verified' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {b.status === 'aggregator_verified' ? 'Verified' : 'At Dock'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Collector: {b.collectorName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Declared: <span className="text-slate-900 font-semibold">{b.declaredWeightKg} kg</span>
                      {b.aggregatorWeightKg && (
                        <span> • Dock Scale: <span className="text-emerald-600 font-semibold">{b.aggregatorWeightKg} kg</span></span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Central Scale & Verification Form */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Dock Verification & Weighing: {selectedBatch.id}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Origin Pickup: {selectedBatch.pickupRequestId} • Collector: {selectedBatch.collectorName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Hazard Status</span>
                  <p className="text-sm font-semibold text-emerald-600">{selectedBatch.hazardStatus}</p>
                </div>
              </div>

              {/* Weights Comparison Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-xs text-slate-500 block mb-1 font-medium">1. Collector Declared</span>
                  <span className="text-2xl font-mono font-bold text-slate-900">{selectedBatch.declaredWeightKg} kg</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Recorded via mobile scale</span>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs text-blue-700 block mb-1 font-medium">2. Aggregator Calibrated Scale</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={scaleWeight}
                      onChange={(e) => setScaleWeight(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-slate-500">kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-1 font-medium">Dock Scale Model C-50</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-xs text-slate-500 block mb-1 font-medium">Variance Drift</span>
                  {(() => {
                    const diff = Math.abs(parseFloat(scaleWeight || '0') - selectedBatch.declaredWeightKg);
                    const isHigh = diff > (selectedBatch.declaredWeightKg * 0.15);
                    return (
                      <div>
                        <span className={`text-2xl font-mono font-bold ${isHigh ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {diff.toFixed(2)} kg
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {isHigh ? '⚠️ Variance review recommended' : '✓ Normal tolerance range'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Items in Batch */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Item Category Composition</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedBatch.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                      <span className="text-slate-500 block">{item.category}</span>
                      <span className="text-slate-900 font-bold">{item.count} units</span>
                      {item.estimatedWeightKg && (
                        <span className="text-slate-400 block text-[10px] mt-0.5">~{item.estimatedWeightKg} kg</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Circularity Sorting Selector */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  Circularity Routing Pathway
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['REUSE', 'REFURBISH', 'COMPONENT RECOVERY', 'RECYCLE'] as CircularityPathway[]).map(path => (
                    <button
                      key={path}
                      onClick={() => setSelectedPathway(path)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedPathway === path
                          ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{path}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {path === 'REUSE' && 'Direct functional reuse'}
                        {path === 'REFURBISH' && 'Minor repair & resell'}
                        {path === 'COMPONENT RECOVERY' && 'Extract ICs & components'}
                        {path === 'RECYCLE' && 'Smelt & material recovery'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleReceiveDock(selectedBatch.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <PackageCheck className="w-5 h-5" />
                  Acknowledge Dock Receipt
                </button>

                <button
                  onClick={() => handleVerifyWeightAndSort(selectedBatch.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Calibrated Weight & Sort
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Current Hub Inventory */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              Hub Stock & Custody Manifest
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Batch ID</th>
                    <th className="p-3">Pickup Origin</th>
                    <th className="p-3">Collector</th>
                    <th className="p-3">Declared (kg)</th>
                    <th className="p-3">Dock Scale (kg)</th>
                    <th className="p-3">Pathway</th>
                    <th className="p-3">Hub Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-blue-600">{b.id}</td>
                      <td className="p-3 font-mono">{b.pickupRequestId}</td>
                      <td className="p-3">{b.collectorName}</td>
                      <td className="p-3 font-mono">{b.declaredWeightKg}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{b.aggregatorWeightKg || 'Pending'}</td>
                      <td className="p-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 text-[10px] font-semibold">
                          {b.circularityPath || 'RECYCLE'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.status === 'aggregator_verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Tab: Smart Route Dispatch */}
        {activeTab === 'routing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Deterministic Smart Route Recommendations
                </h3>
                <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                  Score = Value + Distance + Trust + Capacity
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Select a certified downstream recycler or refurbisher partner to transfer batch {selectedBatch.id}.
              </p>

              <div className="space-y-3">
                {INITIAL_RECYCLER_PARTNERS.map(partner => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPartnerId === partner.id
                        ? 'bg-purple-50/60 border-purple-500 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{partner.name}</span>
                          {partner.isRecommended && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Top Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {partner.address} • {partner.distanceKm} km away
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-600">₹{partner.indicativePriceINR}/kg</span>
                        <span className="text-[10px] text-slate-400 block">Trust: {partner.trustScore}/100</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {partner.specialties.map((s, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => showToast(`Smart Route dispatch manifest generated for Recycler Partner!`)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Truck className="w-5 h-5" />
                Dispatch Batch to Selected Downstream Recycler
              </button>
            </div>

            {/* Custody Chain Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-sm">Chain of Custody Handover</h4>
              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-semibold">Stage 1: Collector Collection</p>
                    <p className="text-[10px] text-slate-400">Photo, GPS, & Initial Weight locked.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-semibold">Stage 2: Aggregator Weighing</p>
                    <p className="text-[10px] text-slate-400">Calibrated Dock Scale verification complete.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-semibold">Stage 3: Recycler Receipt</p>
                    <p className="text-[10px] text-slate-400">Awaiting downstream dock scan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 font-semibold">Stage 4: Recycler Processing & EPR</p>
                    <p className="text-[10px] text-slate-400">EPR credit unlocked upon confirmed shred/smelt.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardSidebarLayout>
  );
};
