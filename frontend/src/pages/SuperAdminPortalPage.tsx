import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import {
  adminApi,
  issuesApi,
  whatsappAdminApi,
  superAdminUsersApi,
  wardsApi,
  SuperAdminUserStats,
  WhatsAppGatewayStatus,
  WardItem,
} from '../services/api';
import { UserProfile, AdminCredentialsSlip, Issue } from '../types';
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
  Pencil,
  Trash2,
  Ban,
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  UserX,
  X,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MUNICIPAL_WARDS = [
  { id: 'Ward-101', name: 'Ward 1 - Model Town Urban Zone', zone: 'Central Jalandhar' },
  { id: 'Ward-102', name: 'Ward 2 - Civil Lines Administrative Ward', zone: 'North Jalandhar' },
  { id: 'Ward-103', name: 'Ward 3 - Cantt Road & Defense Colony', zone: 'East Jalandhar' },
  { id: 'Ward-104', name: 'Ward 4 - Rama Mandi Commercial Hub', zone: 'East Jalandhar' },
  { id: 'Ward-105', name: 'Ward 5 - Phillaur Municipal Core', zone: 'Phillaur Sub-Division' },
];

const TASK_OPTIONS = [
  { id: 'pothole', label: 'Pothole & Asphalt Repair' },
  { id: 'road_damage', label: 'Road Surface & Craters' },
  { id: 'garbage', label: 'Solid Waste & Sanitation' },
  { id: 'streetlight', label: 'Street Lighting & Illumination' },
  { id: 'traffic_signal', label: 'Traffic Signal & Junctions' },
  { id: 'water_leakage', label: 'Water Supply Pipeline' },
  { id: 'drainage', label: 'Sewerage & Storm Drainage' },
  { id: 'sidewalk', label: 'Sidewalks & Kerbs' },
  { id: 'fallen_tree', label: 'Fallen Trees & Greenery' },
  { id: 'other', label: 'General Civic Maintenance' },
];

const BLOCK_REASON_PRESETS = [
  'Repeated submission of fake/spam civic reports',
  'Abusive, obscene, or inappropriate image evidence uploaded',
  'Malicious GPS location spoofing or manipulated telemetry',
  'Harassment or physical intimidation of municipal field squads',
  'Commercial advertisement / unauthorized promotion spam',
  'Violation of Civic Connect community terms & security policies',
];

