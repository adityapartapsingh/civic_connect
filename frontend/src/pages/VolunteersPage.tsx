import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { volunteerApi } from '../services/api';
import { VolunteerApplication, UserProfile } from '../types';
import { validateIndianPhone } from '../utils/validators';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Search,
  Building2,
  GraduationCap,
  MapPin,
  ChevronRight,
  Send,
  AlertTriangle,
} from 'lucide-react';

const MUNICIPAL_WARDS = [
  { id: 'Ward-101', name: 'Ward 1 - Model Town Urban Zone' },
  { id: 'Ward-102', name: 'Ward 2 - Civil Lines Administrative Ward' },
  { id: 'Ward-103', name: 'Ward 3 - Cantt Road & Defense Colony' },
  { id: 'Ward-104', name: 'Ward 4 - Rama Mandi Commercial Hub' },
  { id: 'Ward-105', name: 'Ward 5 - Phillaur Municipal Core' },
];

const VOLUNTEER_SCHEMES = [
  {
    id: 'NSS',
    name: 'NSS',
    badge: 'College / Uni',
  },
  {
    id: 'NCC',
    name: 'NCC',
    badge: 'Cadet Wing',
  },
  {
    id: 'NYKS',
    name: 'NYKS',
    badge: 'Youth Cadre',
  },
  {
    id: 'COMMUNITY',
    name: 'Community',
    badge: 'Resident',
  },
];

const CIVIC_INTEREST_AREAS = [
  { id: 'sanitation', label: 'Sanitation & Cleanliness Drives' },
  { id: 'potholes_roads', label: 'Pothole & Road Hazard Audits' },
  { id: 'tree_plantation', label: 'Urban Forestry & Greenery Protection' },
  { id: 'water_drainage', label: 'Water Leakage & Drainage Monitoring' },
  { id: 'traffic_safety', label: 'Pedestrian & Traffic Signal Oversight' },
  { id: 'emergency_relief', label: 'Monsoon Flooding & Disaster Support' },
];

