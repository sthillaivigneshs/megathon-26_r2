import React, { useState } from 'react';
import {
  Building2,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Scale,
  Award,
  Save,
  RotateCcw,
  CheckCircle2,
  Shield,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/auth';

interface RecyclerProfileSettingsProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RecyclerProfileSettings: React.FC<RecyclerProfileSettingsProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [facilityName, setFacilityName] = useState(currentUser.name || 'GreenTech Circularity Solutions');
  const [licenseNumber, setLicenseNumber] = useState(currentUser.licenseNumber || 'CPCB-REC-2026-BLR-884');
  const [contactPerson, setContactPerson] = useState(currentUser.contactPerson || 'Vikram Mehta (Plant Operations Head)');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98200 11223');
  const [email, setEmail] = useState(currentUser.email || 'contact@greentech.eco');
  const [facilityAddress, setFacilityAddress] = useState(
    currentUser.facilityAddress || 'Plot 42, Peenya Industrial Area, Phase II, Bengaluru, Karnataka - 560058'
  );
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser.pincode || '560058');
  const [capacityTons, setCapacityTons] = useState<number>(currentUser.processingCapacityTonsPerDay || 8.5);

  const [accreditations, setAccreditations] = useState<string[]>(
    currentUser.accreditations || ['ISO 14001:2015', 'R2v3 Certified', 'CPCB Authorized', 'Zero-Landfill Protocol']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allAvailableAccreditations = [
    'ISO 14001:2015',
    'R2v3 Certified',
    'CPCB Authorized',
    'Zero-Landfill Protocol',
    'E-Stewards Standard',
    'OHSAS 18001 Health & Safety',
    'State Pollution Control Board (KSPCB) Consent',
  ];

  const handleToggleAccreditation = (tag: string) => {
    if (accreditations.includes(tag)) {
      setAccreditations(accreditations.filter((t) => t !== tag));
    } else {
      setAccreditations([...accreditations, tag]);
    }
  };

  const handleReset = () => {
    setFacilityName(currentUser.name || '');
    setLicenseNumber(currentUser.licenseNumber || 'CPCB-REC-2026-BLR-884');
    setContactPerson(currentUser.contactPerson || '');
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setFacilityAddress(currentUser.facilityAddress || '');
    setCity(currentUser.city || 'Bengaluru');
    setPincode(currentUser.pincode || '560058');
    setCapacityTons(currentUser.processingCapacityTonsPerDay || 8.5);
    setAccreditations(currentUser.accreditations || ['ISO 14001:2015', 'R2v3 Certified', 'CPCB Authorized']);
    setErrorMessage('');
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!facilityName.trim()) {
      setErrorMessage('Facility name is required');
      return;
    }
    if (!licenseNumber.trim()) {
      setErrorMessage('CPCB License number is required');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updated = updateUserProfile({
        name: facilityName.trim(),
        licenseNumber: licenseNumber.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        facilityAddress: facilityAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        processingCapacityTonsPerDay: capacityTons,
        accreditations,
      });

      setIsSaving(false);
      if (updated) {
        onProfileUpdated(updated);
        setShowSuccessBanner(true);
        setIsEditing(false);
        setTimeout(() => setShowSuccessBanner(false), 4000);
      } else {
        setErrorMessage('Failed to persist profile updates');
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HEADER WITH EDIT TOGGLE */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/60 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Authorized Recycler Profile &amp; Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Facility Profile &amp; Compliance Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your formal e-waste dismantling facility registration, CPCB authorization license, and processing capacities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto ${
            isEditing
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Facility Details'}</span>
        </button>
      </div>

      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">
            Facility details updated successfully! Updated records are synchronized with downstream CPCB audit logs.
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
        {/* Section A: Core Legal & Facility Registration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>CPCB Authorization &amp; Entity Identity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Regulatory credentials tied to formal EPR certificate minting and weighbridge chain of custody.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Facility / Recycler Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                CPCB Authorization License No.
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Operations Head / Authorized Manager
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Daily Dismantling Capacity (Tons/Day)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  disabled={!isEditing}
                  value={capacityTons}
                  onChange={(e) => setCapacityTons(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Facility Location & Contact */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Plant Location &amp; Receiving Dock</span>
            </h3>
            <p className="text-xs text-slate-500">
              Address where collectors deliver aggregated batches for weighbridge inspection.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Physical Plant / Dock Address
              </label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Dock Phone
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 disabled:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Circularity Accreditations & Badges */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Certified Standards &amp; Circularity Protocols</span>
            </h3>
            <p className="text-xs text-slate-500">
              Verified certifications displayed on generated CPCB Form 6 compliance returns.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allAvailableAccreditations.map((tag) => {
              const isSelected = accreditations.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAccreditation(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> : <div className="w-3.5 h-3.5" />}
                  <span>{tag}</span>
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Facility Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
