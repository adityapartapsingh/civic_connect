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
    name: 'NSS (National Service Scheme)',
    badge: 'Ministry of Youth Affairs',
    description: 'University and collegiate student volunteers engaged in community health, sanitation drives, and civic audits.',
    multiplier: '1.25x Point Multiplier',
  },
  {
    id: 'NCC',
    name: 'NCC (National Cadet Corps)',
    badge: 'Cadet Taskforce',
    description: 'Disciplined youth cadets assisting in public traffic safety, crowd monitoring, and civil emergency readiness.',
    multiplier: '1.25x Point Multiplier',
  },
  {
    id: 'NYKS',
    name: 'NYKS (Nehru Yuva Kendra Sangathan)',
    badge: 'National Youth Cadre',
    description: 'Grassroots rural and urban neighborhood youth spearheading water conservation and public asset protection.',
    multiplier: '1.25x Point Multiplier',
  },
  {
    id: 'COMMUNITY',
    name: 'Community & Resident Volunteer',
    badge: 'Civic Watchdog',
    description: 'Citizen activists, Resident Welfare Association members, and local ward watchdogs championing neighborhood repairs.',
    multiplier: 'Standard 1.0x Civic Multiplier',
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Mission Statement (Swiss Civic Standard) */}
      <header className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-semibold uppercase px-2 py-0.5 rounded-[4px] bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                Official Municipal Civic Cadre
              </span>
              <span className="text-xs text-[#64748B]">• Administrative Ward Verification Mandatory</span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#0F172A] leading-[1.2] tracking-[-0.02em]">
              Civic Youth &amp; Community Volunteer Corps
            </h1>
            <p className="text-sm font-normal text-[#475569] leading-[1.5] mt-2 max-w-[70ch]">
              Enlist as an authorized civic sentinel under national youth programs (NSS, NCC, NYKS) or Ward Community Taskforces. All volunteers undergo formal administrative verification by Municipal Ward Authorities before dispatch authorization.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 font-mono text-xs text-[#0F172A]">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-center">
              <div className="text-base font-bold text-[#2563EB] tabular-nums">1.25x</div>
              <div className="text-[11px] text-[#64748B]">NSS/NCC Bonus</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-center">
              <div className="text-base font-bold text-[#16A34A] tabular-nums">+100 PTS</div>
              <div className="text-[11px] text-[#64748B]">Induction Award</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-[#0F172A] text-[#0F172A]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Register as Volunteer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-[#0F172A] text-[#0F172A]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Check Application Status</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-[#0F172A] text-[#0F172A]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Volunteers Directory</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: VOLUNTEER REGISTRATION FORM                             */}
      {/* ============================================================== */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Registration Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitApplication} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-6">
              <div>
                <h2 className="text-[20px] font-semibold text-[#0F172A] leading-[1.3] tracking-[-0.01em]">
                  Volunteer Application Form
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Submitted data will be verified against institutional rosters by the designated Municipal Ward Administrator.
                </p>
              </div>

              {/* Section 1: Scheme Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Select Affiliated Scheme / Corps <span className="text-[#DC2626]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VOLUNTEER_SCHEMES.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setScheme(s.id)}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-colors ${
                        scheme === s.id
                          ? 'border-[#0F172A] bg-[#F8FAFC] shadow-xs'
                          : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#0F172A]">{s.id}</span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#0F172A]">
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed mb-2">
                        {s.description}
                      </p>
                      <div className="text-[11px] font-mono font-bold text-[#2563EB]">
                        {s.multiplier}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Personal & Contact Information */}
              <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-base font-medium text-[#1E293B]">
                  Applicant Verification Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Full Legal Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jaswinder Singh"
                      className="w-full h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Registered Mobile Number <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile (e.g. 9814012345)"
                      className="w-full h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] font-mono tabular-nums focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. j.singh@college.edu"
                      className="w-full h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Assigned Municipal Ward <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={wardId}
                      onChange={(e) => setWardId(e.target.value)}
                      className="w-full h-10 px-3.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
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

              {/* Section 3: Institutional Details */}
              <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-base font-medium text-[#1E293B]">
                  Scheme Affiliation &amp; Institutional Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Institution / College / Organization Name
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. DAV College / Lyallpur Khalsa College"
                      className="w-full h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Cadet Number / Volunteer Roll ID
                    </label>
                    <input
                      type="text"
                      value={cadetId}
                      onChange={(e) => setCadetId(e.target.value)}
                      placeholder="e.g. PB/24/SD/10892"
                      className="w-full h-10 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] font-mono focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Focus Areas */}
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Civic Deployment Focus Areas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CIVIC_INTEREST_AREAS.map((item) => {
                    const isChecked = selectedInterests.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-[4px] border cursor-pointer text-xs font-medium transition-colors ${
                          isChecked
                            ? 'bg-[#F8FAFC] border-[#0F172A] text-[#0F172A]'
                            : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleInterestToggle(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-slate-900"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Statement of Intent */}
              <div className="space-y-2 pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Brief Statement of Purpose / Past Civic Participation
                </label>
                <textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Outline prior community volunteer experience or reasons for serving in this ward..."
                  className="w-full p-3 text-sm bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                />
              </div>

              {/* Verification Protocol Notice */}
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[6px] text-xs text-[#DC2626] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Municipal Governance Rule:</strong> Volunteer status confers official dispatch confirmation privileges and a 1.25x point multiplier. All submissions are cross-verified by the Ward Administrator. Submitting falsified cadet or college credentials will lead to permanent platform deactivation.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white border border-[#1D4ED8] rounded-[6px] text-sm font-semibold transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Application...' : 'Submit Application for Admin Approval'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Scheme Details & Induction Benefits */}
          <div className="space-y-6">
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4">
              <h3 className="text-base font-semibold text-[#0F172A]">
                Volunteer Induction Protocol
              </h3>

              <div className="space-y-3 text-xs text-[#475569] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-bold text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-[#0F172A]">Application Intake:</strong> Form is cataloged in the designated Ward Administrator's verification ledger.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-bold text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-[#0F172A]">Institutional Roster Audit:</strong> Ward Administrator verifies student enrollment ID or community reference.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-bold text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-[#0F172A]">Official Authorization:</strong> Account promoted to Volunteer with +100 initiation points and spendable civic coins.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="text-xs font-semibold text-[#0F172A] mb-1">
                  Already registered?
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1"
                >
                  Track your pending review status →
                </button>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0] p-4 text-xs space-y-2">
              <div className="font-semibold text-[#0F172A]">
                🏛️ Municipal Corporation Jalandhar
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Youth volunteers operate directly in collaboration with on-site Municipal Field Engineers (Junior Engineers and Sanitation Inspectors).
              </p>
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
