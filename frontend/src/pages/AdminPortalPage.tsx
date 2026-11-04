import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { adminApi, issuesApi, volunteerApi } from '../services/api';
import { VolunteerApplication } from '../types';
import { UserProfile, AdminCredentialsSlip, Issue } from '../types';
import {
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
  Wrench,
  Flame,
  Shield,
  Users,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const MUNICIPAL_WARDS = [
  { id: 'Ward-101', name: 'Ward 1 - Model Town Urban Zone', zone: 'Central Jalandhar' },
  { id: 'Ward-102', name: 'Ward 2 - Civil Lines Administrative Ward', zone: 'North Jalandhar' },
  { id: 'Ward-103', name: 'Ward 3 - Cantt Road & Defense Colony', zone: 'East Jalandhar' },
  { id: 'Ward-104', name: 'Ward 4 - Rama Mandi Commercial Hub', zone: 'East Jalandhar' },
  { id: 'Ward-105', name: 'Ward 5 - Phillaur Municipal Core', zone: 'Phillaur Sub-Division' },
];

const TASK_SPECIALTIES = [
  {
    id: 'road',
    label: 'Roads & Potholes Repair Squad',
    categories: ['pothole', 'road_damage', 'sidewalk'],
    icon: '🚧',
    dept: 'Municipal Roads & Infrastructure Division',
  },
  {
    id: 'sanitation',
    label: 'Solid Waste & Sanitation Crew',
    categories: ['garbage'],
    icon: '🗑️',
    dept: 'Solid Waste & Sanitation Department',
  },
  {
    id: 'electrical',
    label: 'Streetlighting & Electrical Cell',
    categories: ['streetlight', 'traffic_signal'],
    icon: '💡',
    dept: 'Electrical & Street Lighting Cell',
  },
  {
    id: 'water',
    label: 'Water Pipeline & Sewer Conduits',
    categories: ['water_leakage', 'drainage'],
    icon: '🚰',
    dept: 'Water Supply & Sewerage Unit',
  },
  {
    id: 'horticulture',
    label: 'Urban Horticulture & Tree Clearance',
    categories: ['fallen_tree'],
    icon: '🌳',
    dept: 'Horticulture & Urban Forestry Cell',
  },
];

export const AdminPortalPage: React.FC = () => {
  const { user, login, logout, isAdmin } = useAuthStore();
  const { addToast } = useToastStore();

  // Active Ward: Default to user's ward or Ward-102
  const activeWardId = user?.ward_id || 'Ward-102';

  // Data State
  const [officersList, setOfficersList] = useState<UserProfile[]>([]);
  const [wardTickets, setWardTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form: Ward Admin provisions Field Officer
  const [newOfficerName, setNewOfficerName] = useState<string>('');
  const [newOfficerPhone, setNewOfficerPhone] = useState<string>('');
  const [newOfficerEmail, setNewOfficerEmail] = useState<string>('');
  const [newOfficerDesignation, setNewOfficerDesignation] = useState<string>('Junior Engineer (JE)');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('road');

  // Issued Credentials Slip Modal
  // Volunteer Applications Queue State
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplication[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState<boolean>(false);
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<string>('PENDING');
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
        ward_id: activeWardId,
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
    if (user?.role === 'admin') {
      loadVolunteerApplications();
    }
  }, [activeWardId, volunteerStatusFilter]);

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

  const [credentialsSlip, setCredentialsSlip] = useState<{
    targetRole: 'officer';
    name: string;
    creds: AdminCredentialsSlip;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeWard = useMemo(() => {
    return MUNICIPAL_WARDS.find((w) => w.id === activeWardId) || MUNICIPAL_WARDS[1];
  }, [activeWardId]);

  const loadWardData = async () => {
    setIsLoading(true);
    try {
      const officers = await adminApi.getRoster('officer', activeWardId);
      if (officers && officers.length > 0) {
        setOfficersList(officers);
      } else {
        // Sample default officers for this ward
        setOfficersList([
          {
            id: 'off_1',
            name: 'Er. Harpreet Singh',
            phone: '9814099881',
            email: 'h.singh@mcj.punjab.gov.in',
            role: 'officer',
            ward_id: activeWardId,
            ward_name: activeWard.name,
            department: 'Municipal Roads & Infrastructure Division',
            designation: 'Junior Engineer (JE)',
            employee_id: `PB-MCJ-${activeWardId.replace('Ward-', 'W')}-ENG-084`,
            credential_code: 'OFF-W102-7492',
            assigned_tasks: ['pothole', 'road_damage', 'sidewalk'],
            reports_resolved_count: 142,
            points: 4260,
            level: 71,
            badges: [],
            reports_submitted_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'off_2',
            name: 'Gurpreet Sandhu',
            phone: '9814099882',
            email: 'g.sandhu@mcj.punjab.gov.in',
            role: 'officer',
            ward_id: activeWardId,
            ward_name: activeWard.name,
            department: 'Solid Waste & Sanitation Department',
            designation: 'Sanitary Inspector (SI)',
            employee_id: `PB-MCJ-${activeWardId.replace('Ward-', 'W')}-SAN-019`,
            credential_code: 'OFF-W102-3810',
            assigned_tasks: ['garbage'],
            reports_resolved_count: 118,
            points: 3540,
            level: 59,
            badges: [],
            reports_submitted_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'off_3',
            name: 'Balwinder Kumar',
            phone: '9814099883',
            email: 'b.kumar@mcj.punjab.gov.in',
            role: 'officer',
            ward_id: activeWardId,
            ward_name: activeWard.name,
            department: 'Electrical & Street Lighting Cell',
            designation: 'Lineman / Field Inspector',
            employee_id: `PB-MCJ-${activeWardId.replace('Ward-', 'W')}-ELE-052`,
            credential_code: 'OFF-W102-9124',
            assigned_tasks: ['streetlight', 'traffic_signal'],
            reports_resolved_count: 84,
            points: 2520,
            level: 42,
            badges: [],
            reports_submitted_count: 0,
            upvotes_given_count: 0,
          },
          {
            id: 'off_4',
            name: 'Er. Rajesh K. Sharma',
            phone: '9814099884',
            email: 'r.sharma@mcj.punjab.gov.in',
            role: 'officer',
            ward_id: activeWardId,
            ward_name: activeWard.name,
            department: 'Water Supply & Sewerage Unit',
            designation: 'Assistant Engineer (AE)',
            employee_id: `PB-MCJ-${activeWardId.replace('Ward-', 'W')}-WAT-033`,
            credential_code: 'OFF-W102-6045',
            assigned_tasks: ['water_leakage', 'drainage'],
            reports_resolved_count: 96,
            points: 2880,
            level: 48,
            badges: [],
            reports_submitted_count: 0,
            upvotes_given_count: 0,
          },
        ]);
      }

      const tickets = await issuesApi.getAll();
      setWardTickets(tickets.filter((t) => !t.location.ward || t.location.ward.includes(activeWardId)));
    } catch (err) {
      console.warn('Ward data load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadWardData();
    }
  }, [user, activeWardId]);

  const handleProvisionFieldOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName || !newOfficerPhone) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter Officer Name and Mobile Phone.',
      });
      return;
    }

    setIsSubmitting(true);
    const specialty = TASK_SPECIALTIES.find((s) => s.id === selectedSpecialtyId) || TASK_SPECIALTIES[0];

    try {
      const res = await adminApi.provision({
        target_role: 'officer',
        name: newOfficerName,
        phone: newOfficerPhone,
        email: newOfficerEmail || undefined,
        ward_id: activeWardId,
        ward_name: activeWard.name,
        department: specialty.dept,
        designation: newOfficerDesignation,
        assigned_tasks: specialty.categories,
      });

      setCredentialsSlip({
        targetRole: 'officer',
        name: newOfficerName,
        creds: res.credentials,
      });

      addToast({
        type: 'info',
        title: 'Officer Field Credentials Generated',
        message: `Assigned ${specialty.label} in ${activeWard.name} to ${newOfficerName}.`,
      });

      setNewOfficerName('');
      setNewOfficerPhone('');
      setNewOfficerEmail('');
      loadWardData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Provisioning Failed',
        message: err.message || 'Could not generate officer credentials.',
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

  // If authenticated as a non-admin, direct them to their role-specific interface
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
          <p className="font-bold text-sm mb-1">
            {user.role === 'officer' ? 'Field Officer Session Active' : 'Citizen Session Active'}
          </p>
          <p>
            You are currently signed in as <strong>{user.name}</strong> ({user.designation || user.role}).
          </p>
          <p className="mt-1.5 text-slate-600">
            {user.role === 'officer'
              ? 'Ward Admin authority is reserved for Municipal Ward Administrators assigned by the Super Admin. As a Field Officer, your task assignments are managed in the Officer Dispatch Queue.'
              : 'The Ward Admin Console is reserved for municipal officials.'}
          </p>
        </div>

        {user.role === 'officer' ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded font-bold text-xs hover:bg-slate-800 transition shadow-xs"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Go to Field Officer Dispatch Queue →</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded font-bold text-xs hover:bg-slate-800 transition shadow-xs"
          >
            <span>Return to CivicConnect Home →</span>
          </Link>
        )}
      </div>
    );
  }

  // If not logged in as a Ward Admin, redirect to /login
  if (!user || user?.role !== 'admin') {
    return <Navigate to="/login?portal=staff" replace />;
  }

  // Ward Admin Authenticated Console
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Ward Admin Top Header */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold tracking-tight text-white">
              Municipal Ward Admin Console • {user.ward_name || activeWard.name}
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 font-mono">
            Active Administrator: <strong className="text-cyan-300">{user.name}</strong> (ID: {user.employee_id || 'PB-MCJ-ADM'}) · Sovereign Ward Authority
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              logout();
              addToast({
                type: 'info',
                title: 'Signed Out',
                message: 'Exited Ward Admin session.',
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
      <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-lg text-xs text-cyan-950 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-cyan-950">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>STATUTORY WARD ADMIN GOVERNANCE RULE:</span>
        </div>
        <p className="text-cyan-900 leading-relaxed">
          Municipal Corporation Ward Admins have sovereign jurisdiction over <strong>{activeWard.name}</strong>. Ward Admins exclusively generate credentials for on-site <strong>Field Officers</strong> and designate their specific task specialties (Roads, Sanitation, Lighting, Water, Trees).
        </p>
      </div>

      {/* Ward Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ward Jurisdiction</span>
          <div className="text-xl font-black text-slate-900 mt-1">{activeWardId}</div>
          <span className="text-[11px] text-slate-600 font-medium truncate block">{activeWard.name}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Field Officers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{officersList.length} Squads</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Across Assigned Tasks</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ward Grievances</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{wardTickets.length} Issues</div>
          <span className="text-[11px] text-slate-600 font-medium">Logged in this ward</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ward SLA Resolution</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">94.2%</div>
          <span className="text-[11px] text-emerald-800 font-medium">18.6h Avg Velocity</span>
        </div>
      </div>

      {/* Field Officer Provisioning Engine */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded text-cyan-400 border border-slate-700">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                On-Site Field Officer Specialty Provisioning Engine
              </h2>
              <p className="text-xs text-slate-400">
                Generate credentials for on-site municipal field officers and assign specific maintenance tasks.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-400/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/30">
            {activeWardId} Squads
          </span>
        </div>

        <form onSubmit={handleProvisionFieldOfficer} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Officer Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newOfficerName}
                onChange={(e) => setNewOfficerName(e.target.value)}
                placeholder="e.g. Er. Surinder Pal Singh"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={newOfficerPhone}
                onChange={(e) => setNewOfficerPhone(e.target.value)}
                placeholder="e.g. 9814099881"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Designation
              </label>
              <input
                type="text"
                value={newOfficerDesignation}
                onChange={(e) => setNewOfficerDesignation(e.target.value)}
                placeholder="e.g. Junior Engineer (JE)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Assign Specific Task Specialty Domain <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {TASK_SPECIALTIES.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedSpecialtyId(spec.id)}
                  className={`p-3 rounded-lg border text-left transition flex items-start gap-2.5 ${
                    selectedSpecialtyId === spec.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="text-lg">{spec.icon}</span>
                  <div>
                    <div className="font-bold text-xs">{spec.label}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedSpecialtyId === spec.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {spec.dept}
                    </div>
                  </div>
                </button>
              ))}
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
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Generating Officer Credentials...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Issue Field Officer Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Ward Officers Squad Roster */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {activeWard.name} • Active Field Officer Squad Roster
            </h3>
            <p className="text-xs text-slate-500">
              Field personnel authorized to resolve tickets strictly in their assigned task specialty domains.
            </p>
          </div>
          <button
            type="button"
            onClick={loadWardData}
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
                <th className="px-4 py-3">Officer Details</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Assigned Tasks</th>
                <th className="px-4 py-3">Security Code</th>
                <th className="px-4 py-3 text-center">Problems Solved</th>
                <th className="px-4 py-3 text-right">Queue Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {officersList.map((off) => (
                <tr key={off.id || off.employee_id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{off.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {off.phone} {off.email ? `· ${off.email}` : ''}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {off.designation || 'Field Officer'} · {off.department}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                      {off.employee_id}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {off.assigned_tasks && off.assigned_tasks.length > 0 ? (
                        off.assigned_tasks.map((task) => (
                          <span
                            key={task}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700"
                          >
                            {task}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">General Field Duties</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">
                      {off.credential_code || 'OFF-SEC-AUTH'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Flame className="w-3 h-3 text-emerald-600" />
                      <span>{off.reports_resolved_count || 0} Solved</span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to="/dashboard"
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition inline-flex items-center gap-1"
                    >
                      <span>Field Queue</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Municipal Volunteer Verification & Authorization Queue */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded text-amber-400 border border-slate-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Volunteer Verification &amp; Authorization Queue
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/30">
                  {activeWardId} Jurisdictional Intake
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review collegiate (NSS, NCC, NYKS) and community volunteer applicants. Approvals grant official volunteer status, +100 initiation points, and a 1.25x resolution multiplier.
              </p>
            </div>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => setVolunteerStatusFilter(statusKey)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                  volunteerStatusFilter === statusKey
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {statusKey === 'PENDING' ? 'Pending Review' : statusKey === 'ALL' ? 'All Applicants' : statusKey}
              </button>
            ))}
            <button
              type="button"
              onClick={loadVolunteerApplications}
              className="p-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {volunteersLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            Scanning ward volunteer applications...
          </div>
        ) : volunteerApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <Users className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800 text-sm">No volunteer applications in this status filter</p>
            <p className="text-slate-400">Applications submitted for {activeWard.name} will appear here for administrative verification.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {volunteerApps.map((app) => (
              <div key={app.application_id} className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {app.application_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      app.scheme === 'NSS'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : app.scheme === 'NCC'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : app.scheme === 'NYKS'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {app.scheme}
                    </span>
                    {app.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved Volunteer
                      </span>
                    ) : app.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Awaiting Ward Authorization
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-slate-900">
                    <span>{app.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      📱 {app.phone} {app.email ? `· ✉️ ${app.email}` : ''}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-mono flex flex-wrap gap-x-3 gap-y-1">
                    <span>Institution: <strong className="text-slate-800">{app.institution || 'Community RWA'}</strong></span>
                    {app.cadet_or_enrollment_id && (
                      <span>Roll/Cadet ID: <strong className="text-slate-800">{app.cadet_or_enrollment_id}</strong></span>
                    )}
                  </div>

                  {app.interests && app.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.interests.map((intKey) => (
                        <span key={intKey} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                          {intKey.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.statement && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200 max-w-xl">
                      "{app.statement}"
                    </p>
                  )}

                  {app.review_notes && (
                    <div className="text-[11px] text-slate-600 font-mono bg-amber-50/60 p-1.5 rounded border border-amber-200 max-w-xl">
                      Review Note: {app.review_notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending Applications */}
                {app.status === 'PENDING' && (
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      type="button"
                      disabled={reviewingAppId === app.application_id}
                      onClick={() => setReviewModal({ app, action: 'approve', notes: 'Credentials and enrollment verified by Ward Administrator.' })}
                      className="px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Enlist (+100 Pts)</span>
                    </button>

                    <button
                      type="button"
                      disabled={reviewingAppId === app.application_id}
                      onClick={() => setReviewModal({ app, action: 'reject', notes: 'Institutional enrollment or identification could not be validated.' })}
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
                {reviewModal.action === 'approve' ? 'Authorize Civic Volunteer' : 'Decline Volunteer Application'}
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
              {reviewModal.action === 'approve' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs leading-relaxed">
                  <strong>Induction Action:</strong> Approving will promote this citizen to the official <strong>{reviewModal.app.scheme} Volunteer</strong> role in <strong>{activeWard.name}</strong> and immediately grant <strong>+100 welcome reputation points &amp; coins</strong>.
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

      {/* Credential Slip Modal */}
      {credentialsSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-slate-900 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Official Field Officer Credentials Slip
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
              Official dispatch credentials issued for on-site field squad:
            </p>

            <div className="bg-slate-50 p-3.5 rounded border border-slate-300 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Officer Name:</span>
                <strong className="text-slate-900">{credentialsSlip.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ward:</span>
                <strong className="text-slate-900">{activeWard.name}</strong>
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

              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Assigned Tasks:</span>
                <div className="flex flex-wrap gap-1">
                  {credentialsSlip.creds.assigned_tasks?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                      {t}
                    </span>
                  ))}
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
