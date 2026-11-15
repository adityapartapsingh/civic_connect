import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi, adminApi } from '../services/api';
import { Button } from '../components/common/Button';
import { useToastStore } from '../store/toastStore';
import { UserProfile } from '../types';
import {
  User,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Clock,
  Building2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  UserPlus,
  LogIn,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { validateIndianPhone } from '../utils/validators';

const MUNICIPAL_WARDS = [
  { id: 'Ward-101', name: 'Ward 1 - Model Town Urban Zone' },
  { id: 'Ward-102', name: 'Ward 2 - Civil Lines Administrative Ward' },
  { id: 'Ward-103', name: 'Ward 3 - Cantt Road & Defense Colony' },
  { id: 'Ward-104', name: 'Ward 4 - Rama Mandi Commercial Hub' },
  { id: 'Ward-105', name: 'Ward 5 - Phillaur Municipal Core' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  // Active Portal Mode: 'citizen' vs 'staff' (Super Admin is strictly at /super-admin)
  const initialPortal = searchParams.get('portal') === 'staff' ? 'staff' : 'citizen';
  const [activePortal, setActivePortal] = useState<'citizen' | 'staff'>(initialPortal);

  // Citizen Authentication Mode: 'signin' vs 'signup'
  const isExplicitSignup =
    searchParams.get('mode') === 'signup' ||
    location.pathname === '/signup' ||
    location.pathname === '/register';
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(isExplicitSignup ? 'signup' : 'signin');

  // Municipal Staff Auth Method: 'otp' vs 'passcode'
  const [staffAuthMethod, setStaffAuthMethod] = useState<'otp' | 'passcode'>('otp');

  // Flow Step: 'form' vs 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Citizen Form Fields
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [wardId, setWardId] = useState('Ward-102');
  const [otp, setOtp] = useState('');
  const [testOtp, setTestOtp] = useState<string>('');

  // Municipal Staff Form Fields (Ward Admin & Field Officer)
  const [staffPhone, setStaffPhone] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffPasscode, setStaffPasscode] = useState('');

  // Loading, Messages & Rate Limit
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Validation derivations
  const phoneValidation = validateIndianPhone(phone);
  const staffPhoneValidation = validateIndianPhone(staffPhone);

  // Sync mode from search params if changed
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setAuthMode('signup');
    }
  }, [searchParams]);

  // Rate Limiter Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  /**
   * Role-based destination routing based on assigned authority.
   */
  const navigateByRole = (user: UserProfile, redirectUrl?: string | null) => {
    if (user.role === 'super_admin') {
      addToast({
        type: 'success',
        title: 'Super Administrator Authorized',
        message: `Welcome, ${user.name}. Opening Civic Connect Super Admin Console...`,
      });
      navigate(redirectUrl || '/super-admin');
      return;
    }

    if (user.role === 'admin') {
      addToast({
        type: 'success',
        title: 'Ward Administrator Authorized',
        message: `Welcome, ${user.name}. Opening Ward Admin Console for ${user.ward_name || user.ward_id || 'Ward'}...`,
      });
      navigate(redirectUrl || '/admin-portal');
      return;
    }

    if (user.role === 'officer') {
      const taskLabels = user.assigned_tasks?.length
        ? user.assigned_tasks.join(', ')
        : 'General Field Maintenance';
      addToast({
        type: 'success',
        title: 'Field Officer Authorized',
        message: `Welcome, ${user.name} (${user.designation || 'Field Officer'}). Assigned Tasks: ${taskLabels}. Opening Dispatch Queue...`,
      });
      navigate(redirectUrl || '/dashboard');
      return;
    }

    // Citizen or general user
    addToast({
      type: 'success',
      title: authMode === 'signup' ? 'Account Created Successfully' : 'Welcome Back',
      message: `Signed in as ${user.name || 'Citizen'}.`,
    });
    navigate(redirectUrl || '/');
  };

  /**
   * Citizen OTP Request Submission
   */
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const val = validateIndianPhone(phone);
    if (!val.isValid) {
      setErrorMsg(val.error || 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    const cleanPhone = val.normalized;

    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name to create an account.');
      return;
    }

    if (cooldownSeconds > 0) {
      setErrorMsg(`Rate limit active. Please wait ${cooldownSeconds}s before requesting a new OTP.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(cleanPhone, 'citizen', authMode);

      // If user is trying to Sign In, but account does not exist -> prompt to Sign Up
      if (authMode === 'signin' && res.account_exists === false) {
        setAuthMode('signup');
        setInfoMsg(`No existing account found for ${cleanPhone}. Please complete your name and ward to register.`);
        setIsLoading(false);
        return;
      }

      // If user is trying to Sign Up, but account already exists -> prompt to Sign In
      if (authMode === 'signup' && res.account_exists === true) {
        setAuthMode('signin');
        setErrorMsg(`An account with phone number ${cleanPhone} already exists (${res.user_name || 'Citizen'}). Please Sign In.`);
        setIsLoading(false);
        return;
      }

      const generatedCode = res.test_otp || res.dev_otp || '123456';
      setTestOtp(generatedCode);
      setOtp(generatedCode);
      setStep('otp');
      setCooldownSeconds(res.retry_after || 60);
      addToast({
        type: 'success',
        title: 'Test OTP Generated',
        message: `Your verification code is ${generatedCode}. Displayed on screen.`,
      });
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('already exists')) {
        setAuthMode('signin');
        setErrorMsg(err.message || `An account with ${cleanPhone} already exists. Please Sign In.`);
      } else if (err.status === 404 || err.message?.includes('No account found')) {
        setAuthMode('signup');
        setInfoMsg(err.message || `No account found for ${cleanPhone}. Please register to create an account.`);
      } else {
        setErrorMsg(err.message || 'Failed to dispatch verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Municipal Staff (Ward Admin & Field Officer) OTP Request Submission
   */
  const handleStaffOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const val = validateIndianPhone(staffPhone);
    if (!val.isValid) {
      setErrorMsg(val.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const cleanPhone = val.normalized;

    if (cooldownSeconds > 0) {
      setErrorMsg(`Rate limit active. Please wait ${cooldownSeconds}s before requesting a new OTP.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(cleanPhone, 'officer', 'signin');
      const generatedCode = res.test_otp || res.dev_otp || '123456';
      setPhone(cleanPhone);
      setTestOtp(generatedCode);
      setOtp(generatedCode);
      setStep('otp');
      setCooldownSeconds(res.retry_after || 60);
      addToast({
        type: 'success',
        title: 'Official OTP Generated',
        message: `Verification code for ${res.user_name || cleanPhone} is ${generatedCode}.`,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch official verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unified OTP Code Verification (Both Citizen & Municipal Staff)
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const selectedWard = MUNICIPAL_WARDS.find((w) => w.id === wardId);
      const isStaff = activePortal === 'staff';

      const res = await authApi.verifyOtp({
        phone: cleanPhone,
        otp: otp.trim(),
        role: isStaff ? 'officer' : 'citizen',
        name: !isStaff && name.trim() ? name.trim() : undefined,
        email: !isStaff && email.trim() ? email.trim() : undefined,
        ward_id: !isStaff ? wardId : undefined,
        ward_name: !isStaff ? selectedWard?.name : undefined,
        mode: isStaff ? 'signin' : authMode,
      });

      login(res.token, res.user);
      navigateByRole(res.user, searchParams.get('redirect'));
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('already exists')) {
        setStep('form');
        setAuthMode('signin');
        setErrorMsg(err.message || 'An account with this phone number already exists. Please Sign In.');
      } else {
        setErrorMsg(err.message || 'Invalid verification code. Please check and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Municipal Staff Passcode Authentication (Employee ID + PIN fallback)
   */
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const ident = staffId.trim();
    const pin = staffPasscode.trim();

    if (!ident || !pin) {
      setErrorMsg('Please enter both Employee ID and Security Passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminApi.quickLogin(ident, pin);
      login(res.token, res.user);
      navigateByRole(res.user, searchParams.get('redirect'));
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Employee ID or Security Passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto py-4">
      {/* Top Header & Back Link */}
      <div className="mb-4 flex items-center justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* CivicConnect Portal Card */}
      <div className="bg-white rounded-xl border border-slate-300 p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            CivicConnect Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {activePortal === 'citizen'
              ? authMode === 'signup'
                ? 'Create a new citizen account to report civic issues and track resolutions'
                : 'Sign in with your registered mobile phone number'
              : 'Municipal Corporation Staff Gateway for Ward Admins and Field Officers'}
          </p>
        </div>

        {/* Portal Selection Tabs (Citizen vs Municipal Staff) */}
        <div className="bg-slate-100 p-1 border border-slate-200 rounded-lg grid grid-cols-2 gap-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setActivePortal('citizen');
              setStep('form');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'citizen'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-brand-600" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('staff');
              setStep('form');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'staff'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Municipal Staff</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* STEP 2: UNIFIED OTP VERIFICATION (CITIZEN & MUNICIPAL STAFF)  */}
        {/* ============================================================== */}
        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Identity Badge */}
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                activePortal === 'staff'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold">
                  {activePortal === 'staff' ? (
                    <>
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">Municipal Official Verification</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-brand-600" />
                      <span>{name || (authMode === 'signup' ? 'New Citizen' : 'Registered Citizen')}</span>
                    </>
                  )}
                </div>
                <div
                  className={`font-mono text-[11px] mt-0.5 ${
                    activePortal === 'staff' ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Mobile: +91 {phone}
                  {activePortal === 'staff' && ' • Ward Admin / Field Inspector'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className={`font-semibold hover:underline text-[11px] ${
                  activePortal === 'staff' ? 'text-cyan-400' : 'text-slate-800'
                }`}
              >
                Change Phone
              </button>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-medium">
                {errorMsg}
              </div>
            )}

            {/* Display Test OTP Code on Screen */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                🧪 Verification Code (Screen & WhatsApp)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black font-mono tracking-widest text-emerald-950 bg-white px-4 py-1 rounded border border-emerald-300 shadow-xs">
                  {testOtp || otp || '123456'}
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(testOtp || '123456')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition shadow-xs"
                >
                  Auto-Fill
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                Use this verification code to complete sign-in.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={testOtp || '123456'}
                className="w-full px-3 py-2.5 text-center tracking-widest text-lg font-mono font-bold bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="text-slate-500">
                  Active Code: <strong className="text-slate-800 font-mono">{testOtp || otp || '123456'}</strong>
                </span>
                {cooldownSeconds > 0 ? (
                  <span className="text-slate-600 font-mono font-medium">
                    Resend in {cooldownSeconds}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) =>
                      activePortal === 'staff' ? handleStaffOtpSubmit(e) : handleCitizenSubmit(e)
                    }
                    className="text-slate-900 font-bold hover:underline"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || otp.length < 4}
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded mt-2"
            >
              {isLoading
                ? 'Verifying Authority...'
                : activePortal === 'staff'
                ? 'Authorize & Open Municipal Console'
                : authMode === 'signup'
                ? 'Complete Registration'
                : 'Verify & Continue'}
            </Button>
          </form>
        ) : (
          /* ============================================================== */
          /* STEP 1: FORM SELECTION (CITIZEN VS MUNICIPAL STAFF)           */
          /* ============================================================== */
          <>
            {/* 1. CITIZEN FORM */}
            {activePortal === 'citizen' && (
              <div>
                {/* Sign In vs Sign Up Sub-Tabs */}
                <div className="flex items-center justify-center pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className={`text-sm font-bold pb-1 border-b-2 transition ${
                        authMode === 'signin'
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sign In
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className={`text-sm font-bold pb-1 border-b-2 transition ${
                        authMode === 'signup'
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Info Alert Message */}
                {infoMsg && (
                  <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                    {infoMsg}
                  </div>
                )}

                {/* Error Alert Message */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-medium">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>{errorMsg}</span>
                      {errorMsg.toLowerCase().includes('sign up') && authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signup');
                            setErrorMsg(null);
                          }}
                          className="shrink-0 self-start sm:self-auto px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-[11px] transition shadow-xs"
                        >
                          Sign Up with OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCitizenSubmit} className="space-y-4">
                  {/* Fields shown only in Sign Up Mode */}
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Aman Deep Singh"
                            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Select Your Municipal Ward <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={wardId}
                            onChange={(e) => setWardId(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          >
                            {MUNICIPAL_WARDS.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. aman.singh@example.com"
                            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mobile Phone (Required for both Sign In & Sign Up) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {/* Real-time Phone Validation Feedback */}
                    {phone.trim().length > 0 && (
                      <div className="mt-1">
                        {phoneValidation.isValid ? (
                          <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Valid 10-digit Indian Mobile (+91 {phoneValidation.normalized})</span>
                          </p>
                        ) : phone.replace(/\D/g, '').length >= 10 ? (
                          <p className="text-[11px] text-red-600 font-medium">
                            {phoneValidation.error}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500">
                            Enter 10-digit Indian mobile number starting with 6, 7, 8, or 9
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || cooldownSeconds > 0}
                    className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded mt-2"
                  >
                    {isLoading ? (
                      'Verifying...'
                    ) : cooldownSeconds > 0 ? (
                      `Wait ${cooldownSeconds}s`
                    ) : authMode === 'signup' ? (
                      'Sign Up & Verify Mobile OTP'
                    ) : (
                      'Continue with Mobile OTP'
                    )}
                  </Button>

                  {/* Toggle Link Between Sign In & Sign Up */}
                  <div className="pt-2 text-center text-xs">
                    {authMode === 'signin' ? (
                      <p className="text-slate-600">
                        Don't have an account yet?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signup');
                            setErrorMsg(null);
                            setInfoMsg(null);
                          }}
                          className="font-bold text-brand-700 hover:text-brand-900 underline"
                        >
                          Sign Up here
                        </button>
                      </p>
                    ) : (
                      <p className="text-slate-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signin');
                            setErrorMsg(null);
                            setInfoMsg(null);
                          }}
                          className="font-bold text-brand-700 hover:text-brand-900 underline"
                        >
                          Sign In here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* 2. MUNICIPAL STAFF FORM (OTP & PASSCODE OPTIONS) */}
            {activePortal === 'staff' && (
              <div className="pt-1">
                {/* Method Switcher Sub-Tabs */}
                <div className="bg-slate-100 p-1 border border-slate-200 rounded-md grid grid-cols-2 gap-1 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffAuthMethod('otp');
                      setErrorMsg(null);
                    }}
                    className={`py-1.5 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      staffAuthMethod === 'otp'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Mobile OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffAuthMethod('passcode');
                      setErrorMsg(null);
                    }}
                    className={`py-1.5 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      staffAuthMethod === 'passcode'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <span>Passcode / PIN</span>
                  </button>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Staff Option A: Official Mobile OTP */}
                {staffAuthMethod === 'otp' ? (
                  <form onSubmit={handleStaffOtpSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Registered Official Mobile <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Ward Admin / Field Officer
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={staffPhone}
                          onChange={(e) => setStaffPhone(e.target.value)}
                          placeholder="e.g. 9876543210 (Admin) or 9814099881 (Officer)"
                          className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>

                      {/* Phone validation indicator */}
                      {staffPhone.trim().length > 0 && (
                        <div className="mt-1">
                          {staffPhoneValidation.isValid ? (
                            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Valid Official Mobile (+91 {staffPhoneValidation.normalized})</span>
                            </p>
                          ) : staffPhone.replace(/\D/g, '').length >= 10 ? (
                            <p className="text-[11px] text-red-600 font-medium">
                              {staffPhoneValidation.error}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500">
                              Enter 10-digit official registered mobile number
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Demo Pre-fill Pills */}
                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                        Quick Official Accounts (Registered in Atlas):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStaffPhone('9876543210');
                            setErrorMsg(null);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-semibold text-slate-800 transition"
                        >
                          Ward 101 Admin (9876543210)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStaffPhone('9876543211');
                            setErrorMsg(null);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-semibold text-slate-800 transition"
                        >
                          Ward 102 Admin (9876543211)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStaffPhone('9814099881');
                            setErrorMsg(null);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-semibold text-slate-800 transition"
                        >
                          Field Officer (9814099881)
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || cooldownSeconds > 0}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Generating Official OTP...</span>
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <span>Wait {cooldownSeconds}s before resend</span>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 text-cyan-400" />
                          <span>Send Official OTP via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Staff Option B: Passcode / PIN Login */
                  <form onSubmit={handleStaffLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employee ID / Registered Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="Employee ID or Phone (e.g. PB-MCJ-ADM-W102 / 9876543211)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Security Passcode / Generated PIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={staffPasscode}
                        onChange={(e) => setStaffPasscode(e.target.value)}
                        placeholder="e.g. MCJ-W102-SEC9 or OFF-W102-7492"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Verifying Official Passcode...</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-cyan-400" />
                          <span>Sign In as Municipal Staff</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
