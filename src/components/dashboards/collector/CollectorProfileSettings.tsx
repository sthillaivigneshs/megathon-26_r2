import React, { useState } from 'react';
import {
  Truck,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
  Bell,
  CheckCircle2,
  Save,
  RotateCcw,
  ShieldCheck,
  Clock3,
  ShieldAlert,
  CreditCard,
  QrCode,
  BadgeCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/auth';

interface CollectorProfileSettingsProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CollectorProfileSettings: React.FC<CollectorProfileSettingsProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  // Personal & Operational Info
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98451 23456');
  const [operatingTerritory, setOperatingTerritory] = useState(
    currentUser.operatingTerritory || 'Indiranagar & Koramangala, Bengaluru'
  );
  const [address, setAddress] = useState(currentUser.address || '5th Main Road, Indiranagar');
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser.pincode || '560038');

  // Digital Registry & Identification
  const [collectorId, setCollectorId] = useState(currentUser.collectorId || 'COL-9021');
  const [memberId, setMemberId] = useState(currentUser.memberId || 'RELOOP-MEM-4471');
  const [idProofType, setIdProofType] = useState(currentUser.idProofType || 'Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState(currentUser.idProofNumber || 'XXXX-XXXX-8823');
  const [verificationStatus, setVerificationStatus] = useState<User['verificationStatus']>(
    currentUser.verificationStatus || 'verified'
  );

  // Payout / Bank details
  const [upiId, setUpiId] = useState(currentUser.upiId || 'rajesh@upi');
  const [bankName, setBankName] = useState(
    currentUser.bankAccount?.bankName || 'State Bank of India'
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser.bankAccount?.accountNumber || '30987654321098'
  );
  const [ifscCode, setIfscCode] = useState(
    currentUser.bankAccount?.ifscCode || 'SBIN0001234'
  );
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser.bankAccount?.accountHolderName || currentUser.name || 'Rajesh Kumar'
  );

  // Notifications
  const [notifWhatsApp, setNotifWhatsApp] = useState(
    currentUser.notifications?.whatsapp ?? true
  );
  const [notifSms, setNotifSms] = useState(currentUser.notifications?.sms ?? true);
  const [notifEmail, setNotifEmail] = useState(currentUser.notifications?.email ?? false);

  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '+91 98451 23456');
    setOperatingTerritory(currentUser.operatingTerritory || 'Indiranagar & Koramangala, Bengaluru');
    setAddress(currentUser.address || '5th Main Road, Indiranagar');
    setCity(currentUser.city || 'Bengaluru');
    setPincode(currentUser.pincode || '560038');
    setCollectorId(currentUser.collectorId || 'COL-9021');
    setMemberId(currentUser.memberId || 'RELOOP-MEM-4471');
    setIdProofType(currentUser.idProofType || 'Aadhaar');
    setIdProofNumber(currentUser.idProofNumber || 'XXXX-XXXX-8823');
    setVerificationStatus(currentUser.verificationStatus || 'verified');
    setUpiId(currentUser.upiId || 'rajesh@upi');
    setBankName(currentUser.bankAccount?.bankName || 'State Bank of India');
    setAccountNumber(currentUser.bankAccount?.accountNumber || '30987654321098');
    setIfscCode(currentUser.bankAccount?.ifscCode || 'SBIN0001234');
    setAccountHolderName(currentUser.bankAccount?.accountHolderName || currentUser.name || 'Rajesh Kumar');
    setNotifWhatsApp(currentUser.notifications?.whatsapp ?? true);
    setNotifSms(currentUser.notifications?.sms ?? true);
    setNotifEmail(currentUser.notifications?.email ?? false);
    setErrorMessage('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Mobile number is required for dispatch notifications');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updated = updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        operatingTerritory: operatingTerritory.trim(),
        collectorId: collectorId.trim(),
        memberId: memberId.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim(),
        verificationStatus,
        upiId: upiId.trim(),
        bankAccount: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          accountHolderName: accountHolderName.trim(),
        },
        notifications: {
          whatsapp: notifWhatsApp,
          sms: notifSms,
          email: notifEmail,
        },
      });

      setIsSaving(false);

      if (updated) {
        onProfileUpdated(updated);
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3500);
      } else {
        setErrorMessage('Failed to persist profile changes. Please try again.');
      }
    }, 400);
  };

  const handleRequestReVerification = () => {
    setVerificationStatus('pending');
    updateUserProfile({ verificationStatus: 'pending' });
    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Collector Identification &amp; Account
          </span>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Collector Profile &amp; Verification Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your certified collector credentials, assigned territory, doorstep payout accounts, and dispatch alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {verificationStatus === 'verified' ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>CPCB Verified Collector</span>
            </span>
          ) : verificationStatus === 'pending' ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 text-amber-600" />
              <span>Verification Pending Review</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Unverified Account</span>
            </span>
          )}
        </div>
      </div>

      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Profile Updated Successfully:</strong> Your collector details, payout destination, and verification data have been synchronized.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: REGISTRY & VERIFICATION CREDENTIALS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                CPCB &amp; ReLoop Registry IDs
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Chain of Custody Key</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Assigned Collector ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={collectorId}
                  onChange={(e) => setCollectorId(e.target.value)}
                  placeholder="e.g. COL-9021"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Unique identifier assigned on registration for QR batch sealing.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                ReLoop Member / License ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. RELOOP-MEM-4471"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Informal waste collector federation membership number.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                ID Document Type
              </label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                <option value="Voter ID">Voter ID (EPIC)</option>
                <option value="Driving License">Commercial Driving License</option>
                <option value="Trade License">Municipal Trade / Scraps License</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                ID Proof Document Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-8823"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-800">CPCB Verification Status: {verificationStatus}</div>
              <p className="text-[11px] text-slate-500">
                Verified status unlocks direct digital dispatch requests and higher downstream payout tiers.
              </p>
            </div>
            {verificationStatus !== 'verified' && (
              <button
                type="button"
                onClick={handleRequestReVerification}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                Submit ID For Re-Verification
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: PERSONAL & OPERATING DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Personal &amp; Operating Territory
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Doorstep &amp; Route Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Primary Operating Territory / Service Clusters
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={operatingTerritory}
                  onChange={(e) => setOperatingTerritory(e.target.value)}
                  placeholder="e.g. Indiranagar & Koramangala, Bengaluru"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Your primary collection zone used by the AI Smart Route optimizer to allocate nearby citizen requests.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Base / Depot Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Postal Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: BANK & UPI PAYOUT DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Payout &amp; Settlement Account (Cashback &amp; Sales)
              </h3>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('wallet')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Go to Wallet →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Direct UPI VPA ID (For Instant Payouts)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. rajesh@upi or 9845123456@paytm"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: NOTIFICATIONS & DISPATCH ALERTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Doorstep Dispatch &amp; Handover Alerts
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">WhatsApp Dispatch Bot Notifications</span>
                <p className="text-[11px] text-slate-500">
                  Receive instant interactive cards whenever a citizen in your territory requests a pickup.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">SMS Verification &amp; OTP Alerts</span>
                <p className="text-[11px] text-slate-500">
                  Fallback SMS for scale weight confirmation and offline collection sync codes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">EPR Batch Handover Summaries (Email)</span>
                <p className="text-[11px] text-slate-500">
                  Receive monthly CPCB custody summaries and bank settlement invoices.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Changes</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
