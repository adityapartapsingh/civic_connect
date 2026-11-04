import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { adminApi, issuesApi, volunteerApi, whatsappAdminApi, WhatsAppGatewayStatus } from '../services/api';
import { UserProfile, AdminCredentialsSlip, Issue, VolunteerApplication } from '../types';
import {
  Shield,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  MapPin,
  ExternalLink,
  Plus,
  BadgeCheck,
  ArrowRight,
  Eye,
  Lock,
  Users,
  XCircle,
  Clock,
  MessageSquare,
  QrCode,
  Smartphone,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MUNICIPAL_WARDS = [
  { id: 'Ward-101', name: 'Ward 1 - Model Town Urban Zone', zone: 'Central Jalandhar' },
  { id: 'Ward-102', name: 'Ward 2 - Civil Lines Administrative Ward', zone: 'North Jalandhar' },
  { id: 'Ward-103', name: 'Ward 3 - Cantt Road & Defense Colony', zone: 'East Jalandhar' },
  { id: 'Ward-104', name: 'Ward 4 - Rama Mandi Commercial Hub', zone: 'East Jalandhar' },
  { id: 'Ward-105', name: 'Ward 5 - Phillaur Municipal Core', zone: 'Phillaur Sub-Division' },
];

export const SuperAdminPortalPage: React.FC = () => {
  const { user, login, logout, isSuperAdmin } = useAuthStore();
  const { addToast } = useToastStore();

  // Super Admin Login States
  const [loginId, setLoginId] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Super Admin Data
  const [adminsList, setAdminsList] = useState<UserProfile[]>([]);
  const [allTickets, setAllTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form: Super Admin provisions Ward Admin
  const [newAdminWardId, setNewAdminWardId] = useState<string>('Ward-101');
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminPhone, setNewAdminPhone] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminDesignation, setNewAdminDesignation] = useState<string>('Ward Municipal Administrator');

  // Volunteer Oversight States
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplication[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState<boolean>(false);
  const [volunteerWardFilter, setVolunteerWardFilter] = useState<string>('ALL');
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    app: VolunteerApplication;
    action: 'approve' | 'reject';
    notes: string;
  } | null>(null);

  const loadVolunteerApplications = async () => {
    setVolunteersLoading(true);
    try {
      const res = await volunteerApi.listAdminQueue({
        ward_id: volunteerWardFilter === 'ALL' ? undefined : volunteerWardFilter,
        status: volunteerStatusFilter === 'ALL' ? undefined : volunteerStatusFilter,
      });
      setVolunteerApps(res.applications || []);
    } catch {
      setVolunteerApps([]);
    } finally {
      setVolunteersLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadVolunteerApplications();
    }
  }, [isSuperAdmin, volunteerWardFilter, volunteerStatusFilter]);

  const handleReviewVolunteer = async (applicationId: string, action: 'approve' | 'reject', notes: string) => {
    setReviewingAppId(applicationId);
    try {
      const res = await volunteerApi.review(applicationId, action, notes);
      addToast({
        type: action === 'approve' ? 'success' : 'info',
        title: action === 'approve' ? 'Volunteer Approved & Enlisted' : 'Application Declined',
        message: res.message,
      });
      setReviewModal(null);
      loadVolunteerApplications();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Review Action Failed',
        message: err.message || 'Could not update volunteer application status.',
      });
    } finally {
      setReviewingAppId(null);
    }
  };

  // Issued Credentials Slip Modal
  const [credentialsSlip, setCredentialsSlip] = useState<{
    targetRole: 'admin';
    name: string;
    creds: AdminCredentialsSlip;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const admins = await adminApi.getRoster('admin');
      if (admins && admins.length > 0) {
        setAdminsList(admins);
      } else {
        // Sample fallback
        setAdminsList([
          {
            id: 'adm_1',
            name: 'Sh. Ramesh Kumar',
            phone: '9876543210',
            email: 'ward101.admin@mcjalandhar.in',
            role: 'admin',
            ward_id: 'Ward-101',
            ward_name: 'Ward 1 - Model Town Urban Zone',
            employee_id: 'PB-MCJ-ADM-W101',
            credential_code: 'MCJ-W101-SEC4',
            department: 'Municipal Corporation Jalandhar',
            designation: 'Ward 1 Municipal Administrator',
            officers_count: 3,
            points: 0,
            level: 1,
            badges: [],
            reports_submitted_count: 0,
            reports_resolved_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'adm_2',
            name: 'Smt. Sunita Talwar',
            phone: '9876543211',
            email: 'ward102.admin@mcjalandhar.in',
            role: 'admin',
            ward_id: 'Ward-102',
            ward_name: 'Ward 2 - Civil Lines Administrative Ward',
            employee_id: 'PB-MCJ-ADM-W102',
            credential_code: 'MCJ-W102-SEC9',
            department: 'Municipal Corporation Jalandhar',
            designation: 'Ward 2 Municipal Councillor & Admin',
            officers_count: 4,
            points: 0,
            level: 1,
            badges: [],
            reports_submitted_count: 0,
            reports_resolved_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'adm_3',
            name: 'Sh. Anand Rao',
            phone: '9876543212',
            email: 'ward103.admin@mcjalandhar.in',
            role: 'admin',
            ward_id: 'Ward-103',
            ward_name: 'Ward 3 - Cantt Road & Defense Colony',
            employee_id: 'PB-MCJ-ADM-W103',
            credential_code: 'MCJ-W103-SEC7',
            department: 'Municipal Corporation Jalandhar',
            designation: 'Ward 3 Municipal Administrator',
            officers_count: 2,
            points: 0,
            level: 1,
            badges: [],
            reports_submitted_count: 0,
            reports_resolved_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'adm_4',
            name: 'Smt. Sunita Patil',
            phone: '9876543213',
            email: 'ward104.admin@mcjalandhar.in',
            role: 'admin',
            ward_id: 'Ward-104',
            ward_name: 'Ward 4 - Rama Mandi Commercial Hub',
            employee_id: 'PB-MCJ-ADM-W104',
            credential_code: 'MCJ-W104-SEC2',
            department: 'Municipal Corporation Jalandhar',
            designation: 'Ward 4 Municipal Administrator',
            officers_count: 5,
            points: 0,
            level: 1,
            badges: [],
            reports_submitted_count: 0,
            reports_resolved_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'adm_5',
            name: 'Sh. Vijay Reddy',
            phone: '9876543214',
            email: 'ward105.admin@mcjalandhar.in',
            role: 'admin',
            ward_id: 'Ward-105',
            ward_name: 'Ward 5 - Phillaur Municipal Core',
            employee_id: 'PB-MCJ-ADM-W105',
            credential_code: 'MCJ-W105-SEC5',
            department: 'Municipal Corporation Jalandhar',
            designation: 'Ward 5 Municipal Administrator',
            officers_count: 3,
            points: 0,
            level: 1,
            badges: [],
            reports_submitted_count: 0,
            reports_resolved_count: 0,
            upvotes_given_count: 0,
          },
        ]);
      }

      const tickets = await issuesApi.getAll();
      setAllTickets(tickets);
    } catch (err) {
      console.warn('Super admin data load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadData();
    }
  }, [user]);

  const handleSuperAdminLogin = async (e?: React.FormEvent, overrideId?: string, overridePin?: string) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const ident = overrideId || loginId.trim();
    const pin = overridePin || loginPasscode.trim();

    if (!ident || !pin) {
      setLoginError('Please enter Super Admin Employee ID and Security Passcode.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await adminApi.quickLogin(ident, pin);
      if (res.user.role !== 'super_admin') {
        throw new Error('This account does not have Super Admin authority. Use the Ward Admin Portal instead.');
      }
      login(res.token, res.user);
      addToast({
        type: 'success',
        title: 'Super Admin Access Granted',
        message: `Welcome, ${res.user.name}. Root platform administration session authorized.`,
      });
      loadData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid Super Admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleProvisionWardAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminPhone) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter Administrator Name and Mobile Phone.',
      });
      return;
    }

    setIsSubmitting(true);
    const wardObj = MUNICIPAL_WARDS.find((w) => w.id === newAdminWardId);
    try {
      const res = await adminApi.provision({
        target_role: 'admin',
        name: newAdminName,
        phone: newAdminPhone,
        email: newAdminEmail || undefined,
        ward_id: newAdminWardId,
        ward_name: wardObj?.name,
        department: 'Municipal Corporation Jalandhar',
        designation: newAdminDesignation,
        jurisdiction_zone: wardObj?.zone,
      });

      setCredentialsSlip({
        targetRole: 'admin',
        name: newAdminName,
        creds: res.credentials,
      });

      addToast({
        type: 'info',
        title: 'Ward Admin Credentials Generated',
        message: `Created credentials for ${newAdminName} in ${wardObj?.name}.`,
      });

      setNewAdminName('');
      setNewAdminPhone('');
      setNewAdminEmail('');
      loadData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Provisioning Failed',
        message: err.message || 'Could not issue Ward Admin credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${fieldName} copied: ${text}`,
    });
  };

  // If user is not logged in as Super Admin, show Dedicated Super Admin Login Gateway
  if (user?.role !== 'super_admin') {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 sm:px-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-900 rounded-full text-xs font-bold mb-3 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Root Platform Authority Only</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Civic Connect Super Admin Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Exclusive administration console for the Civic Connect Central Platform Team.
          </p>
        </div>

        {/* Super Admin Login Card */}
        <div className="bg-white rounded-lg border-2 border-slate-900 p-6 sm:p-7 shadow-md">
          <div className="mb-5 pb-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Super Admin Authentication</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter root engineering credentials to access platform controls
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300">
              TIER 1 ROOT
            </span>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={(e) => handleSuperAdminLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Super Admin Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. CC-SUPERADMIN-001"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Root Passcode <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                placeholder="e.g. CC-ROOT-2026"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Verifying Root Passcode...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authenticate Super Admin Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Super Admin Credentials Button */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Official Super Admin Preset:
            </span>
            <button
              type="button"
              onClick={() => {
                setLoginId('CC-SUPERADMIN-001');
                setLoginPasscode('CC-ROOT-2026');
                handleSuperAdminLogin(undefined, 'CC-SUPERADMIN-001', 'CC-ROOT-2026');
              }}
              className="w-full text-left p-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-900 transition flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>👑 Civic Connect Team Super Admin</span>
                </div>
                <div className="text-[11px] font-mono text-amber-800 mt-0.5">
                  ID: <strong>CC-SUPERADMIN-001</strong> · PIN: <strong>CC-ROOT-2026</strong>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 group-hover:underline flex items-center gap-1">
                <span>1-Click Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>

        {/* Separate Portal Routing Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Are you a Municipal Corporation Ward Admin?
          </p>
          <Link
            to="/admin-portal"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>Go to Municipal Ward Admin Portal →</span>
          </Link>
        </div>
      </div>
    );
  }

  // WhatsApp Gateway Management States
  const [waStatus, setWaStatus] = useState<WhatsAppGatewayStatus | null>(null);
  const [isWaLoading, setIsWaLoading] = useState<boolean>(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState<boolean>(false);
  const [testWaPhone, setTestWaPhone] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isResettingWa, setIsResettingWa] = useState<boolean>(false);

  const loadWaStatus = async () => {
    setIsWaLoading(true);
    try {
      const res = await whatsappAdminApi.getStatus();
      setWaStatus(res);
      return res;
    } catch {
      setWaStatus({
        gateway_online: false,
        connected: false,
        phone: null,
        status: 'error',
        has_qr: false,
        qr_image: null,
        qr_url: 'http://localhost:5005/qr',
      });
      return null;
    } finally {
      setIsWaLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadWaStatus();
    }
  }, [isSuperAdmin]);

  // Polling for QR code scan while modal is open
  useEffect(() => {
    let timer: any = null;
    if (isWaModalOpen && !waStatus?.connected) {
      timer = setInterval(async () => {
        const res = await loadWaStatus();
        if (res?.connected) {
          addToast({
            type: 'success',
            title: 'WhatsApp Connected!',
            message: `Successfully paired with WhatsApp (${res.phone}). Free OTP dispatch is active.`,
          });
          setIsWaModalOpen(false);
        }
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWaModalOpen, waStatus?.connected]);

  const handleResetWaSession = async () => {
    if (!window.confirm('Are you sure you want to unlink the current WhatsApp device? You will need to re-scan the QR code to send OTPs.')) {
      return;
    }
    setIsResettingWa(true);
    try {
      const res = await whatsappAdminApi.resetSession();
      addToast({
        type: 'info',
        title: 'Session Reset',
        message: res.message || 'WhatsApp session unlinked. Generating fresh pairing QR code...',
      });
      await loadWaStatus();
      setIsWaModalOpen(true);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Could not reset WhatsApp session.',
      });
    } finally {
      setIsResettingWa(false);
    }
  };

  const handleSendTestWaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testWaPhone.trim()) {
      addToast({ type: 'error', title: 'Phone Required', message: 'Enter a 10-digit mobile number for test OTP.' });
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await whatsappAdminApi.sendTest(testWaPhone.trim(), '849201');
      addToast({
        type: 'success',
        title: 'Test OTP Dispatched',
        message: res.message,
      });
      setTestWaPhone('');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delivery Failed',
        message: err.message || 'Could not send test WhatsApp OTP. Ensure gateway is paired.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Super Admin Authenticated Console
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold tracking-tight text-white">
              Super Admin Console • Civic Connect Root Authority
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 font-mono">
            Active: <strong className="text-amber-300">{user?.name}</strong> (ID: {user?.employee_id || 'CC-SUPERADMIN-001'}) · Punjab State Municipal Jurisdiction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin-portal"
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Ward Admin Portal</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              addToast({
                type: 'info',
                title: 'Signed Out',
                message: 'Exited Super Admin session.',
              });
            }}
            className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Authority Rule Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-950">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>STATUTORY SUPER ADMIN GOVERNANCE RULE:</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          Super Admins <strong>only add and generate credentials for Municipal Corporation Ward Admins</strong> (1 administrator per ward). Super Admins cannot micromanage field officers directly; each Municipal Ward Admin possesses sovereign authority to provision and assign task specialties to on-site Field Officers for their ward.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Municipal Wards</span>
          <div className="text-2xl font-black text-slate-900 mt-1">5 Wards</div>
          <span className="text-[11px] text-emerald-700 font-semibold">100% City Coverage</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Ward Admins</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{adminsList.length} Admins</div>
          <span className="text-[11px] text-slate-600 font-medium">1 Admin per Ward Assigned</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Field Squads Deployed</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {adminsList.reduce((acc, a) => acc + (a.officers_count || 0), 0) || 17} Officers
          </div>
          <span className="text-[11px] text-slate-600 font-medium">Across 5 Department Tasks</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">City Resolution SLA</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">91.8%</div>
          <span className="text-[11px] text-emerald-800 font-medium">19.4h Average Fix Speed</span>
        </div>
      </div>

      {/* WhatsApp Gateway & Free OTP Dispatch Console */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-950/80 rounded text-emerald-400 border border-emerald-800">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base">
                  WhatsApp Gateway &amp; Zero-Cost OTP Dispatch
                </h2>
                {waStatus?.connected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● PAIRED &amp; ACTIVE
                  </span>
                ) : waStatus?.gateway_online ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ● PAIRING REQUIRED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    ● GATEWAY OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Self-hosted Baileys WebSocket gateway delivering instant citizen OTPs over WhatsApp for ₹0.00.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadWaStatus}
              disabled={isWaLoading}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Gateway Connection Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWaLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Status Card 1: Connection Health */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-semibold block">Gateway Daemon</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${waStatus?.gateway_online ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span>{waStatus?.gateway_online ? 'Service Online (Port 5005)' : 'Service Offline'}</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Local WebSocket Daemon
              </span>
            </div>

            {/* Status Card 2: Paired Device Number */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-semibold block">Active WhatsApp Device</span>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {waStatus?.connected ? (
                  <span className="text-emerald-700">+{waStatus.phone?.split('@')[0]}</span>
                ) : (
                  <span className="text-slate-500 italic">No Device Linked</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {waStatus?.connected ? 'Ready to deliver OTPs' : 'Scan QR to activate device'}
              </span>
            </div>

            {/* Status Card 3: Billing Rate */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-semibold block">OTP Delivery Cost</span>
              <div className="text-sm font-bold text-emerald-700 font-mono">
                ₹0.00 / message
              </div>
              <span className="text-[11px] text-slate-500 block">
                Zero Meta/Twilio API fees
              </span>
            </div>
          </div>

          {/* Action Row: Link QR, Test OTP & Unlink */}
          <div className="pt-2 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loadWaStatus();
                  setIsWaModalOpen(true);
                }}
                className="px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{waStatus?.connected ? 'View WhatsApp Pairing' : 'Pair WhatsApp (Scan QR)'}</span>
              </button>

              {waStatus?.connected && (
                <button
                  type="button"
                  disabled={isResettingWa}
                  onClick={handleResetWaSession}
                  className="px-3 py-2 rounded bg-white hover:bg-red-50 text-red-700 font-semibold text-xs border border-red-300 transition flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResettingWa ? 'animate-spin' : ''}`} />
                  <span>Unlink / Switch Device</span>
                </button>
              )}
            </div>

            {/* Quick Test OTP Dispatch Form */}
            <form onSubmit={handleSendTestWaOtp} className="flex items-center gap-2">
              <input
                type="tel"
                value={testWaPhone}
                onChange={(e) => setTestWaPhone(e.target.value)}
                placeholder="Test Mobile (e.g. 9876543210)"
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 font-mono w-48 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={isSendingTest || !waStatus?.connected}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs disabled:opacity-50 shrink-0"
              >
                <Send className="w-3 h-3 text-emerald-400" />
                <span>{isSendingTest ? 'Sending...' : 'Send Test OTP'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Provisioning Engine: Super Admin creates Ward Admin */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded text-amber-400 border border-slate-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                Municipal Corporation Ward Admin Provisioning Engine
              </h2>
              <p className="text-xs text-slate-400">
                Generate official administrative credentials and assign municipal ward jurisdiction.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
            1 Admin per Ward
          </span>
        </div>

        <form onSubmit={handleProvisionWardAdmin} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Municipal Ward Assignment <span className="text-red-500">*</span>
              </label>
              <select
                value={newAdminWardId}
                onChange={(e) => setNewAdminWardId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {MUNICIPAL_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Administrator Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. Smt. Sunita Talwar"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={newAdminPhone}
                onChange={(e) => setNewAdminPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Government Email Address
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="e.g. ward102.admin@mcjalandhar.in"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Designation
              </label>
              <input
                type="text"
                value={newAdminDesignation}
                onChange={(e) => setNewAdminDesignation(e.target.value)}
                placeholder="e.g. Ward Municipal Administrator"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Generating Secure Ward Admin Credentials...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Issue Ward Admin Official Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Ward Governance Matrix */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              City-Wide Municipal Ward Governance Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Every municipal ward has exactly one assigned Ward Admin who authorizes on-site field officers.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="self-start sm:self-auto p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh Roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Ward Jurisdiction</th>
                <th className="px-4 py-3">Designated Administrator</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Security Code</th>
                <th className="px-4 py-3 text-center">Field Squads</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {adminsList.map((admin) => (
                <tr key={admin.id || admin.employee_id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">{admin.ward_name || admin.ward_id}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{admin.ward_id}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{admin.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {admin.phone} {admin.email ? `· ${admin.email}` : ''}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {admin.designation || 'Ward Municipal Administrator'}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                      {admin.employee_id || 'N/A'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">
                      {admin.credential_code || 'MCJ-SEC-AUTH'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {admin.officers_count || 0} Officers
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to="/admin-portal"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-200 transition inline-flex items-center gap-1"
                    >
                      <span>Open Ward Console</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* City-Wide Youth Volunteer Corps Verification & Oversight */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                City-Wide Youth Volunteer Corps Verification &amp; Oversight
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                {volunteerApps.filter((a) => a.status === 'PENDING').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin cross-ward queue: Authorize youth volunteers (NSS, NCC, NYKS, Community) with +100 initiation points and 1.25x multipliers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Ward Selector */}
            <select
              value={volunteerWardFilter}
              onChange={(e) => setVolunteerWardFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800 font-medium focus:outline-none focus:border-slate-900"
            >
              <option value="ALL">All Municipal Wards</option>
              {MUNICIPAL_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - {w.name.split('-')[1]?.trim() || w.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex rounded border border-slate-300 overflow-hidden text-xs">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVolunteerStatusFilter(st)}
                  className={`px-2.5 py-1.5 font-semibold transition ${
                    volunteerStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : st === 'APPROVED' ? 'Approved' : 'Rejected'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loadVolunteerApplications}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Refresh Volunteers"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {volunteersLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
            Loading volunteer records across municipal jurisdictions...
          </div>
        ) : volunteerApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No volunteer applications found matching the selected ward and status criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {volunteerApps.map((app) => (
              <div key={app.id || app.application_id} className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{app.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{app.phone}</span>

                    {/* Scheme Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      app.scheme === 'NCC'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : app.scheme === 'NSS'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : app.scheme === 'NYKS'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {app.scheme} Sentinel
                    </span>

                    {/* Ward Badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {app.ward_name || app.ward_id}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : app.status === 'REJECTED'
                        ? 'bg-red-100 text-red-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    {app.institution && (
                      <span>
                        Institution: <strong className="text-slate-800">{app.institution}</strong>
                      </span>
                    )}
                    {app.cadet_or_enrollment_id && (
                      <span className="font-mono">
                        Enrolment: <strong className="text-slate-800">{app.cadet_or_enrollment_id}</strong>
                      </span>
                    )}
                    {app.interests && app.interests.length > 0 && (
                      <span>
                        Focus: <span className="text-slate-800">{app.interests.map(i => i.replace('_', ' ')).join(', ')}</span>
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">
                      Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {app.review_notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 max-w-2xl font-mono">
                      Review Note: {app.review_notes}
                    </div>
                  )}
                </div>

                {/* Actions for Pending */}
                {app.status === 'PENDING' && (
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      type="button"
                      disabled={reviewingAppId === app.application_id}
                      onClick={() => setReviewModal({ app, action: 'approve', notes: 'Credentials and institutional enrollment verified by Super Admin.' })}
                      className="px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Enlist (+100 Pts)</span>
                    </button>

                    <button
                      type="button"
                      disabled={reviewingAppId === app.application_id}
                      onClick={() => setReviewModal({ app, action: 'reject', notes: 'Application could not be validated.' })}
                      className="px-3 py-2 rounded bg-white hover:bg-red-50 text-red-700 font-semibold text-xs border border-red-300 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volunteer Review Confirmation Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-slate-900 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {reviewModal.action === 'approve' ? 'Authorize Civic Volunteer (Super Admin)' : 'Decline Volunteer Application'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Applicant: <strong>{reviewModal.app.name}</strong> ({reviewModal.app.scheme})
              </p>
              <p>
                Phone: <span className="font-mono font-bold text-slate-900">{reviewModal.app.phone}</span>
              </p>
              <p>
                Ward Jurisdiction: <strong className="text-slate-900">{reviewModal.app.ward_name || reviewModal.app.ward_id}</strong>
              </p>
              {reviewModal.action === 'approve' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs leading-relaxed">
                  <strong>Induction Action:</strong> Approving will promote this citizen to the official <strong>{reviewModal.app.scheme} Volunteer</strong> role in <strong>{reviewModal.app.ward_name || reviewModal.app.ward_id}</strong> and immediately grant <strong>+100 welcome reputation points &amp; coins</strong>.
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs leading-relaxed">
                  <strong>Decline Notice:</strong> The applicant's profile will remain as a standard citizen.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Verification Note
              </label>
              <textarea
                rows={2}
                value={reviewModal.notes}
                onChange={(e) => setReviewModal({ ...reviewModal, notes: e.target.value })}
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewingAppId === reviewModal.app.application_id}
                onClick={() => handleReviewVolunteer(reviewModal.app.application_id, reviewModal.action, reviewModal.notes)}
                className={`px-4 py-2 text-xs font-bold rounded text-white transition ${
                  reviewModal.action === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {reviewingAppId === reviewModal.app.application_id
                  ? 'Processing...'
                  : reviewModal.action === 'approve'
                  ? 'Confirm & Authorize Volunteer'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Pairing QR Code Modal */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-slate-900 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Link WhatsApp for Free OTP Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {waStatus?.connected ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">WhatsApp Gateway is Active</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Paired phone: <strong className="text-slate-800 font-mono">+{waStatus.phone?.split('@')[0]}</strong>
                  </p>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  Citizen OTPs are automatically delivered over WhatsApp at ₹0.00 cost.
                </p>
              </div>
            ) : waStatus?.qr_image ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-600">
                  Scan this QR code with WhatsApp on your phone to link your number:
                </p>

                <div className="inline-block p-2 bg-slate-50 rounded-lg border-2 border-slate-900 shadow-sm">
                  <img
                    src={waStatus.qr_image}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 mx-auto block"
                  />
                </div>

                <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold block text-slate-900 mb-1">How to scan:</span>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
                    <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
                    <li>Go to <strong>Settings</strong> or <strong>Menu (⋮)</strong> &gt; <strong>Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong> and point camera here</li>
                  </ol>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Waiting for scan... auto-refreshing</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                <p className="text-xs text-slate-500">
                  {waStatus?.gateway_online
                    ? 'Generating new WhatsApp pairing QR code...'
                    : 'WhatsApp Gateway service is offline. Please start it on port 5005.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={loadWaStatus}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Slip Modal */}
      {credentialsSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-slate-900 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Official Ward Admin Credentials Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsSlip(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide these official login credentials to the designated Municipal Corporation Ward Administrator:
            </p>

            <div className="bg-slate-50 p-3.5 rounded border border-slate-300 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Administrator:</span>
                <strong className="text-slate-900">{credentialsSlip.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ward:</span>
                <strong className="text-slate-900">{credentialsSlip.creds.ward_name || credentialsSlip.creds.ward_id}</strong>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Employee ID:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-slate-900 text-sm font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {credentialsSlip.creds.employee_id}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyText(credentialsSlip.creds.employee_id, 'Employee ID')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                  >
                    {copiedField === 'Employee ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Passcode / PIN:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-amber-800 text-sm font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {credentialsSlip.creds.passcode}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyText(credentialsSlip.creds.passcode, 'Passcode')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                  >
                    {copiedField === 'Passcode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCredentialsSlip(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
