import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Gift,
  ArrowRight,
  Plus,
  FileText,
  Smartphone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  Truck,
  Sparkles,
  Award,
  Wallet,
  Calendar,
  HelpCircle,
  Phone,
  UserCog
} from 'lucide-react';
import { User, PickupRequest, PickupItem } from '../../types';
import { getStoredPickups, savePickup } from '../../services/mockData';
import { DashboardSidebarLayout, NavSectionItem } from '../common/DashboardSidebarLayout';
import { DashboardTaskHeader } from '../common/DashboardTaskHeader';
import { CitizenProfileSettings } from './citizen/CitizenProfileSettings';
import { CitizenRewardCenter } from './citizen/CitizenRewardCenter';

interface CitizenDashboardProps {
  currentUser: User;
  onOpenWhatsApp: () => void;
}

type CitizenTab = 'requests' | 'schedule' | 'rewards' | 'assistant' | 'profile';

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser: initialCurrentUser,
  onOpenWhatsApp,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  React.useEffect(() => {
    setCurrentUser(initialCurrentUser);
  }, [initialCurrentUser]);

  const [pickups, setPickups] = useState<PickupRequest[]>(getStoredPickups());
  const [activeTab, setActiveTab] = useState<CitizenTab>('requests');
  const [selectedReceipt, setSelectedReceipt] = useState<PickupRequest | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [showNewPickupSuccess, setShowNewPickupSuccess] = useState(false);

  // New pickup form state
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('Indiranagar 12th Cross, Bengaluru');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [mobileCount, setMobileCount] = useState(1);
  const [laptopCount, setLaptopCount] = useState(0);
  const [printerCount, setPrinterCount] = useState(0);
  const [chargerCount, setChargerCount] = useState(2);
  const [batteryCount, setBatteryCount] = useState(0);

  // Filter pickups for this citizen
  const myPickups = pickups.filter(
    (p) => p.citizenEmail === currentUser.email || p.citizenName.toLowerCase().includes('priya') || true
  );

  const pendingCount = myPickups.filter((p) => p.status === 'pending').length;

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    const items: PickupItem[] = [];
    const randSuffix = Math.random().toString(36).substring(2, 6);
    if (mobileCount > 0) items.push({ id: `i_${Date.now()}_1_${randSuffix}`, category: 'Mobile', count: Number(mobileCount), estimatedWeightKg: mobileCount * 0.2 });
    if (laptopCount > 0) items.push({ id: `i_${Date.now()}_2_${randSuffix}`, category: 'Laptop', count: Number(laptopCount), estimatedWeightKg: laptopCount * 2.2 });
    if (printerCount > 0) items.push({ id: `i_${Date.now()}_3_${randSuffix}`, category: 'Printer', count: Number(printerCount), estimatedWeightKg: printerCount * 7.5 });
    if (chargerCount > 0) items.push({ id: `i_${Date.now()}_4_${randSuffix}`, category: 'Charger / Cable', count: Number(chargerCount), estimatedWeightKg: chargerCount * 0.3 });
    if (batteryCount > 0) items.push({ id: `i_${Date.now()}_5_${randSuffix}`, category: 'Battery', count: Number(batteryCount), estimatedWeightKg: batteryCount * 0.4 });

    if (items.length === 0) {
      alert('Please select at least one e-waste item to schedule pickup');
      return;
    }

    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPickup: PickupRequest = {
      id: newId,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenPhone: contactPhone,
      address: address || 'Indiranagar 12th Cross, Bengaluru',
      city: city || 'Bengaluru',
      items,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    savePickup(newPickup);
    setPickups(getStoredPickups());
    setShowNewPickupSuccess(true);
    setTimeout(() => {
      setShowNewPickupSuccess(false);
      setActiveTab('requests');
    }, 2000);

    // Reset fields
    setMobileCount(1);
    setLaptopCount(0);
    setPrinterCount(0);
    setChargerCount(2);
    setBatteryCount(0);
  };

  const handleSimulatedRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => setRedeemSuccess(false), 4000);
  };

  const citizenNavItems: NavSectionItem[] = [
    {
      id: 'requests',
      label: 'My Requests & Journey',
      icon: <Package className="w-4 h-4" />,
      badge: myPickups.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'service',
      description: 'Active pickups and 5-stage chain of custody',
    },
    {
      id: 'schedule',
      label: 'Schedule Doorstep Pickup',
      icon: <Plus className="w-4 h-4" />,
      badge: pendingCount > 0 ? `${pendingCount} active` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'service',
      description: 'Book doorstep e-waste collection',
    },
    {
      id: 'assistant',
      label: 'WhatsApp Bot & Guide',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'service',
      description: 'Zero-app WhatsApp pickup scheduling',
    },
    {
      id: 'rewards',
      label: 'Credit / Reward Score',
      icon: <Gift className="w-4 h-4" />,
      badge: `${currentUser.rewardPoints ?? 120} pts`,
      badgeColor: 'bg-teal-100 text-teal-800',
      category: 'analysis',
      description: 'Total score, per-product history, and UPI/bank cashback conversion',
    },
    {
      id: 'profile',
      label: 'Profile Update',
      icon: <UserCog className="w-4 h-4" />,
      category: 'account',
      description: 'Update your address, phone, and payout credentials',
    },
  ];

  const getTaskHeaderInfo = () => {
    switch (activeTab) {
      case 'requests':
        return {
          title: 'My Requests & Verified Custody Journey',
          description: 'Answers the question: "Where did my e-waste go?" Track your devices transparently all the way to formal circularity.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {myPickups.length} Total Pickups
            </span>
          ),
          actions: (
            <button
              onClick={() => setActiveTab('schedule')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Pickup</span>
            </button>
          ),
        };
      case 'schedule':
        return {
          title: 'Schedule Doorstep E-Waste Pickup',
          description: 'Enter your address and device inventory. An authorized informal collector will arrive with calibrated digital scales.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Doorstep Service
            </span>
          ),
        };
      case 'rewards':
        return {
          title: 'Credit / Reward Score & Cashback',
          description: 'Track cumulative green points, view product-by-product reward earnings history, and redeem instant cashback.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentUser.rewardPoints ?? 120} Available Points
            </span>
          ),
        };
      case 'assistant':
        return {
          title: 'WhatsApp E-Waste Concierge',
          description: 'Schedule pickups and track disposal with zero app installation directly over verified WhatsApp.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Zero-App Service
            </span>
          ),
          actions: (
            <button
              onClick={onOpenWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open WhatsApp</span>
            </button>
          ),
        };
      case 'profile':
        return {
          title: 'Profile Details & Update',
          description: 'Update your contact details, doorstep pickup address, and payment disbursement accounts.',
          badge: (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Account Settings
            </span>
          ),
        };
      default:
        return {
          title: 'Citizen Dashboard',
          description: 'Manage your circular e-waste journey',
        };
    }
  };

  const headerInfo = getTaskHeaderInfo();

  return (
    <DashboardSidebarLayout
      user={currentUser}
      navItems={citizenNavItems}
      activeId={activeTab}
      onChangeId={(id) => setActiveTab(id as CitizenTab)}
      accentColor="emerald"
      onOpenWhatsApp={onOpenWhatsApp}
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

        {/* 3. Segregated Feature Views: Render ONLY the selected view */}

      {/* VIEW 1: MY REQUESTS & WASTE JOURNEY */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Your E-Waste Requests & Verified Custody Journey
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Answers the fundamental question: <strong className="text-slate-700">"Where did my e-waste go?"</strong>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Pickup</span>
            </button>
          </div>

          <div className="space-y-5">
            {myPickups.map((req, idx) => {
              const stages = [
                { key: 'pending', label: 'Pickup Requested', desc: 'Assigned to trusted collector' },
                { key: 'collected', label: 'Collected', desc: 'Photo & scale weight captured' },
                { key: 'aggregator_verified', label: 'Aggregator Verified', desc: 'Central hub weighed & sorted' },
                { key: 'recycler_received', label: 'Recycler Received', desc: 'Formal R-Hub verified' },
                { key: 'processing_completed', label: 'Processing Completed', desc: 'Circularity & EPR credit sealed' },
              ];

              const currentStageIndex =
                req.status === 'processing_completed' ? 4 :
                req.status === 'recycler_received' ? 3 :
                req.status === 'aggregator_verified' ? 2 :
                req.status === 'collected' ? 1 : 0;

              return (
                <div
                  key={`${req.id}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs shrink-0">
                        {req.id.replace('PR-', '#')}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono">
                            {req.id}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                            {req.status.replace('_', ' ')}
                          </span>
                          {req.batchId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                              Batch: {req.batchId}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {req.address}, {req.city}
                          </span>
                          <span>•</span>
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {req.status === 'processing_completed' && (
                        <button
                          onClick={() => setSelectedReceipt(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Impact Receipt</span>
                        </button>
                      )}
                      {req.assignedCollectorName && (
                        <div className="text-right text-xs">
                          <div className="text-[10px] text-slate-400">Collector:</div>
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{req.assignedCollectorName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Items & Journey Stepper */}
                  <div className="p-4 sm:p-5 space-y-5">
                    {/* Items chips */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Handed Over E-Waste Items:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {req.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {item.count} × {item.category}
                            </span>
                            {item.notes && <span className="text-slate-400 font-normal">({item.notes})</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stepper responsive */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified Chain of Custody Journey</span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Step {currentStageIndex + 1} of 5 Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                        {stages.map((stage, sIdx) => {
                          const isDone = sIdx <= currentStageIndex;
                          const isCurrent = sIdx === currentStageIndex;

                          return (
                            <div
                              key={stage.key}
                              className={`p-3 rounded-xl border transition-all ${
                                isCurrent
                                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20'
                                  : isDone
                                  ? 'bg-slate-50 border-emerald-200 text-slate-800'
                                  : 'bg-slate-50/40 border-slate-200 text-slate-400 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {isDone ? '✓' : sIdx + 1}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {stage.label}
                                </span>
                              </div>
                              <p className="text-[11px] leading-tight text-slate-500">
                                {stage.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SCHEDULE DOORSTEP PICKUP */}
      {activeTab === 'schedule' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 mb-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Doorstep Collection Service</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Schedule Free Doorstep E-Waste Pickup
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              An authorized informal collector equipped with digital scale & tamper-evident QR generator will visit your doorstep.
            </p>
          </div>

          {showNewPickupSuccess && (
            <div className="p-4 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Pickup request submitted successfully! Assigned to nearest trusted collector.</span>
            </div>
          )}

          <form onSubmit={handleCreatePickup} className="space-y-5 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Your E-Waste Items:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Mobile Phones / Tablets</div>
                    <div className="text-[11px] text-slate-400">Smartphones, chargers, batteries</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={mobileCount}
                    onChange={(e) => setMobileCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 p-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Laptops / Desktops</div>
                    <div className="text-[11px] text-slate-400">PCBs, keyboards, motherboards</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={laptopCount}
                    onChange={(e) => setLaptopCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 p-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Printers & Appliances</div>
                    <div className="text-[11px] text-slate-400">Scanners, modems, routers</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={printerCount}
                    onChange={(e) => setPrinterCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 p-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Cables & Chargers</div>
                    <div className="text-[11px] text-slate-400">Power cords, adapters, copper wire</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={chargerCount}
                    onChange={(e) => setChargerCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 p-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Address:
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Landmark"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone:</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Battery Safety Check:</strong> Please separate swollen or leaking lithium-ion batteries. The authorized collector brings a fire-resistant container for hazardous devices.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Doorstep Request</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: CREDIT / REWARD SCORE & CASH CONVERSION */}
      {activeTab === 'rewards' && (
        <CitizenRewardCenter
          currentUser={currentUser}
          onPointsUpdated={(newPts) => setCurrentUser((prev) => ({ ...prev, rewardPoints: newPts }))}
          onNavigateTab={(tab) => setActiveTab(tab as CitizenTab)}
        />
      )}

      {/* VIEW 4: WHATSAPP BOT & ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Zero-App Hassle</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
                WhatsApp E-Waste Concierge
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Citizens don't need to install separate mobile apps. You can schedule pickups, ask for recycling drop-offs, and receive transparency receipts directly in WhatsApp.
              </p>
            </div>
            <button
              onClick={onOpenWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch WhatsApp Chat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-2">1</div>
              <div className="font-bold text-slate-900">Say "Hi" or "Pickup"</div>
              <div className="text-slate-500 text-[11px] mt-1">Text our verified WhatsApp number in English, Hindi, or Kannada.</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-2">2</div>
              <div className="font-bold text-slate-900">Share Location & Devices</div>
              <div className="text-slate-500 text-[11px] mt-1">Drop a GPS pin and send a quick photo of your discarded electronics.</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-2">3</div>
              <div className="font-bold text-slate-900">Receive Instant UPI Reward</div>
              <div className="text-slate-500 text-[11px] mt-1">Collector weighs your batch and your digital receipt is texted instantly.</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: PROFILE UPDATE & DETAILS */}
      {activeTab === 'profile' && (
        <CitizenProfileSettings
          currentUser={currentUser}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
          onNavigateTab={(tab) => setActiveTab(tab as CitizenTab)}
        />
      )}

      {/* Impact Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="text-center border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                RELOOP IMPACT RECEIPT
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Digital Transparency Certificate • Verified E-Waste Diversion
              </p>
              <div className="inline-block px-2.5 py-0.5 mt-2 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold tracking-wide">
                STATUS: VERIFIED
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Citizen:</span>
                <span className="font-semibold">{selectedReceipt.citizenName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pickup Request ID:</span>
                <span className="font-mono font-semibold">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Collection Batch ID:</span>
                <span className="font-mono font-semibold">{selectedReceipt.batchId || 'CB-00071'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Items Handed Over:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] space-y-0.5">
                  {selectedReceipt.items.map((it, idx) => (
                    <div key={idx}>
                      • {it.count} × {it.category} {it.notes ? `(${it.notes})` : ''}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Declared Weight</div>
                  <div className="text-base font-black text-slate-800">12.4 kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-emerald-700 font-semibold">Verified Scale Weight</div>
                  <div className="text-base font-black text-emerald-700">11.9 kg</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Final Circularity Destination:</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Laptop:</span>
                    <span className="font-bold text-blue-700">Refurbishment & Re-use</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mobiles:</span>
                    <span className="font-bold text-amber-700">Component Recovery (RAM/IC)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Printer & Cables:</span>
                    <span className="font-bold text-emerald-700">Materials Recycling (Copper/Alum)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-200 font-semibold">
                <span className="text-slate-800">Reward Awarded:</span>
                <span className="text-emerald-600 text-sm font-bold">+30 Green Points</span>
              </div>

              <p className="text-[10px] text-slate-400 italic text-center">
                * Described as a digital transparency receipt, not an official government certificate.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardSidebarLayout>
  );
};
