import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Mic,
  Camera,
  Scale,
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  Wallet,
  Compass,
  AlertTriangle,
  CheckCircle,
  Package,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Truck,
  ArrowRight,
  CheckCircle2,
  Sliders,
  DollarSign,
  UserCog,
  ListChecks,
  BadgeCheck,
  Clock3,
  ShieldAlert
} from 'lucide-react';
import { User, PickupRequest, CollectionBatch, HazardType } from '../../types';
import {
  getStoredBatches,
  getStoredPickups,
  saveBatch,
  savePickup,
  addEvent,
  getStoredPartners,
} from '../../services/mockData';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { DashboardTaskHeader } from '../common/DashboardTaskHeader';
import { DashboardSidebarLayout, NavSectionItem } from '../common/DashboardSidebarLayout';
import { CollectorProfileSettings } from './collector/CollectorProfileSettings';
import { CollectorWallet } from './collector/CollectorWallet';

interface CollectorDashboardProps {
  currentUser: User;
}

type CollectorTab = 'pickups' | 'recorder' | 'smart_route' | 'trust' | 'wallet' | 'profile';

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({ currentUser: initialCurrentUser }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  React.useEffect(() => {
    setCurrentUser(initialCurrentUser);
  }, [initialCurrentUser]);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [batches, setBatches] = useState<CollectionBatch[]>(getStoredBatches());
  const [pickups, setPickups] = useState<PickupRequest[]>(getStoredPickups());
  const [activeTab, setActiveTab] = useState<CollectorTab>('pickups');
  const [expandedPickupId, setExpandedPickupId] = useState<string | null>(null);
  const partners = getStoredPartners();

  // Active collection state
  const [activePickup, setActivePickup] = useState<PickupRequest | null>(null);
  const [weightKg, setWeightKg] = useState<string>('12.4');
  const [hazardStatus, setHazardStatus] = useState<HazardType>('No Hazard');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'
  );
  const [generatedBatch, setGeneratedBatch] = useState<CollectionBatch | null>(null);

  // Voice input simulation
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Handle offline sync transition
  const toggleConnectivity = () => {
    if (isOnline) {
      setIsOnline(false);
    } else {
      setIsOnline(true);
      if (syncStatus === 'pending') {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSyncStatus('synced');
        }, 1500);
      }
    }
  };

  // Simulate Voice input in Hindi / English
  const handleVoiceRecord = () => {
    setIsListening(true);
    setVoiceTranscript('Listening... Speak e-waste count (e.g. "Mobile do, Laptop ek")');
    setTimeout(() => {
      setVoiceTranscript('Recognized: "Mobile × 2, Laptop × 1, Charger × 3"');
      setIsListening(false);
    }, 1800);
  };

  // Collector reviews the individual item segments of a request, then formally
  // requests / accepts the pickup before it can be collected.
  const handleAcceptPickup = (pickup: PickupRequest) => {
    pickup.status = 'accepted';
    pickup.assignedCollectorId = currentUser.id;
    pickup.assignedCollectorName = currentUser.name;
    savePickup(pickup);

    addEvent({
      eventCode: 'EVENT 000',
      title: 'Collector Requested & Accepted Pickup',
      actorRole: 'collector',
      actorName: `${currentUser.name} (${currentUser.collectorId || 'Collector'})`,
      batchId: pickup.id,
      timestamp: new Date().toISOString(),
      details: `Reviewed ${pickup.items.length} item segment(s) and requested doorstep pickup at ${pickup.address}.`,
      metadata: { pickupId: pickup.id, itemSegments: pickup.items.length },
    });

    setPickups(getStoredPickups());
    setExpandedPickupId(null);
  };

  const handleStartCollect = (pickup: PickupRequest) => {
    setActivePickup(pickup);
    setWeightKg('12.4');
    setActiveTab('recorder');
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePickup) return;

    const newBatchId = `CB-000${Math.floor(73 + Math.random() * 20)}`;
    const weightNum = parseFloat(weightKg) || 12.4;

    const newBatch: CollectionBatch = {
      id: newBatchId,
      pickupRequestId: activePickup.id,
      collectorId: currentUser.id,
      collectorName: currentUser.name,
      items: activePickup.items,
      declaredWeightKg: weightNum,
      photos: [photoUrl],
      gps: {
        lat: 12.9352,
        lng: 77.6245,
        locationName: `${activePickup.address}, ${activePickup.city}`,
      },
      timestamp: new Date().toISOString(),
      hazardStatus,
      syncStatus: isOnline ? 'synced' : 'pending',
      status: 'collected',
      riskFlagIds: [],
    };

    saveBatch(newBatch);

    // Update pickup status
    activePickup.status = 'collected';
    activePickup.batchId = newBatchId;
    activePickup.assignedCollectorId = currentUser.id;
    activePickup.assignedCollectorName = currentUser.name;
    savePickup(activePickup);

    // Log Event 001
    addEvent({
      eventCode: 'EVENT 001',
      title: 'Collector Collected Batch',
      actorRole: 'collector',
      actorName: `${currentUser.name} (Collector)`,
      batchId: newBatchId,
      timestamp: new Date().toISOString(),
      details: `Collected ${activePickup.items.length} items (${weightNum} kg) at ${activePickup.address}. Hazard status: ${hazardStatus}.`,
      metadata: { declaredWeightKg: weightNum, pickupId: activePickup.id, offlineSync: !isOnline },
    });

    if (!isOnline) {
      setSyncStatus('pending');
    }

    setGeneratedBatch(newBatch);
    setBatches(getStoredBatches());
    setPickups(getStoredPickups());
    setActivePickup(null);
  };

  const pendingPickups = pickups.filter((p) => p.status === 'pending');
  const readyForCollectionPickups = pickups.filter(
    (p) => p.status === 'accepted' && (!p.assignedCollectorId || p.assignedCollectorId === currentUser.id)
  );

  const verificationStatus = currentUser.verificationStatus || 'unverified';
  const verificationBadge =
    verificationStatus === 'verified'
      ? { label: 'Verified', color: 'bg-emerald-100 text-emerald-800' }
      : verificationStatus === 'pending'
      ? { label: 'Pending', color: 'bg-amber-100 text-amber-800' }
      : { label: 'Unverified', color: 'bg-rose-100 text-rose-800' };

  const collectorNavItems: NavSectionItem[] = [
    {
      id: 'pickups',
      label: 'Pickup Requests',
      icon: <Package className="w-4 h-4" />,
      badge: pendingPickups.length > 0 ? `${pendingPickups.length} to review` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'service',
      description: 'Receive, review item segments & request pickup',
    },
    {
      id: 'recorder',
      label: 'Field Scale & QR Recorder',
      icon: <Scale className="w-4 h-4" />,
      badge: activePickup ? 'Active Form' : readyForCollectionPickups.length > 0 ? `${readyForCollectionPickups.length} ready` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'service',
      description: 'Weight scale, photos, hazards, and QR seal',
    },
    {
      id: 'smart_route',
      label: 'Smart Route Navigation',
      icon: <Compass className="w-4 h-4" />,
      category: 'service',
      description: 'Find top downstream recyclers by price/km',
    },
    {
      id: 'trust',
      label: 'Trust & Performance',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: currentUser.trustScore ?? 94,
      badgeColor: 'bg-blue-100 text-blue-800',
      category: 'analysis',
      description: 'Reputation score & collection accuracy',
    },
    {
      id: 'wallet',
      label: 'Wallet & Cashback',
      icon: <Wallet className="w-4 h-4" />,
      badge: `₹${(currentUser.walletBalanceINR ?? 0).toLocaleString('en-IN')}`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'account',
      description: 'Cashback balance & instant UPI/bank transfer',
    },
    {
      id: 'profile',
      label: 'Profile & Verification',
      icon: <UserCog className="w-4 h-4" />,
      badge: verificationBadge.label,
      badgeColor: verificationBadge.color,
      category: 'account',
      description: 'Update details & Collector/Member ID verification',
    },
  ];

  const getTaskHeaderInfo = (): {
    title: string;
    description: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
  } => {
    switch (activeTab) {
      case 'pickups':
        return {
          title: 'Pickup Requests: Receive, Review & Request',
          description: 'Receive citizen requests, review individual item segments, and request the doorstep pickup to collect e-waste items.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {pendingPickups.length} to Review
            </span>
          ),
          actions: (
            <button
              onClick={toggleConnectivity}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isOnline
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              {isOnline ? 'Online (Simulate Offline)' : 'Offline (Reconnect & Sync)'}
            </button>
          ),
        };
      case 'recorder':
        return {
          title: 'Field Digital Scale & QR Intake',
          description: 'Log calibrated weight scale values, attach field verification photos, and seal digital QR tracking code.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Scale Verification
            </span>
          ),
        };
      case 'smart_route':
        return {
          title: 'Smart Route Navigation & Downstream Recyclers',
          description: 'Locate authorized recyclers and high-yield collection depots by live scrap price per kg and distance.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live Rates &amp; GPS
            </span>
          ),
        };
      case 'trust':
        return {
          title: 'Collector Trust & Performance',
          description: 'Track your weighbridge accuracy, zero-tamper rating, and CPCB audit compliance score.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Trust Score: {currentUser.trustScore ?? 94}/100
            </span>
          ),
        };
      case 'wallet':
        return {
          title: 'Collector Wallet & Cashback Transfer',
          description: 'Earned cashback commission from collected e-waste. Transfer instantly to your bank account or UPI VPA.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ₹{(currentUser.walletBalanceINR ?? 0).toLocaleString('en-IN')} Available
            </span>
          ),
        };
      case 'profile':
        return {
          title: 'Collector Profile & Verification',
          description: 'Update personal details, register and verify your Collector ID & Member ID, and set up payout accounts.',
          badge: (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${verificationBadge.color} border border-current/20`}>
              {verificationBadge.label}
            </span>
          ),
        };
      default:
        return {
          title: 'Collector Dashboard',
          description: 'E-waste informal collector operations and chain of custody',
        };
    }
  };

  const headerInfo = getTaskHeaderInfo();

  return (
    <DashboardSidebarLayout
      user={currentUser}
      navItems={collectorNavItems}
      activeId={activeTab}
      onChangeId={(id) => setActiveTab(id as CollectorTab)}
      accentColor="amber"
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

      {/* VIEW 1: COLLECTION QUEUE & DOORSTEP PICKUPS */}
      {activeTab === 'pickups' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Incoming Citizen Requests
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Doorstep Pickups Waiting for Collection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review assigned locations, start collection workflow, or use voice commands.
              </p>
            </div>

            <button
              onClick={handleVoiceRecord}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer self-start sm:self-auto ${
                isListening
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Mic className="w-4 h-4 text-indigo-600" />
              <span>{isListening ? 'Listening...' : 'Voice Input (Hindi/Regional)'}</span>
            </button>
          </div>

          {voiceTranscript && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span>{voiceTranscript}</span>
              <button
                onClick={() => setVoiceTranscript('')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickups.map((req, idx) => {
              const isExpanded = expandedPickupId === req.id;
              const isMine = !req.assignedCollectorId || req.assignedCollectorId === currentUser.id;
              return (
                <div
                  key={`${req.id}-${idx}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    req.status === 'pending'
                      ? 'border-amber-300 bg-amber-50/20 hover:shadow-md'
                      : req.status === 'accepted'
                      ? 'border-emerald-300 bg-emerald-50/20 hover:shadow-md'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{req.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 mb-3 text-slate-700">
                      <div className="font-bold text-slate-900">{req.citizenName}</div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{req.address}</span>
                      </div>
                      <div className="text-slate-600 pt-1 font-mono text-[11px]">
                        {req.items.map((i) => `${i.count}x ${i.category}`).join(', ')}
                      </div>
                    </div>

                    {/* Individual item segment review panel */}
                    {(req.status === 'pending' || req.status === 'accepted') && isExpanded && (
                      <div className="mb-3 p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                          <ListChecks className="w-3 h-3" />
                          <span>Item Segments</span>
                        </div>
                        {req.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span className="font-semibold text-slate-800">{item.category}</span>
                            <span className="text-slate-500">
                              {item.count} unit{item.count > 1 ? 's' : ''}
                              {item.estimatedWeightKg ? ` • ~${item.estimatedWeightKg} kg` : ''}
                            </span>
                          </div>
                        ))}
                        {req.items.some((i) => i.notes) && (
                          <div className="text-[10px] text-slate-400 pt-1 italic">
                            {req.items.filter((i) => i.notes).map((i) => `${i.category}: ${i.notes}`).join(' • ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    {req.status === 'pending' && isMine && (
                      <>
                        <button
                          onClick={() => setExpandedPickupId(isExpanded ? null : req.id)}
                          className="w-full py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          <span>{isExpanded ? 'Hide' : 'Review'} Item Segments</span>
                        </button>
                        <button
                          id={`accept-btn-${req.id}`}
                          onClick={() => handleAcceptPickup(req)}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept &amp; Request Pickup</span>
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && isMine && (
                      <button
                        id={`collect-btn-${req.id}`}
                        onClick={() => handleStartCollect(req)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Start Collection Workflow</span>
                      </button>
                    )}

                    {!['pending', 'accepted'].includes(req.status) && (
                      <div className="text-xs text-slate-500 italic flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Collected in Batch {req.batchId || 'CB-00071'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: FIELD SCALE & QR RECORDER */}
      {activeTab === 'recorder' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Layer 1 • Digital Scale & Custody Capture
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
              Field Collection Recorder
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Record verified digital scale weight, capture tamper-evident photo proof, report hazards, and seal into 1 single batch QR code.
            </p>
          </div>

          {generatedBatch && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 animate-in fade-in">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Batch Sealed & Registered in Local Queue</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-mono">
                  {generatedBatch.id}
                </h3>
                <div className="text-xs text-slate-700 space-y-0.5">
                  <div>Weight: <strong>{generatedBatch.declaredWeightKg} kg</strong></div>
                  <div>Hazard: <strong className="text-slate-900">{generatedBatch.hazardStatus}</strong></div>
                  <div>Location: <strong className="font-mono text-[11px]">{generatedBatch.gps.locationName}</strong></div>
                </div>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <QRCodeSVG value={generatedBatch.id} size={110} />
                <button
                  onClick={() => setGeneratedBatch(null)}
                  className="mt-2 text-xs text-emerald-700 font-semibold underline cursor-pointer"
                >
                  Dismiss QR
                </button>
              </div>
            </div>
          )}

          {activePickup ? (
            <form onSubmit={handleCollectSubmit} className="space-y-5 text-xs">
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 text-xs">
                    Recording for Request: {activePickup.id}
                  </span>
                  <span className="font-bold text-slate-700">{activePickup.citizenName}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  {activePickup.items.map((i) => `${i.count} × ${i.category}`).join(', ')}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  <span>Digital Scale Weight (kg) <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 12.4"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 font-bold">KG</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Accurate scale weights earn an additional ₹80 accuracy reward downstream.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Photo Evidence (Tamper-Resistant Perceptual Hash)</span>
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt="E-waste evidence"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block">
                      Camera snapped at pickup coordinate:
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded block text-slate-700">
                      GPS: 12.9352° N, 77.6245° E (Bengaluru)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hazard Reporting:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Swollen Battery', 'Leakage', 'Damaged Battery', 'Unknown Hazard', 'No Hazard'] as HazardType[]).map((hazard) => (
                    <button
                      key={hazard}
                      type="button"
                      onClick={() => setHazardStatus(hazard)}
                      className={`p-2 rounded-xl border text-left font-bold text-[11px] transition-all cursor-pointer ${
                        hazardStatus === hazard
                          ? hazard === 'No Hazard'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {hazard}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePickup(null)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Seal Batch & Generate QR Code</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">
                No active pickup selected for recording
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Go to the Pickup Requests tab, accept a request, then click "Start Collection Workflow".
              </p>
              <button
                onClick={() => setActiveTab('pickups')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <span>View Waiting Pickups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SMART ROUTE NAVIGATION */}
      {activeTab === 'smart_route' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Route — AI Collection Optimization</span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                Where Should I Take This Collected Material?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ReLoop matches verified downstream partners based on distance, material compatibility, price/value, trust score, and live capacity.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-xs text-left min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Recycler Partner</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Indicative Value</th>
                  <th className="py-3 px-4">Trust Score</th>
                  <th className="py-3 px-4">Status & Capacity</th>
                  <th className="py-3 px-4 text-center">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      partner.isRecommended ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{partner.name}</div>
                      <div className="text-[11px] text-slate-400">{partner.address}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {partner.distanceKm} km
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      ₹{partner.indicativePriceINR.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {partner.trustScore} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                        {partner.status} ({partner.capacity})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {partner.isRecommended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-full text-xs shadow-2xs">
                          🏆 Best Route
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Alternative</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: TRUST & REPUTATION ANALYTICS */}
      {activeTab === 'trust' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reputation System
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Collector Trust Score
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 font-display">{currentUser.trustScore ?? 94}</span>
              <span className="text-sm font-bold text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Verified Collections</div>
              <div className="text-xl font-extrabold text-slate-800 mt-0.5">184</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Weight Accuracy</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5">97%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Successful Handovers</div>
              <div className="text-xl font-extrabold text-slate-800 mt-0.5">176</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Risk Flags</div>
              <div className="text-xl font-extrabold text-amber-600 mt-0.5">2 (Cleared)</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            High Trust Score unlocks priority downstream aggregator pricing and higher matchmaking density for citizen pickups.
          </p>
        </div>
      )}

      {/* VIEW 5: WALLET & CASHBACK */}
      {activeTab === 'wallet' && (
        <CollectorWallet
          currentUser={currentUser}
          onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          onNavigateTab={(tab) => setActiveTab(tab as CollectorTab)}
        />
      )}

      {/* VIEW 6: PROFILE & VERIFICATION */}
      {activeTab === 'profile' && (
        <CollectorProfileSettings
          currentUser={currentUser}
          onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          onNavigateTab={(tab) => setActiveTab(tab as CollectorTab)}
        />
      )}
      </div>
    </DashboardSidebarLayout>
  );
};
