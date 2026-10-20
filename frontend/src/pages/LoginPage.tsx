import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { Button } from '../components/common/Button';
import { useToastStore } from '../store/toastStore';
import {
  Shield,
  User,
  Phone,
  KeyRound,
  ArrowRight,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Mail,
  MapPin,
} from 'lucide-react';

const DEPARTMENTS = [
  'Municipal Roads & Infrastructure Division',
  'Water Supply & Sewerage Unit',
  'Electrical & Street Lighting Cell',
  'Solid Waste & Sanitation Department',
  'Traffic & Public Safety Division',
  'Horticulture & Urban Forestry Cell',
];

const DESIGNATIONS = [
  'Assistant Engineer (AE)',
  'Junior Engineer (JE)',
  'Sub-Divisional Officer (SDO)',
  'Sanitary Inspector (SI)',
  'Executive Officer (EO)',
  'Chief Health Officer (CHO)',
  'Field Line Inspector',
];

const JURISDICTION_ZONES = [
  'Central Zone / Municipal HQ',
  'North Zone (GT Road & Cantt)',
  'South Zone (Model Town & Urban Estate)',
  'Phillaur Sub-Divisional Core',
  'West Zone (Basti Area)',
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const [activeRole, setActiveRole] = useState<'citizen' | 'officer'>('citizen');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const fillDemoProfile = (role: 'citizen' | 'officer') => {
    setActiveRole(role);
    setStep('phone');
    setErrorMsg(null);
    if (role === 'citizen') {
      setName('Priya Sharma');
      setPhone('9876543210');
      setEmail('priya.sharma@example.com');
    } else {
      setName('Er. Surinder Pal Singh');
      setPhone('9814012345');
      setEmail('surinder.singh@mcj.punjab.gov.in');
      setEmployeeId('PB-MCJ-2024-ENG-082');
      setDepartment(DEPARTMENTS[0]);
      setDesignation(DESIGNATIONS[0]);
      setJurisdictionZone(JURISDICTION_ZONES[0]);
    }
  };
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [jurisdictionZone, setJurisdictionZone] = useState(JURISDICTION_ZONES[0]);
  const [otp, setOtp] = useState('');

  // Loading & Rate limit states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // 60-Second Rate Limiter Countdown Timer
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (activeRole === 'officer') {
      if (!name.trim()) {
        setErrorMsg('Officer Name & Title is required for official verification.');
        return;
      }
      if (!employeeId.trim()) {
        setErrorMsg('Official Employee ID / Badge Number is required for municipal officers.');
        return;
      }
    }

    if (cooldownSeconds > 0) {
      setErrorMsg(`Rate limit active. Please wait ${cooldownSeconds}s before requesting a new OTP.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(cleanPhone, activeRole);
      setStep('otp');
      // Set strict 60s cooldown (or whatever backend dictates)
      setCooldownSeconds(res.retry_after || 60);
      addToast({
        type: 'info',
        title: 'OTP Dispatched',
        message: res.message || 'Verification code sent to your phone number.',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      const res = await authApi.verifyOtp({
        phone: cleanPhone,
        otp: otp.trim(),
        role: activeRole,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        department: activeRole === 'officer' ? department : undefined,
        designation: activeRole === 'officer' ? designation : undefined,
        employee_id: activeRole === 'officer' ? employeeId.trim() : undefined,
        jurisdiction_zone: activeRole === 'officer' ? jurisdictionZone : undefined,
      });

      login(res.token, res.user);

      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome, ${res.user.name}! Authenticated as ${
          activeRole === 'officer' ? 'Field Officer' : 'Citizen'
        }.`,
      });

      const redirectUrl = searchParams.get('redirect') || (activeRole === 'officer' ? '/dashboard' : '/');
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 sm:px-0">
      {/* Administrative Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CivicConnect Sign In</h1>
        <p className="text-sm text-slate-600 mt-1">
          Direct citizen grievance logging and officer dispatch verification
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="bg-slate-100 p-1 border border-slate-300 rounded-lg grid grid-cols-2 gap-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveRole('citizen');
            setStep('phone');
            setErrorMsg(null);
          }}
          className={`py-2.5 px-4 rounded-md text-sm font-semibold transition ${
            activeRole === 'citizen'
              ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Citizen Portal
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('officer');
            setStep('phone');
            setErrorMsg(null);
          }}
          className={`py-2.5 px-4 rounded-md text-sm font-semibold transition ${
            activeRole === 'officer'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Field Officer
        </button>
      </div>

      {/* Quick Demo Fill Shortcut */}
      <div className="flex items-center justify-between text-sm mb-4 px-1">
        <span className="text-slate-500 text-xs">Quick Fill:</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fillDemoProfile('citizen')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
          >
            Demo Citizen
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => fillDemoProfile('officer')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
          >
            Demo Officer
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-lg border border-slate-300 p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            {activeRole === 'citizen' ? 'Citizen Authentication' : 'Officer Field Verification'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {activeRole === 'citizen'
              ? 'Report local infrastructure issues and confirm completed field repairs.'
              : 'Access department dispatch queue and upload on-site resolution evidence.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 leading-relaxed">
            {errorMsg}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {activeRole === 'citizen' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    A 6-digit OTP will be dispatched via WhatsApp / SMS.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Officer Full Name & Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Er. Surinder Pal Singh"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Official Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Employee / Badge ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. PB-MCJ-2024-ENG-082"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Government Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. surinder.singh@mcj.punjab.gov.in"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    >
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Jurisdiction Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jurisdictionZone}
                    onChange={(e) => setJurisdictionZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  >
                    {JURISDICTION_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || cooldownSeconds > 0}
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium rounded mt-2"
            >
              {isLoading ? 'Sending...' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Request OTP Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {activeRole === 'officer' ? (
                    <>
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>{name || 'Municipal Officer'}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-slate-600" />
                      <span>{name || 'Citizen'}</span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-slate-800 font-semibold hover:underline text-[11px]"
                >
                  Edit Details
                </button>
              </div>

              <div className="text-slate-600 font-mono text-[11px]">
                Mobile: <strong className="text-slate-900">{phone}</strong>
                {activeRole === 'officer' && employeeId && (
                  <> · ID: <strong className="text-slate-900">{employeeId}</strong></>
                )}
              </div>

              {activeRole === 'officer' && (
                <div className="text-slate-500 text-[10px] truncate">
                  {designation} · {department} · {jurisdictionZone}
                </div>
              )}
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
                placeholder="123456"
                className="w-full px-3 py-2.5 text-center tracking-widest text-lg font-mono font-bold bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="text-slate-500">Demo Code: <strong>123456</strong></span>
                {cooldownSeconds > 0 ? (
                  <span className="text-slate-600 font-mono font-medium">
                    Resend in {cooldownSeconds}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-slate-900 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || otp.length < 4}
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium rounded mt-2"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            Protected by 60s cooldown rate limiter & salted OTP verification.
          </p>
        </div>
      </div>
    </div>
  );
};