export const VolunteersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'register' | 'status' | 'directory'>('register');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [wardId, setWardId] = useState(user?.ward_id || 'Ward-102');
  const [scheme, setScheme] = useState('NSS');
  const [institution, setInstitution] = useState('');
  const [cadetId, setCadetId] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'sanitation',
    'potholes_roads',
  ]);
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<VolunteerApplication | null>(null);

  // Status Lookup State
  const [lookupPhone, setLookupPhone] = useState(user?.phone || '');
  const [lookupResult, setLookupResult] = useState<VolunteerApplication | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Directory State
  const [activeVolunteers, setActiveVolunteers] = useState<UserProfile[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState('ALL');

  useEffect(() => {
    if (activeTab === 'directory') {
      loadVolunteers();
    }
  }, [activeTab, selectedSchemeFilter]);

  const loadVolunteers = async () => {
    setDirectoryLoading(true);
    try {
      const schemeParam = selectedSchemeFilter === 'ALL' ? undefined : selectedSchemeFilter;
      const data = await volunteerApi.listActive(schemeParam);
      setActiveVolunteers(data);
    } catch {
      setActiveVolunteers([]);
    } finally {
      setDirectoryLoading(false);
    }
  };

  const handleInterestToggle = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneValidation = validateIndianPhone(phone);
    if (!phoneValidation.isValid) {
      addToast({
        type: 'error',
        title: 'Invalid Mobile Number',
        message: phoneValidation.error || 'A valid 10-digit Indian phone number is required.',
      });
      return;
    }

    if (!name.trim()) {
      addToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please provide your full legal name as registered with your institution.',
      });
      return;
    }

    const selectedWard = MUNICIPAL_WARDS.find((w) => w.id === wardId);

    setIsSubmitting(true);
    try {
      const res = await volunteerApi.apply({
        name: name.trim(),
        phone: phoneValidation.normalized,
        email: email.trim() || undefined,
        ward_id: wardId,
        ward_name: selectedWard?.name || `Ward ${wardId}`,
        scheme,
        institution: institution.trim() || undefined,
        cadet_or_enrollment_id: cadetId.trim() || undefined,
        interests: selectedInterests,
        statement: statement.trim() || undefined,
        user_id: user?.id,
      });

      setSubmittedApp(res.application);
      addToast({
        type: 'success',
        title: 'Application Forwarded to Ward Admin',
        message: `Your volunteer application (${res.application_id}) has been submitted for municipal authorization.`,
      });
      setActiveTab('status');
      setLookupResult(res.application);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      addToast({
        type: 'error',
        title: 'Application Notice',
        message: detail || 'Could not submit volunteer registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const phoneValidation = validateIndianPhone(lookupPhone);
    if (!phoneValidation.isValid) {
      setLookupError(phoneValidation.error || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await volunteerApi.getStatus({ phone: phoneValidation.normalized });
      setLookupResult(res.application);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      setLookupError(detail || 'No volunteer application record found for this mobile number.');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Concise Header */}
      <header className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Civic Cadre
              </span>
              <span className="text-xs text-slate-500">• Ward Verified</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Civic Volunteer Corps
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
              Enlist under NSS, NCC, NYKS, or Community taskforces to verify municipal repairs in your ward.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs shrink-0">
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-center">
              <div className="text-sm font-bold text-blue-700">1.25x</div>
              <div className="text-[10px] text-blue-800">Bonus Points</div>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-center">
              <div className="text-sm font-bold text-emerald-700">+100 PTS</div>
              <div className="text-[10px] text-emerald-800">Upon Approval</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 overflow-x-auto scrollbar-none flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'register'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Apply to Volunteer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'status'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Check Status</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'directory'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Volunteers</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: VOLUNTEER REGISTRATION FORM                             */}
      {/* ============================================================== */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Registration Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitApplication} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Volunteer Application
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified by the Ward Administrator before authorization.
                </p>
              </div>

              {/* Section 1: Scheme Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Affiliated Scheme <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VOLUNTEER_SCHEMES.map((s) => {
                    const isSelected = scheme === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setScheme(s.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{s.name}</span>
                          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Personal & Contact Information */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Personal Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Full Legal Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jaswinder Singh"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Assigned Ward <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={wardId}
                      onChange={(e) => setWardId(e.target.value)}
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    >
                      {MUNICIPAL_WARDS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Institutional Details (Shown for student schemes) */}
              {scheme !== 'COMMUNITY' && (
                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Institutional Credentials
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        College / Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. DAV College"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Cadet / Enrollment ID
                      </label>
                      <input
                        type="text"
                        value={cadetId}
                        onChange={(e) => setCadetId(e.target.value)}
                        placeholder="e.g. PB/24/SD/10892"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Focus Areas */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {scheme !== 'COMMUNITY' ? '4' : '3'}. Deployment Focus Areas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CIVIC_INTEREST_AREAS.map((item) => {
                    const isChecked = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleInterestToggle(item.id)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer border ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200 gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Verification typically takes <strong className="text-slate-900 font-semibold">24–48 hours</strong></span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: How It Works & Status Link */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                How It Works
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900">Submit Details:</strong> Form forwarded to Ward Admin
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900">Admin Audit:</strong> Quick institutional roster check
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-emerald-800">Authorized:</strong> +100 PTS &amp; 1.25x Multiplier
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Check pending status →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: APPLICATION STATUS CHECKER                              */}
      {/* ============================================================== */}
      {activeTab === 'status' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4">
            <div>
              <h2 className="text-[20px] font-semibold text-[#0F172A] leading-[1.3] tracking-[-0.01em]">
                Track Volunteer Verification Status
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                Enter your registered mobile phone number to retrieve real-time administrative review status.
              </p>
            </div>

            <form onSubmit={handleStatusLookup} className="flex gap-2">
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="Enter 10-digit registered mobile"
                className="flex-1 h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] font-mono tabular-nums focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="h-10 px-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[6px] text-sm font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isLookingUp ? 'Searching...' : 'Check Status'}</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[6px] text-xs text-[#DC2626]">
                {lookupError}
              </div>
            )}
          </div>

          {/* Status Result Card */}
          {lookupResult && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#64748B]">
                    APPLICATION REF: {lookupResult.application_id}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                    {lookupResult.name}
                  </h3>
                </div>

                {/* Status Badge */}
                {lookupResult.status === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] border border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    APPROVED &amp; ACTIVE
                  </span>
                ) : lookupResult.status === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold font-mono">
                    <XCircle className="w-4 h-4" />
                    APPLICATION DECLINED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] border border-[#FCD34D] bg-[#FFFBEB] text-[#D97706] text-xs font-semibold font-mono">
                    <Clock className="w-4 h-4" />
                    UNDER MUNICIPAL REVIEW
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#64748B] block">Scheme:</span>
                  <span className="font-bold text-[#0F172A]">{lookupResult.scheme}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Jurisdiction Ward:</span>
                  <span className="font-bold text-[#0F172A]">{lookupResult.ward_name || lookupResult.ward_id}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Institution:</span>
                  <span className="text-[#0F172A]">{lookupResult.institution || 'Independent Community'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Enrollment ID:</span>
                  <span className="text-[#0F172A]">{lookupResult.cadet_or_enrollment_id || 'N/A'}</span>
                </div>
              </div>

              {/* Administrative Feedback Message */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-xs leading-relaxed">
                <span className="font-bold text-[#0F172A] block mb-1">
                  Administrative Review Notes:
                </span>
                <span className="text-[#475569]">
                  {lookupResult.review_notes ||
                    (lookupResult.status === 'PENDING'
                      ? 'Your application is in the queue for the Ward Administrator. Verification is typically completed within 24 to 48 hours.'
                      : 'Verified by Municipal Authority.')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ACTIVE VOLUNTEERS DIRECTORY                             */}
      {/* ============================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Municipal Active Volunteer Directory
              </h2>
              <p className="text-xs text-[#64748B]">
                Verified sentinels holding active deployment authorizations across Jalandhar wards.
              </p>
            </div>

            {/* Scheme Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {['ALL', 'NSS', 'NCC', 'NYKS', 'COMMUNITY'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSchemeFilter(s)}
                  className={`px-2.5 py-1 rounded-[4px] border transition-colors ${
                    selectedSchemeFilter === s
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#94A3B8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {directoryLoading ? (
            <div className="p-12 text-center text-xs text-[#64748B] font-mono">
              Loading verified volunteer roster...
            </div>
          ) : activeVolunteers.length === 0 ? (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-12 text-center text-xs text-[#64748B]">
              <Users className="w-8 h-8 mx-auto mb-2 text-[#94A3B8]" />
              <p className="font-semibold text-[#0F172A]">No verified volunteers registered under this filter yet.</p>
              <p className="mt-1">Be the first to apply and lead civic improvements in your ward!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 hover:border-[#94A3B8] transition-colors shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                        {vol.volunteer_scheme || 'VOLUNTEER'}
                      </span>
                      <span className="text-[11px] font-mono text-[#16A34A] font-semibold">
                        ACTIVE SENTINEL
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#0F172A] truncate">
                      {vol.name}
                    </h3>
                    <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{vol.ward_name || vol.ward || 'Municipal Ward'}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between font-mono text-xs">
                    <span className="text-[#64748B]">Civic Score:</span>
                    <span className="font-bold text-[#2563EB] tabular-nums">
                      {vol.points} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
