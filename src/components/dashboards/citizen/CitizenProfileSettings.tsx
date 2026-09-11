import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Building2,
  Bell,
  CheckCircle2,
  Save,
  RotateCcw,
  Shield,
  CreditCard,
  QrCode,
  Smartphone,
  Info
} from 'lucide-react';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/auth';

interface CitizenProfileSettingsProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CitizenProfileSettings: React.FC<CitizenProfileSettingsProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  // Form fields
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [address, setAddress] = useState(currentUser.address || '12th Cross, 4th Block, Indiranagar');
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser.pincode || '560038');
  
  // Payment / Cashback details
  const [upiId, setUpiId] = useState(currentUser.upiId || `${currentUser.email.split('@')[0]}@okhdfcbank`);
  const [bankName, setBankName] = useState(currentUser.bankAccount?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(currentUser.bankAccount?.accountNumber || '50100489218451');
  const [ifscCode, setIfscCode] = useState(currentUser.bankAccount?.ifscCode || 'HDFC0000128');
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser.bankAccount?.accountHolderName || currentUser.name || ''
  );

  // Notification preferences
  const [notifWhatsApp, setNotifWhatsApp] = useState(currentUser.notifications?.whatsapp ?? true);
  const [notifSms, setNotifSms] = useState(currentUser.notifications?.sms ?? true);
  const [notifEmail, setNotifEmail] = useState(currentUser.notifications?.email ?? true);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '+91 98765 43210');
    setAddress(currentUser.address || '12th Cross, 4th Block, Indiranagar');
    setCity(currentUser.city || 'Bengaluru');
    setPincode(currentUser.pincode || '560038');
    setUpiId(currentUser.upiId || `${currentUser.email.split('@')[0]}@okhdfcbank`);
    setBankName(currentUser.bankAccount?.bankName || 'HDFC Bank');
    setAccountNumber(currentUser.bankAccount?.accountNumber || '50100489218451');
    setIfscCode(currentUser.bankAccount?.ifscCode || 'HDFC0000128');
    setAccountHolderName(currentUser.bankAccount?.accountHolderName || currentUser.name || '');
    setNotifWhatsApp(currentUser.notifications?.whatsapp ?? true);
    setNotifSms(currentUser.notifications?.sms ?? true);
    setNotifEmail(currentUser.notifications?.email ?? true);
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
      setErrorMessage('Contact phone is required for doorstep pickup arrivals');
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
        upiId: upiId.trim(),
        bankAccount: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          accountHolderName: accountHolderName.trim() || name.trim(),
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
        setTimeout(() => setShowSuccessBanner(false), 4000);
      } else {
        setErrorMessage('Could not save profile changes. Please try again.');
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Account & Profile Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
            Update Personal & Payout Details
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Maintain your verified pickup address, contact telephone, and linked UPI/Bank accounts for seamless doorstep collection dispatch and automated instant cashback settlements.
          </p>
        </div>

        {currentUser.rewardPoints !== undefined && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-right shrink-0">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Current Balance</div>
            <div className="text-2xl font-black text-emerald-700 font-display">{currentUser.rewardPoints} pts</div>
            <div className="text-[11px] text-emerald-800 font-medium">₹{currentUser.rewardPoints} Instant Value</div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Profile Details Successfully Updated!</div>
              <div className="text-[11px] text-emerald-800">
                Your new contact address and cashback UPI credentials are now synced with local collectors.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: Personal & Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                1. Personal & Contact Information
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Registered Email (Login ID)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed font-mono"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Email ID is linked to your formal CPCB circularity ledger.
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Contact Telephone / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Collector uses this number to confirm doorstep arrival and SMS scale receipts.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Circularity Member ID</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{currentUser.id}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Doorstep Address & Location */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                2. Doorstep Pickup Address & Locality
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Street Address & Flat / House No. <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 12th Cross, 4th Block, Indiranagar, near BDA Complex"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Postal Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[11px] text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Active Collector Coverage:</strong> Doorstep pickup fleet operates daily across Bengaluru East, South, and Central zones with verified digital scales.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Payment Methods & Cashback Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                3. Cashback Payout Methods (UPI & Direct Bank Transfer)
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              Instant Payouts Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* UPI Section */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Primary UPI VPA (Instant Settlement)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs font-mono font-medium"
                  />
                  <QrCode className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                  <span>Supported apps:</span>
                  <span className="font-medium text-slate-700">GPay, PhonePe, Paytm, BHIM, Cred UPI</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transfer Speed:</span>
                  <span className="font-bold text-emerald-700">Instant (&lt; 15 seconds)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Fee:</span>
                  <span className="font-bold text-slate-800">₹0 (Sponsored)</span>
                </div>
              </div>
            </div>

            {/* Direct Bank Account Section */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Direct Bank Account (IMPS / NEFT)</span>
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="50100489218451"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="HDFC0000128"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Communication & Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              4. Dispatch Alerts & Receipt Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">WhatsApp Dispatch Alerts</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Receive live ETA alerts and collector digital scale receipts on WhatsApp.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">SMS Verification OTPs</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Verification PIN texted at doorstep during physical device hand-off.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">Email Impact Certificates</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  CPCB-authorized circularity certificate with CO2e offset statement.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Current</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('rewards')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Rewards & Cashback
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
