import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { authApi } from '../services/api';
import { INDIAN_STATES, STATE_DISTRICTS_MAP, getWardsForDistrict } from '../utils/constants';
import { Modal } from '../components/common/Modal';
import {
  Award,
  Zap,
  Shield,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Video,
  MapPin,
  TrendingUp,
  Lock,
  
  Phone,
  Mail,
  User,
  ArrowRight,
  LogOut,
  Trash2,
  Gift,
  Edit3,
  KeyRound,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const badgeIcons: Record<string, React.ElementType> = {
  Eye,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Video,
};

const DEFAULT_CIVIC_BADGES = [
  {
    id: 'first_report',
    name: 'First Watchdog',
    description: 'Submitted your first verified municipal civic issue.',
    icon: 'Eye',
    is_unlocked: true,
    unlocked_at: '2026-03-15',
    points_reward: 50,
  },
  {
    id: 'verified_fix',
    name: 'Resolution Sentinel',
    description: 'Confirmed and verified an officer resolution in your ward.',
    icon: 'ShieldCheck',
    is_unlocked: true,
    unlocked_at: '2026-03-20',
    points_reward: 75,
  },
  {
    id: 'clean_streak',
    name: 'Neighborhood Champion',
    description: 'Reported 5 or more resolved neighborhood issues.',
    icon: 'CheckCircle2',
    is_unlocked: false,
    points_reward: 150,
  },
  {
    id: 'civic_hero',
    name: 'Ward Pioneer',
    description: 'Top contributor in your municipal ward standing.',
    icon: 'Trophy',
    is_unlocked: false,
    points_reward: 300,
  },
];

export const ProfilePage: React.FC = () => {
  const { user, isOfficer, logout, setUser } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // -------------------------------------------------------------
  // EDIT PROFILE FORM STATE
  // -------------------------------------------------------------
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editState, setEditState] = useState(user?.state || 'Punjab');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'Jalandhar');
  const [editWard, setEditWard] = useState(user?.ward_name || user?.ward || 'Ward 2 - Civil Lines');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync edit form with current user whenever user changes or modal opens
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditState(user.state || 'Punjab');
      setEditDistrict(user.district || 'Jalandhar');
      setEditWard(user.ward_name || user.ward || 'Ward 2 - Civil Lines Administrative Ward');
    }
  }, [user, isEditModalOpen]);

  // Dynamic Districts for selected State
  const availableDistricts = useMemo(() => {
    const list = STATE_DISTRICTS_MAP[editState] || ['Jalandhar'];
    if (editDistrict && !list.includes(editDistrict)) {
      return [editDistrict, ...list];
    }
    return list;
  }, [editState, editDistrict]);

  // Handle state change: update state, and dynamically switch district and ward
  const handleStateSelect = (newState: string) => {
    setEditState(newState);
    const newDistricts = STATE_DISTRICTS_MAP[newState] || [];
    if (newDistricts.length > 0 && !newDistricts.includes(editDistrict)) {
      const nextDistrict = newDistricts[0];
      setEditDistrict(nextDistrict);
      const newWards = getWardsForDistrict(nextDistrict);
      if (newWards.length > 0) {
        setEditWard(newWards[0]);
      }
    }
  };

  // Dynamic Wards for selected District
  const availableWards = useMemo(() => {
    const list = getWardsForDistrict(editDistrict);
    if (editWard && !list.includes(editWard)) {
      return [editWard, ...list];
    }
    return list;
  }, [editDistrict, editWard]);

  // Handle district change: update district and dynamically switch ward
  const handleDistrictSelect = (newDistrict: string) => {
    setEditDistrict(newDistrict);
    const newWards = getWardsForDistrict(newDistrict);
    if (newWards.length > 0 && !newWards.includes(editWard)) {
      setEditWard(newWards[0]);
    }
  };



  // Handle Submitting Edit Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!editName.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Full name cannot be blank.',
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const payload = {
        user_id: user.id,
        phone: user.phone,
        name: editName.trim(),
        email: editEmail.trim(),
        state: editState,
        district: editDistrict.trim(),
        ward: editWard.trim(),
        ward_name: editWard.trim(),
      };

      const updated = await authApi.updateProfile(payload);
      setUser(updated);

      // Keep jurisdiction synced in local storage
      if (editState) {
        localStorage.setItem('civic_user_state', editState);
      }

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal and jurisdiction details have been saved.',
      });

      setIsEditModalOpen(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update profile details. Please retry.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out from Civic Connect.',
    });
    navigate('/');
  };

  // -------------------------------------------------------------
  // DELETE ACCOUNT (WITH MANDATORY OTP) STATE & HANDLERS
  // -------------------------------------------------------------
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [deleteOtpCode, setDeleteOtpCode] = useState('');
  const [deleteCooldown, setDeleteCooldown] = useState(0);
  const [isSendingDeleteOtp, setIsSendingDeleteOtp] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteDemoOtpNotice, setDeleteDemoOtpNotice] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Cooldown countdown timer for account deletion OTP
  useEffect(() => {
    let timer: any = null;
    if (deleteCooldown > 0) {
      timer = setInterval(() => {
        setDeleteCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deleteCooldown]);

  const handleOpenDeleteAccountModal = () => {
    setDeleteOtpSent(false);
    setDeleteOtpCode('');
    setDeleteCooldown(0);
    setDeleteDemoOtpNotice(null);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleSendDeleteOtp = async () => {
    if (!user?.phone) {
      addToast({
        type: 'error',
        title: 'Phone Number Missing',
        message: 'No registered mobile number found on account to send verification code.',
      });
      return;
    }

    setIsSendingDeleteOtp(true);
    setDeleteError(null);

    try {
      const response = await authApi.sendOtp(user.phone, user.role || 'citizen');
      setDeleteOtpSent(true);
      setDeleteCooldown(response.retry_after || 60);

      const demoCode = response.dev_otp || response.test_otp;
      if (demoCode) {
        setDeleteDemoOtpNotice(`Demo Security Code: ${demoCode}`);
      }

      addToast({
        type: 'info',
        title: 'Security Code Dispatched',
        message: `6-digit deletion verification code sent to +91 ${user.phone}.`,
      });
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to dispatch verification OTP. Please try again.');
      addToast({
        type: 'error',
        title: 'OTP Dispatch Failed',
        message: err.message || 'Could not send verification code.',
      });
    } finally {
      setIsSendingDeleteOtp(false);
    }
  };

  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteOtpCode || deleteOtpCode.trim().length !== 6) {
      setDeleteError('Please enter a valid 6-digit verification code.');
      return;
    }

    if (!user?.phone) return;

    setIsDeletingAccount(true);

    try {
      const result = await authApi.deleteAccountWithOtp({
        phone: user.phone,
        otp: deleteOtpCode.trim(),
        user_id: user.id,
      });

      logout();
      setIsDeleteModalOpen(false);

      addToast({
        type: 'info',
        title: 'Account Permanently Deleted',
        message: result.message || 'Your account has been deleted. Your past reports and upvotes remain anonymized in the database.',
      });

      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Account deletion failed. Please check the verification code.');
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Invalid or expired verification code.',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Civic Connect</h2>
          <p className="text-sm text-slate-600 mb-6">
            Track your submitted civic issues, earn recognition points, and verify municipal resolutions in your ward.
          </p>
          <Link
            to="/login?redirect=/profile"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2.5 rounded-md transition shadow-xs"
          >
            Sign In with Mobile OTP
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Level computation: Every 60 points = 1 level
  const currentPoints = user.points ?? 0;
  const currentLevel = user.level ?? Math.max(1, Math.floor(currentPoints / 60) + 1);
  const nextLevelThreshold = currentLevel * 60;
  const pointsInCurrentLevel = currentPoints % 60;
  const levelProgressPercent = Math.min(Math.round((pointsInCurrentLevel / 60) * 100), 100);

  // Safe fallback for civic badges
  const rawBadges = (user.badges && Array.isArray(user.badges) && user.badges.length > 0)
    ? user.badges
    : DEFAULT_CIVIC_BADGES;
  const badgesList = rawBadges.map((b) => ({
    ...b,
    is_unlocked: Boolean(
      b.is_unlocked ||
      (b.id === 'first_report' && (user.reports_submitted_count ?? 0) > 0) ||
      (b.id === 'verified_fix' && (user.reports_resolved_count ?? 0) > 0) ||
      (b.id === 'civic_hero' && currentPoints >= 200)
    ),
  }));
  const unlockedBadgesCount = badgesList.filter((b) => b.is_unlocked).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* ========================================================= */}
      {/* PROFILE HEADER CARD */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 text-white p-6 sm:p-7 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 text-amber-400 flex items-center justify-center font-black text-2xl shadow-inner">
              {(user.name || 'Citizen').charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name || 'Civic User'}</h1>
                {isOfficer ? (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {user.designation || 'Field Officer'}
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    Lvl {currentLevel} Citizen
                  </span>
                )}
              </div>

              {isOfficer && (
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-y-1 gap-x-2.5">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{user.department || 'Municipal Division'}</span>
                  </span>
                  {user.employee_id && (
                    <span className="font-mono text-[11px] text-slate-400">
                      Badge ID: <strong className="text-slate-200">{user.employee_id}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Header Action: Edit Profile (Single Line Button) */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 rounded-md text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white shrink-0 self-start sm:self-auto shadow-xs"
            title="Edit Profile Details"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Level {currentLevel} Civic Standing
            </span>
            <span className="font-mono text-amber-300 font-bold">
              Current: {currentPoints} PTS · Next Goal: {nextLevelThreshold} PTS ({Math.max(0, 60 - pointsInCurrentLevel)} pts to Lvl {currentLevel + 1})
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-amber-400 h-full rounded transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* QUICK ACTION BUTTONS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Link
          to="/?tab=my_reports"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold text-xs rounded-lg border border-slate-300 shadow-xs transition"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>My Reports</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
            {user.reports_submitted_count ?? 0}
          </span>
        </Link>

        <Link
          to="/rewards?tab=rewards"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold text-xs rounded-lg border border-slate-300 shadow-xs transition"
        >
          <Gift className="w-4 h-4 text-amber-600" />
          <span>Redeem Rewards</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
            {currentPoints} PTS
          </span>
        </Link>

        <Link
          to="/volunteers"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold text-xs rounded-lg border border-slate-300 shadow-xs transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Volunteer Hub</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
            {user.role === 'volunteer' ? 'Active' : 'Join'}
          </span>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* IMPACT STATS GRID */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Reports Filed</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.reports_submitted_count ?? 0}
          </div>
          <span className="text-[11px] text-slate-600 font-medium">All verified live</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Fixes Completed</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">
            {user.reports_resolved_count ?? 0}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">80% resolution rate</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Civic Points</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{user.points ?? 0}</div>
          <span className="text-[11px] text-slate-600 font-medium">Top 5% in Ward</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Upvotes Given</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {user.upvotes_given_count ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Duplicates spared</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CIVIC VOLUNTEER CORPS STATUS CARD */}
      {/* ========================================================= */}
      <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  {user.role === 'volunteer' || user.volunteer_status === 'APPROVED'
                    ? 'Authorized Civic Youth Volunteer'
                    : user.volunteer_status === 'PENDING'
                    ? 'Volunteer Application Under Verification'
                    : 'Municipal Youth Volunteer Corps'}
                </h3>
                {user.volunteer_status === 'APPROVED' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    APPROVED • {user.volunteer_scheme || 'COMMUNITY'}
                  </span>
                ) : user.volunteer_status === 'PENDING' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    PENDING WARD REVIEW
                  </span>
                ) : user.volunteer_status === 'REJECTED' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-800 border border-red-300">
                    APPLICATION DECLINED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    OPEN ENROLLMENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {user.role === 'volunteer' || user.volunteer_status === 'APPROVED'
                  ? `Enlisted under ${user.volunteer_scheme || 'Community'} Scheme ${user.volunteer_institution ? `(${user.volunteer_institution})` : ''}. 1.25x Civic Point multiplier applied to all your reports and verified actions.`
                  : user.volunteer_status === 'PENDING'
                  ? `Application ${user.volunteer_application_id ? `#${user.volunteer_application_id}` : ''} has been submitted and is in the verification queue of the Ward Administrator.`
                  : 'Join NSS, NCC, NYKS, or Community Sentinels to assist municipal squads, unlock a 1.25x point multiplier, and receive 100 induction bonus points & coins.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <Link
              to="/volunteers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
            >
              <span>{user.volunteer_status === 'PENDING' ? 'Track Status' : user.role === 'volunteer' ? 'Volunteer Hub' : 'Register as Volunteer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROFILE DETAILS & JURISDICTION SUMMARY CARD */}
      {/* ========================================================= */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Account & Location Details</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Edit Information</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Full Name</span>
            <div className="font-semibold text-slate-900 text-sm">{user.name}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Registered Mobile</span>
            <div className="font-mono font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <span>+91 {user.phone || ''}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.2 rounded border border-emerald-200">
                Verified
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Email Address</span>
            <div className="font-medium text-slate-800 text-sm">
              {user.email || <span className="text-slate-400 italic">Not configured</span>}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">State Jurisdiction</span>
            <div className="font-semibold text-slate-900 text-sm">{user.state || 'Punjab'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">District</span>
            <div className="font-semibold text-slate-900 text-sm">{user.district || 'Jalandhar'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Municipal Ward / Division</span>
            <div className="font-semibold text-slate-900 text-sm">
              {user.ward_name || user.ward || 'Ward 2 - Civil Lines'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BADGES & ACHIEVEMENTS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-lg p-5 sm:p-7 border border-slate-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Civic Badges & Achievements ({unlockedBadgesCount}/{badgesList.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Unlock badges to earn points</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {badgesList.map((badge) => {
            const IconComponent = badgeIcons[badge.icon] || Award;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-lg border flex items-start gap-3.5 transition ${
                  badge.is_unlocked
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                    badge.is_unlocked
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {badge.is_unlocked ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900">{badge.name}</h4>
                    <span className="text-[10px] font-mono font-medium text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      +{badge.points_reward} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                  {badge.is_unlocked && badge.unlocked_at && (
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold block mt-1">
                      Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ACCOUNT SESSION & DELETION ACTIONS */}
      {/* ========================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition shadow-xs"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Sign Out</span>
        </button>

        <button
          type="button"
          onClick={handleOpenDeleteAccountModal}
          className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition shadow-xs"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDIT PROFILE DETAILS */}
      {/* ========================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile & Jurisdiction"
        description="Update your contact information and municipal jurisdiction settings."
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 py-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Mobile (Identity Key)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 {user.phone || ''}</span>
              <span className="ml-auto text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Non-editable
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mobile number is your verified civic identity.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
              placeholder="name@example.com (optional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State Jurisdiction *
              </label>
              <select
                value={editState}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium cursor-pointer"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District *
              </label>
              <select
                value={editDistrict}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium cursor-pointer"
              >
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Municipal Ward / Division *
            </label>
            <select
              value={editWard}
              onChange={(e) => setEditWard(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium cursor-pointer"
            >
              {availableWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to customize local issue feeds and ward rankings.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={isSavingProfile}
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs disabled:opacity-50"
            >
              {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: LOGOUT CONFIRMATION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out of Civic Connect"
        maxWidth="sm"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-0.5">Are you sure you want to sign out?</p>
              <p>
                You will need your mobile number (+91 {user.phone || ''}) to sign back into your account.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Confirm Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: DELETE ACCOUNT WITH MANDATORY OTP */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete My Civic Connect Account"
        maxWidth="md"
      >
        <div className="space-y-4 py-1">
          {/* Permanent Deletion & Anonymization Notice */}
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Warning: This action is permanent and cannot be undone</span>
            </div>
            <p className="leading-relaxed text-red-800">
              Your personal profile, contact credentials, and session access will be permanently deleted from the database.
            </p>
            <p className="leading-relaxed text-red-800 font-medium">
              To safeguard public interest and municipal resolution progress, <strong>all reports and upvotes previously submitted will remain in the database marked as "Anonymous Citizen"</strong>.
            </p>
          </div>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          {deleteDemoOtpNotice && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-900 font-mono font-medium flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{deleteDemoOtpNotice}</span>
            </div>
          )}

          {!deleteOtpSent ? (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700">
                <p>
                  To confirm ownership before deleting your account, an OTP security code will be sent to your registered mobile:
                </p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                  +91 {user.phone || ''}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSendingDeleteOtp}
                  onClick={handleSendDeleteOtp}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-xs disabled:opacity-50"
                >
                  {isSendingDeleteOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSendingDeleteOtp ? 'Sending OTP...' : 'Send Deletion OTP'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmDeleteAccount} className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    6-Digit Security OTP *
                  </label>
                  <button
                    type="button"
                    disabled={deleteCooldown > 0 || isSendingDeleteOtp}
                    onClick={handleSendDeleteOtp}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 disabled:text-slate-400 disabled:no-underline underline"
                  >
                    {deleteCooldown > 0 ? `Resend in ${deleteCooldown}s` : 'Resend Code'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={deleteOtpCode}
                  onChange={(e) => setDeleteOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center font-mono tracking-widest text-lg font-bold px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="• • • • • •"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || deleteOtpCode.length !== 6}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-xs disabled:opacity-50"
                >
                  {isDeletingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeletingAccount ? 'Verifying & Deleting...' : 'Verify OTP & Permanently Delete Account'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