export const SuperAdminPortalPage: React.FC = () => {
  const { user, login, logout, isSuperAdmin } = useAuthStore();
  const { addToast } = useToastStore();

  // Super Admin Login States
  const [loginId, setLoginId] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active View Tab: 'admins' | 'officers' | 'citizens' | 'blocked' | 'create' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'admins' | 'officers' | 'citizens' | 'blocked' | 'create' | 'whatsapp'>('admins');

  // Master Users State
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<SuperAdminUserStats>({
    total: 0,
    admins_count: 0,
    officers_count: 0,
    citizens_count: 0,
    blocked_count: 0,
  });
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [municipalWards, setMunicipalWards] = useState<WardItem[]>(MUNICIPAL_WARDS);

  // Load real municipal wards dynamically from database
  const loadMunicipalWards = async () => {
    try {
      const list = await wardsApi.getAll();
      if (list && list.length > 0) {
        setMunicipalWards(list);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadMunicipalWards();
  }, []);

  // Add Ward Modal States
  const [isAddWardModalOpen, setIsAddWardModalOpen] = useState<boolean>(false);
  const [newWardNumber, setNewWardNumber] = useState<string>('Ward-106');
  const [newWardName, setNewWardName] = useState<string>('');
  const [newWardZone, setNewWardZone] = useState<string>('Central Jalandhar');
  const [newCounselorName, setNewCounselorName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newWardLat, setNewWardLat] = useState<number>(31.3260);
  const [newWardLng, setNewWardLng] = useState<number>(75.5762);
  const [isSubmittingWard, setIsSubmittingWard] = useState<boolean>(false);

  // Action Modals State
  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);
  const [blockUserModal, setBlockUserModal] = useState<{ user: UserProfile; reason: string } | null>(null);
  const [deleteUserModal, setDeleteUserModal] = useState<UserProfile | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);

  // Create User Form State
  const [createRole, setCreateRole] = useState<'admin' | 'officer' | 'citizen'>('admin');
  const [createName, setCreateName] = useState<string>('');
  const [createPhone, setCreatePhone] = useState<string>('');
  const [createEmail, setCreateEmail] = useState<string>('');
  const [createWardId, setCreateWardId] = useState<string>('Ward-101');
  const [createDepartment, setCreateDepartment] = useState<string>('Municipal Corporation Jalandhar');
  const [createDesignation, setCreateDesignation] = useState<string>('Ward Municipal Administrator');
  const [createTasks, setCreateTasks] = useState<string[]>(['pothole', 'road_damage']);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  // Issued Credentials Slip Modal
  const [credentialsSlip, setCredentialsSlip] = useState<{
    targetRole: string;
    name: string;
    creds: AdminCredentialsSlip;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // WhatsApp Gateway Management States
  const [waStatus, setWaStatus] = useState<WhatsAppGatewayStatus | null>(null);
  const [isWaLoading, setIsWaLoading] = useState<boolean>(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState<boolean>(false);
  const [testWaPhone, setTestWaPhone] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isResettingWa, setIsResettingWa] = useState<boolean>(false);

  // Load all users from backend API
  const loadUsersData = async () => {
    setUsersLoading(true);
    try {
      const res = await superAdminUsersApi.listUsers({
        role: 'all',
        ward_id: selectedWard === 'ALL' ? undefined : selectedWard,
        search: searchQuery.trim() || undefined,
      });
      setAllUsers(res.users);
      setUserStats(res.stats);
    } catch (err) {
      console.warn('Super admin user data fetch notice:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsersData();
    }
  }, [isSuperAdmin, selectedWard]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsersData();
  };

  // WhatsApp Status Loader
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
    if (isSuperAdmin && activeTab === 'whatsapp') {
      loadWaStatus();
    }
  }, [isSuperAdmin, activeTab]);

  // Polling for QR code scan
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

  // Super Admin Login
  const handleSuperAdminLogin = async (e?: React.FormEvent, customId?: string, customPasscode?: string) => {
    if (e) e.preventDefault();
    setLoginError(null);
    const ident = (customId || loginId).trim();
    const pin = (customPasscode || loginPasscode).trim();

    if (!ident || !pin) {
      setLoginError('Enter both Super Admin Employee ID and Root Passcode.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await adminApi.quickLogin(ident, pin);
      if (res.user.role !== 'super_admin') {
        throw new Error('Access denied. This console requires Tier 1 Root Super Admin authorization.');
      }
      login(res.token, res.user);
      addToast({
        type: 'success',
        title: 'Super Admin Authorized',
        message: `Welcome, ${res.user.name}. Full Governance Control Active.`,
      });
      loadUsersData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid Super Admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Super Admin Action: Block User with Mandatory Reason
  const handleConfirmBlock = async () => {
    if (!blockUserModal) return;
    const { user, reason } = blockUserModal;
    if (!reason.trim()) {
      addToast({
        type: 'error',
        title: 'Mandatory Reason Required',
        message: 'Please provide a specific documented reason for blocking/suspending this account.',
      });
      return;
    }

    setIsActionSubmitting(true);
    try {
      const res = await superAdminUsersApi.blockUser(user.id || user.user_id || '', reason.trim());
      addToast({
        type: 'info',
        title: 'Account Suspended',
        message: res.message,
      });
      setBlockUserModal(null);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Block Failed',
        message: err.message || 'Could not suspend user.',
      });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Super Admin Action: Unblock User
  const handleUnblockUser = async (targetUser: UserProfile) => {
    if (!window.confirm(`Reinstate and unblock account for ${targetUser.name} (${targetUser.phone})?`)) {
      return;
    }

    setIsActionSubmitting(true);
    try {
      const res = await superAdminUsersApi.unblockUser(targetUser.id || targetUser.user_id || '');
      addToast({
        type: 'success',
        title: 'Account Reinstated',
        message: res.message,
      });
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Unblock Failed',
        message: err.message || 'Could not unblock user.',
      });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Super Admin Action: Delete User
  const handleConfirmDelete = async () => {
    if (!deleteUserModal) return;
    const targetUser = deleteUserModal;
    setIsActionSubmitting(true);
    try {
      const userId = targetUser.id || targetUser.user_id || targetUser.employee_id || '';
      const res = await superAdminUsersApi.deleteUser(userId);
      addToast({
        type: 'info',
        title: 'User Removed',
        message: res.message,
      });
      setDeleteUserModal(null);
      await loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete user account.',
      });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Super Admin Action: Save Edit User Profile
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;

    setIsActionSubmitting(true);
    try {
      const userId = editUserModal.id || editUserModal.user_id || editUserModal.employee_id || '';
      const res = await superAdminUsersApi.updateUser(userId, {
        name: editUserModal.name,
        phone: editUserModal.phone,
        email: editUserModal.email,
        ward_id: editUserModal.ward_id,
        ward_name: editUserModal.ward_name,
        department: editUserModal.department,
        designation: editUserModal.designation,
        assigned_tasks: editUserModal.assigned_tasks,
        credential_code: editUserModal.credential_code,
        role: editUserModal.role,
      });
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: res.message,
      });
      setEditUserModal(null);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update user details.',
      });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Super Admin Action: Provision / Create New User or Official
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createPhone.trim()) {
      addToast({ type: 'error', title: 'Fields Required', message: 'Name and Mobile Number are required.' });
      return;
    }

    const selectedWardObj = municipalWards.find((w) => w.id === createWardId || w.ward_number === createWardId) || MUNICIPAL_WARDS.find((w) => w.id === createWardId);

    setIsSubmittingCreate(true);
    try {
      const res = await superAdminUsersApi.createUser({
        role: createRole,
        name: createName.trim(),
        phone: createPhone.trim(),
        email: createEmail.trim() || undefined,
        ward_id: createWardId,
        ward_name: selectedWardObj?.name,
        department: createDepartment.trim() || undefined,
        designation: createDesignation.trim() || undefined,
        assigned_tasks: createRole === 'officer' ? createTasks : undefined,
      });

      addToast({
        type: 'success',
        title: 'Account Provisioned',
        message: res.message,
      });

      if (res.user.credential_code || res.user.employee_id) {
        setCredentialsSlip({
          targetRole: createRole,
          name: res.user.name,
          creds: {
            employee_id: res.user.employee_id || '',
            passcode: res.user.credential_code || '',
            ward_id: res.user.ward_id,
            ward_name: res.user.ward_name,
            assigned_tasks: res.user.assigned_tasks,
          },
        });
      }

      // Reset form
      setCreateName('');
      setCreatePhone('');
      setCreateEmail('');
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not create account.',
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Super Admin Action: Enrol New Municipal Ward
  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardNumber.trim() || !newWardName.trim()) {
      addToast({
        type: 'error',
        title: 'Fields Required',
        message: 'Ward code and jurisdiction name are required.',
      });
      return;
    }

    setIsSubmittingWard(true);
    try {
      const res = await wardsApi.create({
        ward_number: newWardNumber.trim(),
        name: newWardName.trim(),
        zone: newWardZone.trim(),
        counselor_name: newCounselorName.trim() || undefined,
        contact_phone: newContactPhone.trim() || undefined,
        lat: Number(newWardLat) || 31.3260,
        lng: Number(newWardLng) || 75.5762,
      });

      addToast({
        type: 'success',
        title: 'Ward Enrolled Successfully',
        message: `${res.ward_number || newWardNumber} - ${res.name || newWardName} added to municipal records.`,
      });

      await loadMunicipalWards();
      await loadUsersData();

      setNewWardName('');
      setNewCounselorName('');
      setNewContactPhone('');
      setIsAddWardModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create ward jurisdiction.';
      addToast({
        type: 'error',
        title: 'Ward Creation Failed',
        message: msg,
      });
    } finally {
      setIsSubmittingWard(false);
    }
  };

  // Filter users for each active tab
  const admins = allUsers.filter((u) => u.role === 'admin');
  const officers = allUsers.filter((u) => u.role === 'officer');
  const citizens = allUsers.filter((u) => u.role === 'citizen' || u.role === 'volunteer');
  const blockedUsers = allUsers.filter((u) => u.is_blocked);

  // If not authenticated as Super Admin, display the dedicated login screen
  if (!isSuperAdmin) {
    return (
      <div className="w-full max-w-md my-auto py-8">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-300 p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-slate-900 text-amber-400 mb-3 border border-slate-800 shadow-xs">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Super Admin Control
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tier 1 Root Governance Console for Civic Connect Municipal Authority
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
              FULL SITE GOVERNANCE
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

          {/* Quick-Fill Super Admin Preset */}
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
      </div>
    );
  }

  // Super Admin Authenticated Console
  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs flex items-center justify-between gap-3 text-slate-900">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 shrink-0" />
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900">
              Super Admin Console
            </h1>
            <span className="sm:hidden px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
              ROOT
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5 font-mono">
            Active: <strong className="text-slate-800">{user?.name}</strong> (ID: {user?.employee_id || 'CC-SUPERADMIN-001'}) · Punjab Municipal Corporation Root Authority
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-[11px] sm:text-xs font-bold border border-slate-200 hover:border-red-200 transition flex items-center gap-1"
          >
            <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats: Mobile Single-Line Strip vs Desktop 5-Box Grid */}
      <div>
        {/* Mobile Single-Line Strip */}
        <div className="sm:hidden flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span>Wards: <strong className="text-slate-900">{municipalWards.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Admins: <strong className="text-slate-900">{admins.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Squads: <strong className="text-slate-900">{officers.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Citizens: <strong className="text-emerald-700">{citizens.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-red-700">Blocked: <strong>{blockedUsers.length}</strong></span>
        </div>

        {/* Desktop 5-Column Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total System Accounts</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{userStats.total || allUsers.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">Atlas Database Records</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-700">Ward Administrators</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{admins.length} Admins</div>
            <span className="text-[11px] text-slate-500 font-medium">
              {userStats.wards_count || new Set(admins.map((a) => a.ward_id).filter(Boolean)).size} Municipal Jurisdictions
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-700">Field Squad Officers</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{officers.length} Officers</div>
            <span className="text-[11px] text-slate-500 font-medium">On-Site Dispatch Force</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700">Registered Citizens</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{citizens.length} Citizens</div>
            <span className="text-[11px] text-slate-500 font-medium">Public Community Users</span>
          </div>

          <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 shadow-xs">
            <span className="text-xs font-bold text-red-700">Suspended / Blocked</span>
            <div className="text-2xl font-black text-red-700 font-mono mt-1">{blockedUsers.length} Blocked</div>
            <span className="text-[11px] text-red-600 font-medium">Illegal &amp; Spam Enforcements</span>
          </div>
        </div>
      </div>

      {/* Control Tabs Navigation: Sleek single horizontal scroll row */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-xs p-1 sm:p-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Ward Matrix</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'admins' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {admins.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('officers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'officers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Field Officers</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'officers' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {officers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('citizens')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'citizens'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizens / Users</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'citizens' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {citizens.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocked')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'blocked'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-red-700 hover:text-red-900 hover:bg-red-50'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Blocked / Spam</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'blocked' ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800'
            }`}>
              {blockedUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'create'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Official / User</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 squash-stretch min-h-[38px] cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WhatsApp Gateway</span>
            <span className={`w-2 h-2 rounded-full ${waStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. WARD ADMINS LIST (FULL CONTROL MATRIX)                      */}
      {/* ============================================================== */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-800" />
                <span>City-Wide Municipal Ward Governance Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">
                Every municipal ward has exactly one assigned Ward Admin who authorizes on-site field officers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const existingNumbers = municipalWards
                    .map((w) => parseInt((w.id || w.ward_number || '').replace('Ward-', ''), 10))
                    .filter((n) => !isNaN(n));
                  const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 106;
                  setNewWardNumber(`Ward-${nextNum}`);
                  setIsAddWardModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Add New Ward</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadUsersData();
                  loadMunicipalWards();
                }}
                disabled={usersLoading}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                title="Refresh Matrix"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ward Jurisdiction</th>
                  <th className="px-4 py-3">Designated Administrator</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3 text-center">Field Squads</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {municipalWards.map((ward) => {
                  const wardId = ward.id || ward.ward_number || 'Ward';
                  const admin = admins.find(
                    (a) =>
                      a.ward_id === wardId ||
                      a.ward_id === ward.ward_number ||
                      (a.ward_name && a.ward_name.includes(wardId))
                  );
                  const cleanName = ward.name.includes(' - ') ? ward.name : `${wardId} - ${ward.name}`;

                  if (admin) {
                    return (
                      <tr key={admin.id || admin.employee_id || wardId} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-900 block">{admin.ward_name || cleanName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {wardId} {ward.zone ? `· ${ward.zone}` : ''}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{admin.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            +91 {admin.phone} {admin.email ? `· ${admin.email}` : ''}
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

                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {admin.officers_count || 0} Officers
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditUserModal(admin)}
                              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                              title="Edit Ward Admin Profile"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {admin.is_blocked ? (
                              <button
                                type="button"
                                onClick={() => handleUnblockUser(admin)}
                                className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                                title="Unblock & Reinstate Admin"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setBlockUserModal({ user: admin, reason: '' })}
                                className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                                title="Block / Suspend Admin with Reason"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeleteUserModal(admin)}
                              className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                              title="Delete Ward Admin Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Vacant Ward Jurisdiction
                  return (
                    <tr key={wardId} className="hover:bg-amber-50/40 transition bg-amber-50/15">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{cleanName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {wardId} {ward.zone ? `· ${ward.zone}` : ''}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Vacant Ward Jurisdiction</span>
                        </span>
                        {ward.counselor_name && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Counselor: {ward.counselor_name} {ward.contact_phone ? `(${ward.contact_phone})` : ''}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-slate-400 font-mono text-[11px] italic">Unassigned</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          0 Officers
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateRole('admin');
                            setCreateWardId(wardId);
                            setCreateDepartment('Municipal Corporation Jalandhar');
                            setCreateDesignation(`${ward.name.split('-')[1]?.trim() || ward.name} Ward Administrator`);
                            setActiveTab('create');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] transition shadow-xs inline-flex items-center gap-1"
                          title="Assign Ward Administrator"
                        >
                          <UserPlus className="w-3 h-3 text-amber-400" />
                          <span>Assign Admin</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Unmapped Admins (if any exist outside current known wards) */}
                {admins
                  .filter(
                    (admin) =>
                      !municipalWards.some(
                        (w) => w.id === admin.ward_id || w.ward_number === admin.ward_id
                      )
                  )
                  .map((admin) => (
                    <tr key={admin.id || admin.employee_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{admin.ward_name || admin.ward_id}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{admin.ward_id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{admin.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          +91 {admin.phone} {admin.email ? `· ${admin.email}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                          {admin.employee_id || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {admin.officers_count || 0} Officers
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditUserModal(admin)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteUserModal(admin)}
                            className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FIELD OFFICERS LIST (FULL CONTROL ACROSS ALL WARDS)         */}
      {/* ============================================================== */}
      {activeTab === 'officers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>City-Wide On-Site Field Officers &amp; Squads</span>
              </h2>
              <p className="text-xs text-slate-500">
                Super Admin cross-ward control: View, edit, update, assign tasks, delete, or suspend any Field Officer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Ward Filter */}
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800 font-medium focus:outline-none focus:border-slate-900"
              >
                <option value="ALL">All Municipal Wards</option>
                {municipalWards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - {w.name.split('-')[1]?.trim() || w.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadUsersData}
                disabled={usersLoading}
                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                title="Refresh Officers"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Officer Name &amp; Contact</th>
                  <th className="px-4 py-3">Ward &amp; Department</th>
                  <th className="px-4 py-3">Assigned Tasks</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions (Full Control)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                      No field officers found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr key={officer.id || officer.employee_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {officer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          +91 {officer.phone} {officer.email ? `· ${officer.email}` : ''}
                        </div>
                        <div className="text-[10px] text-cyan-700 font-medium">
                          {officer.designation || 'Field Inspector'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{officer.ward_id || 'Unassigned Ward'}</span>
                        <span className="text-[11px] text-slate-500">{officer.department || 'Operations'}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {officer.assigned_tasks && officer.assigned_tasks.length > 0 ? (
                            officer.assigned_tasks.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 border border-slate-200 text-slate-800"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">All General Tasks</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold inline-block">
                          {officer.employee_id || 'N/A'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {officer.is_blocked ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              ● SUSPENDED
                            </span>
                            {officer.block_reason && (
                              <p className="text-[10px] text-red-700 mt-0.5 max-w-xs truncate" title={officer.block_reason}>
                                Reason: {officer.block_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            ● ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditUserModal(officer)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                            title="Edit Officer Profile & Tasks"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {officer.is_blocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblockUser(officer)}
                              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition"
                              title="Unblock & Reinstate Officer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBlockUserModal({ user: officer, reason: '' })}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                              title="Block / Suspend Officer with Reason"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteUserModal(officer)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                            title="Delete Field Officer Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CITIZENS / USERS LIST (FULL CONTROL)                        */}
      {/* ============================================================== */}
      {activeTab === 'citizens' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Registered Citizens &amp; Public Users Directory</span>
              </h2>
              <p className="text-xs text-slate-500">
                Super Admin control: Inspect citizen accounts, view activity metrics, edit profiles, or suspend bad actors for spam/illegal behavior.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, email..."
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 font-medium w-48 focus:outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </button>
              </form>

              <button
                type="button"
                onClick={loadUsersData}
                disabled={usersLoading}
                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                title="Refresh Citizens"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Citizen Name &amp; Contact</th>
                  <th className="px-4 py-3">Assigned Ward</th>
                  <th className="px-4 py-3 text-center">Reputation Points</th>
                  <th className="px-4 py-3 text-center">Civic Coins</th>
                  <th className="px-4 py-3 text-center">Reports Filed</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions (Full Control)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {citizens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                      No citizen accounts found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  citizens.map((cit) => (
                    <tr key={cit.id || cit.user_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">{cit.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">+91 {cit.phone}</span>
                        {cit.email && <span className="text-[10px] text-slate-400 block">{cit.email}</span>}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800 block">{cit.ward_name || cit.ward_id || 'City-Wide / General'}</span>
                        {cit.ward_id && <span className="text-[10px] text-slate-400 font-mono">{cit.ward_id}</span>}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {cit.points || 0} pts
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🪙 {cit.coins ?? cit.points ?? 0}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-slate-700">
                          {cit.reports_submitted_count || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {cit.is_blocked ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              ● BLOCKED
                            </span>
                            {cit.block_reason && (
                              <p className="text-[10px] text-red-700 mt-0.5 max-w-xs truncate" title={cit.block_reason}>
                                Reason: {cit.block_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            ● ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditUserModal(cit)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                            title="Edit Citizen Profile"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {cit.is_blocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblockUser(cit)}
                              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition"
                              title="Unblock & Reinstate Citizen"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBlockUserModal({ user: cit, reason: '' })}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                              title="Block Citizen for Spam/Illegal Activities with Reason"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteUserModal(cit)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                            title="Delete Citizen Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BLOCKED & SUSPENDED ACCOUNTS (WITH MANDATORY REASONS)       */}
      {/* ============================================================== */}
      {activeTab === 'blocked' && (
        <div className="bg-white rounded-xl border border-red-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-red-200 bg-red-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-red-950 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-700" />
                <span>Suspended / Blocked Accounts Register (Spam &amp; Violations)</span>
              </h2>
              <p className="text-xs text-red-800">
                Every suspended user account is documented with a statutory reason. Blocked accounts cannot request OTP, log in, or submit civic reports.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-200 text-red-900 border border-red-300">
              {blockedUsers.length} Suspended
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Account Identity &amp; Role</th>
                  <th className="px-4 py-3">Contact Mobile</th>
                  <th className="px-4 py-3">Jurisdiction Ward</th>
                  <th className="px-4 py-3">Documented Suspension Reason</th>
                  <th className="px-4 py-3">Suspended By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {blockedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      No suspended or blocked accounts in the database. Platform is healthy.
                    </td>
                  </tr>
                ) : (
                  blockedUsers.map((u) => (
                    <tr key={u.id || u.user_id} className="hover:bg-red-50/40 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800">
                        +91 {u.phone}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {u.ward_name || u.ward_id || 'City-Wide'}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="p-2 rounded bg-red-50 border border-red-200 text-red-900 font-medium text-xs leading-relaxed max-w-md">
                          {u.block_reason || 'Documented violation of civic platform rules'}
                        </div>
                        {u.blocked_at && (
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                            Suspended on: {new Date(u.blocked_at).toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {u.blocked_by || 'Super Administrator'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUnblockUser(u)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Unblock</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteUserModal(u)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                            title="Delete Account Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ADD / PROVISION NEW OFFICIAL OR USER                        */}
      {/* ============================================================== */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  Provision New Account (Ward Admin, Field Officer, or Citizen)
                </h2>
                <p className="text-xs text-slate-500">
                  Super Admin direct provisioning with automated credential codes and role authorization.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="p-5 sm:p-6 space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Account Role to Provision <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateRole('admin');
                    setCreateDesignation('Ward Municipal Administrator');
                    setCreateDepartment('Municipal Corporation Jalandhar');
                  }}
                  className={`p-3 rounded-lg border text-xs font-bold transition text-left ${
                    createRole === 'admin'
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900 ring-1 ring-amber-500'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="block font-bold">Ward Administrator</span>
                  <span className="text-[10px] text-slate-500 font-normal">1 Admin per Ward</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateRole('officer');
                    setCreateDesignation('Junior Engineer (JE)');
                    setCreateDepartment('Municipal Field Operations');
                  }}
                  className={`p-3 rounded-lg border text-xs font-bold transition text-left ${
                    createRole === 'officer'
                      ? 'border-cyan-500 bg-cyan-50/50 text-slate-900 ring-1 ring-cyan-500'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-600 mb-1" />
                  <span className="block font-bold">Field Officer</span>
                  <span className="text-[10px] text-slate-500 font-normal">On-Site Dispatch Squad</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateRole('citizen');
                    setCreateDesignation('');
                    setCreateDepartment('');
                  }}
                  className={`p-3 rounded-lg border text-xs font-bold transition text-left ${
                    createRole === 'citizen'
                      ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-500'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="block font-bold">Citizen User</span>
                  <span className="text-[10px] text-slate-500 font-normal">Public Reporting Account</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Er. Rohit Verma"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Mobile Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Government / Contact Email Address
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. official@mcjalandhar.in"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Municipal Ward Jurisdiction <span className="text-red-500">*</span>
                </label>
                <select
                  value={createWardId}
                  onChange={(e) => setCreateWardId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {municipalWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} {w.zone ? `(${w.zone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {createRole !== 'citizen' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Unit
                  </label>
                  <input
                    type="text"
                    value={createDepartment}
                    onChange={(e) => setCreateDepartment(e.target.value)}
                    placeholder="e.g. Roads & Infrastructure Division"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={createDesignation}
                    onChange={(e) => setCreateDesignation(e.target.value)}
                    placeholder="e.g. Junior Engineer (JE)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Task Specialties for Field Officers */}
            {createRole === 'officer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Maintenance Tasks &amp; Specialties:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TASK_OPTIONS.map((t) => {
                    const isChecked = createTasks.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isChecked) {
                            setCreateTasks(createTasks.filter((x) => x !== t.id));
                          } else {
                            setCreateTasks([...createTasks, t.id]);
                          }
                        }}
                        className={`p-2 rounded border text-left text-xs transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-950 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSubmittingCreate ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Provisioning &amp; Generating Passcode...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Provision {createRole === 'admin' ? 'Ward Admin' : createRole === 'officer' ? 'Field Officer' : 'Citizen'} Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}



      {/* ============================================================== */}
      {/* 7. WHATSAPP GATEWAY & FREE OTP DISPATCH CONSOLE                 */}
      {/* ============================================================== */}
      {activeTab === 'whatsapp' && (
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

              <form onSubmit={handleSendTestWaOtp} className="flex items-center gap-2">
                <input
                  type="tel"
                  value={testWaPhone}
                  onChange={(e) => setTestWaPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
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
      )}

      {/* ============================================================== */}
      {/* MODAL 1: BLOCK / SUSPEND USER WITH MANDATORY REASON            */}
      {/* ============================================================== */}
      {blockUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-300 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-red-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-300" />
                <h3 className="font-bold text-base">
                  Suspend &amp; Block User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBlockUserModal(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-950 space-y-1">
                <div className="font-bold text-sm">
                  Target: {blockUserModal.user.name} ({blockUserModal.user.role?.toUpperCase()})
                </div>
                <div className="font-mono text-xs text-red-800">
                  Mobile: +91 {blockUserModal.user.phone} {blockUserModal.user.email ? `· ${blockUserModal.user.email}` : ''}
                </div>
                <p className="text-[11px] text-red-700 pt-1">
                  Suspended accounts are locked out immediately. They cannot request OTPs, log in, or file reports.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mandatory Documented Suspension Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={blockUserModal.reason}
                  onChange={(e) =>
                    setBlockUserModal({ ...blockUserModal, reason: e.target.value })
                  }
                  placeholder="State the exact violation or grounds for suspension (e.g. repeated false reports, abusive media, harassment, spam)..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 leading-relaxed font-medium"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                  Quick Grounds / Preset Violations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BLOCK_REASON_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() =>
                        setBlockUserModal({ ...blockUserModal, reason: preset })
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded text-[11px] text-slate-800 text-left transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlockUserModal(null)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isActionSubmitting || !blockUserModal.reason.trim()}
                  onClick={handleConfirmBlock}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isActionSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Suspending Account...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Suspend Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT USER / OFFICIAL PROFILE                          */}
      {/* ============================================================== */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base">
                  Edit Account Profile • {editUserModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserModal.name}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editUserModal.phone}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUserModal.email || ''}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Municipal Ward Assignment
                  </label>
                  <select
                    value={editUserModal.ward_id || ''}
                    onChange={(e) => {
                      const w = municipalWards.find((item) => item.id === e.target.value);
                      setEditUserModal({
                        ...editUserModal,
                        ward_id: e.target.value,
                        ward_name: w?.name,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="">All Wards / Unassigned</option>
                    {municipalWards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editUserModal.role !== 'citizen' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editUserModal.department || ''}
                      onChange={(e) =>
                        setEditUserModal({ ...editUserModal, department: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation / Official Title
                    </label>
                    <input
                      type="text"
                      value={editUserModal.designation || ''}
                      onChange={(e) =>
                        setEditUserModal({ ...editUserModal, designation: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Task checkboxes for field officers */}
              {editUserModal.role === 'officer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Maintenance Specialties:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TASK_OPTIONS.map((t) => {
                      const isChecked = (editUserModal.assigned_tasks || []).includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            const cur = editUserModal.assigned_tasks || [];
                            const updated = isChecked
                              ? cur.filter((x) => x !== t.id)
                              : [...cur, t.id];
                            setEditUserModal({ ...editUserModal, assigned_tasks: updated });
                          }}
                          className={`p-2 rounded border text-left text-xs transition flex items-center gap-1.5 ${
                            isChecked
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-950 font-semibold'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isActionSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DELETE USER CONFIRMATION                              */}
      {/* ============================================================== */}
      {deleteUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-300 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-red-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-200" />
                <h3 className="font-bold text-base">
                  Permanently Delete Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteUserModal(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-950">
                <p className="font-bold text-sm">
                  Are you certain you want to delete {deleteUserModal.name}?
                </p>
                <p className="font-mono text-xs text-red-800 mt-1">
                  Role: {deleteUserModal.role?.toUpperCase()} · Mobile: +91 {deleteUserModal.phone}
                </p>
                <p className="text-[11px] text-red-700 mt-2 leading-relaxed">
                  ⚠️ This action is irreversible. The account record will be removed from the database permanently.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteUserModal(null)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isActionSubmitting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isActionSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Permanent Deletion</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: PROVISIONED CREDENTIALS SLIP                          */}
      {/* ============================================================== */}
      {credentialsSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  Official Security Slip Generated
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsSlip(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="text-center pb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Official Account Provisioned
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  {credentialsSlip.name}
                </h4>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {credentialsSlip.targetRole.toUpperCase()} · {credentialsSlip.creds.ward_name || credentialsSlip.creds.ward_id}
                </span>
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Employee ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {credentialsSlip.creds.employee_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsSlip.creds.employee_id);
                        setCopiedField('id');
                        setTimeout(() => setCopiedField(null), 1500);
                      }}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600"
                      title="Copy Employee ID"
                    >
                      {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Security Passcode:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      {credentialsSlip.creds.passcode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsSlip.creds.passcode);
                        setCopiedField('code');
                        setTimeout(() => setCopiedField(null), 1500);
                      }}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600"
                      title="Copy Security Passcode"
                    >
                      {copiedField === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setCredentialsSlip(null)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition shadow-xs"
                >
                  Done &amp; Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: WHATSAPP QR PAIRING MODAL                             */}
      {/* ============================================================== */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  Scan QR with Official WhatsApp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              {waStatus?.connected ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Device Successfully Linked!
                  </h4>
                  <p className="text-xs text-slate-600 font-mono">
                    +{waStatus.phone?.split('@')[0]} is delivering zero-cost WhatsApp OTPs.
                  </p>
                </div>
              ) : waStatus?.qr_image ? (
                <div className="space-y-3">
                  <img
                    src={waStatus.qr_image}
                    alt="WhatsApp Pairing QR Code"
                    className="w-56 h-56 mx-auto border border-slate-300 rounded-lg p-2 bg-white shadow-xs"
                  />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open WhatsApp on your municipal phone &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong> and point your camera here.
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">
                    Generating fresh QR pairing code from local gateway...
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition shadow-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ENROL NEW MUNICIPAL WARD                              */}
      {/* ============================================================== */}
      {isAddWardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Enrol New Municipal Ward Jurisdiction
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Establishes an official ward boundary for GPS report routing, officer dispatch, and civic governance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWardModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWard} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ward Code / Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newWardNumber}
                    onChange={(e) => setNewWardNumber(e.target.value)}
                    placeholder="e.g. Ward-106"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Unique system code for the jurisdiction
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Administrative Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWardZone}
                    onChange={(e) => setNewWardZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                  >
                    <option value="Central Jalandhar">Central Jalandhar</option>
                    <option value="North Jalandhar">North Jalandhar</option>
                    <option value="East Jalandhar">East Jalandhar</option>
                    <option value="West Jalandhar">West Jalandhar</option>
                    <option value="Cantonment Zone">Cantonment Zone</option>
                    <option value="Phillaur Sub-Division">Phillaur Sub-Division</option>
                    <option value="Urban Extension Zone">Urban Extension Zone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Jurisdiction &amp; Locality Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newWardName}
                  onChange={(e) => setNewWardName(e.target.value)}
                  placeholder="e.g. Model House &amp; Basti Nau Urban Core"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Designated Counselor (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCounselorName}
                    onChange={(e) => setNewCounselorName(e.target.value)}
                    placeholder="e.g. Sh. Harpreet Singh"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ward Office Phone (Optional)
                  </label>
                  <div className="flex rounded border border-slate-300 overflow-hidden focus-within:border-slate-900">
                    <span className="bg-slate-100 text-slate-500 px-2.5 py-2 text-xs font-mono border-r border-slate-300">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="9876543215"
                      className="w-full px-2.5 py-2 text-xs bg-white text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Centroid Coordinates (For GPS Auto-Routing)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewWardLat(31.3260);
                      setNewWardLng(75.5762);
                    }}
                    className="text-[11px] text-blue-700 hover:underline font-semibold"
                  >
                    Reset to Jalandhar Core
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Citizen reports filed within 25 km of this centroid are automatically routed to this ward and its assigned administrator.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={newWardLat}
                      onChange={(e) => setNewWardLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={newWardLng}
                      onChange={(e) => setNewWardLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWardModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWard}
                  className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmittingWard ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Enrolling Ward Jurisdiction...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Enrol Ward Jurisdiction</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
