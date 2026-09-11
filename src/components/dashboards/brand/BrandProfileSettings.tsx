import React, { useState } from 'react';
import {
  Building,
  FileCheck,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Award,
  AlertCircle,
  Tag
} from 'lucide-react';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/auth';

interface BrandProfileSettingsProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const BrandProfileSettings: React.FC<BrandProfileSettingsProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState(currentUser.name || 'EcoCorp Electronics India Pvt Ltd');
  const [cpcbRegNumber, setCpcbRegNumber] = useState(currentUser.cpcbRegNumber || 'CPCB-EPR-PRO-2026-4482');
  const [gstin, setGstin] = useState(currentUser.gstin || '29AAACE1234F1Z8');
  const [authorizedSignatory, setAuthorizedSignatory] = useState(
    currentUser.authorizedSignatory || 'Ananya Deshmukh (EPR & ESG Compliance Director)'
  );
  const [phone, setPhone] = useState(currentUser.phone || '+91 99880 77665');
  const [email, setEmail] = useState(currentUser.email || 'compliance@ecocorp.com');
  const [address, setAddress] = useState(
    currentUser.address || 'EcoCorp Tower, Level 9, Cyber City, Whitefield, Bengaluru'
  );
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser.pincode || '560066');

  const [categories, setCategories] = useState<string[]>(
    currentUser.brandCategoryFocus || ['ITEW1 (Laptops & Desktops)', 'ITEW2 (Smartphones & Tablets)', 'CEEW1 (Televisions)']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allAvailableCategories = [
    'ITEW1 (Laptops & Desktops)',
    'ITEW2 (Smartphones & Tablets)',
    'ITEW3 (Printers & Scanners)',
    'CEEW1 (Televisions)',
    'CEEW2 (Refrigerators)',
    'CEEW3 (Washing Machines)',
    'Solar PV Panels',
  ];

  const handleToggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleReset = () => {
    setCompanyName(currentUser.name || '');
    setCpcbRegNumber(currentUser.cpcbRegNumber || 'CPCB-EPR-PRO-2026-4482');
    setGstin(currentUser.gstin || '29AAACE1234F1Z8');
    setAuthorizedSignatory(currentUser.authorizedSignatory || '');
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setAddress(currentUser.address || '');
    setCity(currentUser.city || 'Bengaluru');
    setPincode(currentUser.pincode || '560066');
    setCategories(currentUser.brandCategoryFocus || ['ITEW1 (Laptops & Desktops)', 'ITEW2 (Smartphones & Tablets)']);
    setErrorMessage('');
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Producer / Company name is required');
      return;
    }
    if (!cpcbRegNumber.trim()) {
      setErrorMessage('CPCB Registration number is required');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updated = updateUserProfile({
        name: companyName.trim(),
        cpcbRegNumber: cpcbRegNumber.trim(),
        gstin: gstin.trim(),
        authorizedSignatory: authorizedSignatory.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        brandCategoryFocus: categories,
      });

      setIsSaving(false);
      if (updated) {
        onProfileUpdated(updated);
        setShowSuccessBanner(true);
        setIsEditing(false);
        setTimeout(() => setShowSuccessBanner(false), 4000);
      } else {
        setErrorMessage('Failed to update brand profile');
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HEADER WITH EDIT TOGGLE */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200/60 mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Producer Responsibility Organization (PRO) Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Brand Profile &amp; CPCB Compliance Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your corporate identity, CPCB EPR portal registration identifier, and authorized signatory records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto ${
            isEditing
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile Details'}</span>
        </button>
      </div>

      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">
            Producer profile and compliance credentials successfully saved and validated with CPCB registry.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* 2. FORM OR DETAIL VIEW */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section A: Regulatory & Legal Registration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>CPCB EPR Registration &amp; Entity Information</span>
            </h3>
            <p className="text-xs text-slate-500">
              Credentials listed on government Form 1(a) and quarterly circularity filings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Producer / Brand Legal Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                CPCB EPR Registration No.
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={cpcbRegNumber}
                  onChange={(e) => setCpcbRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                GSTIN / Corporate Tax Identifier
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Authorized Signatory &amp; Designation
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={authorizedSignatory}
                  onChange={(e) => setAuthorizedSignatory(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Corporate Headquarters Address & Contacts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>Headquarters Location &amp; Compliance Desk</span>
            </h3>
            <p className="text-xs text-slate-500">
              Official address where legal notices and quarterly certificates are dispatched.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Corporate Address
              </label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Pin Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Compliance Contact Phone
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Target EEE Categories Focus */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Target EEE Categories (EPR Obligation Scope)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Device categories registered under Schedule I of the E-Waste (Management) Rules.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allAvailableCategories.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> : <div className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Bar (When Editing) */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Brand Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
