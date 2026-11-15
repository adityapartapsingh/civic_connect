import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { adminApi, issuesApi, volunteerApi } from '../services/api';
import { VolunteerApplication, UserProfile, AdminCredentialsSlip, Issue, IssueStatus } from '../types';
import { getSlaInfo, formatRelativeDate } from '../utils/helpers';
import {
  ShieldCheck,
  Building2,
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
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  ChevronRight,
  Send,
  X,
  Scale,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const MUNICIPAL_WARDS = [
  {
    id: 'Ward-101',
    name: 'Ward 1 - Model Town Urban Zone',
    zone: 'Central Jalandhar',
    admin_name: 'Sh. Ramesh Kumar',
    admin_phone: '9876543210',
    admin_email: 'ward101.admin@mcjalandhar.in',
    employee_id: 'PB-MCJ-ADM-W101',
    credential_code: 'MCJ-W101-SEC4',
    designation: 'Ward 1 Municipal Administrator',
  },
  {
    id: 'Ward-102',
    name: 'Ward 2 - Civil Lines Administrative Ward',
    zone: 'North Jalandhar',
    admin_name: 'Smt. Sunita Talwar',
    admin_phone: '9876543211',
    admin_email: 'ward102.admin@mcjalandhar.in',
    employee_id: 'PB-MCJ-ADM-W102',
    credential_code: 'MCJ-W102-SEC9',
    designation: 'Ward 2 Municipal Councillor & Admin',
  },
  {
    id: 'Ward-103',
    name: 'Ward 3 - Cantt Road & Defense Colony',
    zone: 'East Jalandhar',
    admin_name: 'Sh. Anand Rao',
    admin_phone: '9876543212',
    admin_email: 'ward103.admin@mcjalandhar.in',
    employee_id: 'PB-MCJ-ADM-W103',
    credential_code: 'MCJ-W103-SEC7',
    designation: 'Ward 3 Municipal Administrator',
  },
  {
    id: 'Ward-104',
    name: 'Ward 4 - Rama Mandi Commercial Hub',
    zone: 'East Jalandhar',
    admin_name: 'Smt. Sunita Patil',
    admin_phone: '9876543213',
    admin_email: 'ward104.admin@mcjalandhar.in',
    employee_id: 'PB-MCJ-ADM-W104',
    credential_code: 'MCJ-W104-SEC2',
    designation: 'Ward 4 Municipal Administrator',
  },
  {
    id: 'Ward-105',
    name: 'Ward 5 - Phillaur Municipal Core',
    zone: 'Phillaur Sub-Division',
    admin_name: 'Sh. Vijay Reddy',
    admin_phone: '9876543214',
    admin_email: 'ward105.admin@mcjalandhar.in',
    employee_id: 'PB-MCJ-ADM-W105',
    credential_code: 'MCJ-W105-SEC5',
    designation: 'Ward 5 Municipal Administrator',
  },
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
  const { user, isSuperAdmin } = useAuthStore();
  const { addToast } = useToastStore();

  // Active Ward: Can be switched by Super Admin, or locked to user's assigned ward
  const [activeWardId, setActiveWardId] = useState<string>(user?.ward_id || 'Ward-102');

  // Navigation Tabs: 'dispatch' | 'roster' | 'matrix' | 'volunteers'
  const [activeTab, setActiveTab] = useState<'dispatch' | 'roster' | 'matrix' | 'volunteers'>('dispatch');

  // Data States
  const [officersList, setOfficersList] = useState<UserProfile[]>([]);
  const [allTickets, setAllTickets] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dispatch Filter Tab
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'unassigned' | 'in_progress' | 'breached' | 'disputed'>('all');

  // Form: Ward Admin provisions Field Officer
  const [newOfficerName, setNewOfficerName] = useState<string>('');
  const [newOfficerPhone, setNewOfficerPhone] = useState<string>('');
  const [newOfficerEmail, setNewOfficerEmail] = useState<string>('');
  const [newOfficerDesignation, setNewOfficerDesignation] = useState<string>('Junior Engineer (JE)');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('road');

  // Issued Credentials Slip Modal
  const [credentialsSlip, setCredentialsSlip] = useState<{
    targetRole: 'officer';
    name: string;
    creds: AdminCredentialsSlip;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const activeWard = useMemo(() => {
    return MUNICIPAL_WARDS.find((w) => w.id === activeWardId) || MUNICIPAL_WARDS[1];
  }, [activeWardId]);

  const loadWardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Field Officers for this ward
      const officers = await adminApi.getRoster('officer', activeWardId);
      if (officers && officers.length > 0) {
        setOfficersList(officers);
      } else {
        // Fallback default officers for demo
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

      // 2. Fetch Tickets for this ward
      const tickets = await issuesApi.getAll();
      setAllTickets(tickets);
    } catch (err) {
      console.warn('Ward data load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
    loadWardData();
  }, [activeWardId]);

  useEffect(() => {
    if (activeTab === 'volunteers') {
      loadVolunteerApplications();
    }
  }, [activeWardId, volunteerStatusFilter, activeTab]);

  // Ward Complaints filter
  const wardComplaints = useMemo(() => {
    return allTickets.filter((t) => {
      const wId = t.ward_id || t.location?.ward || '';
      return wId.includes(activeWardId) || wId.includes(activeWard.name.split(' - ')[0]);
    });
  }, [allTickets, activeWardId, activeWard]);

  // Disputed Complaints in this Ward
  const disputedComplaints = useMemo(() => {
    return wardComplaints.filter((t) => t.status === 'disputed' || t.citizen_feedback === 'disputed');
  }, [wardComplaints]);

  // Filtered Complaints for Triage Stream
  const triageStream = useMemo(() => {
    switch (dispatchFilter) {
      case 'unassigned':
        return wardComplaints.filter((t) => !t.assigned_officer && t.status !== 'resolved' && t.status !== 'closed');
      case 'in_progress':
        return wardComplaints.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged');
      case 'breached':
        return wardComplaints.filter((t) => {
          const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved' || t.status === 'closed');
          return (sla.isBreached || t.sla_breached) && t.status !== 'resolved' && t.status !== 'closed';
        });
      case 'disputed':
        return disputedComplaints;
      default:
        return wardComplaints;
    }
  }, [wardComplaints, dispatchFilter, disputedComplaints]);

  // Action: 1-Click Dispatch Ticket to Officer
  const handleDispatchTicket = async (ticket: Issue, officerId: string) => {
    const officer = officersList.find((o) => (o.id || o.user_id) === officerId);
    if (!officer) return;

    try {
      const updated = await issuesApi.updateStatus(ticket.id, {
        status: 'in_progress',
        assigned_officer: `${officer.name} (${officer.designation || 'Officer'})`,
        assigned_officer_id: officerId,
        notes: `Dispatched to ${officer.name} by Ward Administrator.`,
      });

      setAllTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      addToast({
        type: 'success',
        title: 'Work Order Dispatched',
        message: `Ticket ${ticket.tracking_id} dispatched to ${officer.name}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message || 'Could not assign ticket to officer.',
      });
    }
  };

  // Action: Arbitrate Disputed Resolution
  const handleArbitrateDispute = async (ticket: Issue, decision: 'uphold' | 'reopen') => {
    try {
      if (decision === 'uphold') {
        const updated = await issuesApi.updateStatus(ticket.id, {
          status: 'closed',
          notes: 'Dispute Arbitration: Resolution upheld by Ward Administrator. Work verified compliant.',
        });
        setAllTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        addToast({
          type: 'success',
          title: 'Resolution Upheld',
          message: `Ticket ${ticket.tracking_id} closed as compliant.`,
        });
      } else {
        const updated = await issuesApi.updateStatus(ticket.id, {
          status: 'in_progress',
          notes: 'Dispute Arbitration: Citizen grievance upheld. Re-opened for field correction.',
        });
        setAllTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        addToast({
          type: 'info',
          title: 'Ticket Re-Opened',
          message: `Ticket ${ticket.tracking_id} returned to field squad queue.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Arbitration Error',
        message: err.message || 'Could not process arbitration.',
      });
    }
  };

  // Action: Provision New Field Officer
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

  // Action: Review Volunteer Application
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

  // Guard: If authenticated user is an officer, link to officer portal
  if (user && user.role === 'officer') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
          <p className="font-bold text-sm mb-1 text-white">Field Officer Session Active</p>
          <p>You are signed in as <strong>{user.name}</strong> ({user.designation || 'Field Squad'}).</p>
          <p className="mt-1 text-zinc-400">Ward Admin console is reserved for Municipal Ward Administrators.</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded text-xs transition"
        >
          <Wrench className="w-4 h-4" />
          <span>Open Field Squad Dispatch Queue →</span>
        </Link>
      </div>
    );
  }

  // If not logged in as admin/super_admin, redirect
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login?portal=staff" replace />;
  }

  // Metrics calculation
  const totalWardTickets = wardComplaints.length;
  const inProgressWardTickets = wardComplaints.filter((t) => t.status === 'in_progress' || t.status === 'acknowledged').length;
  const resolvedWardTickets = wardComplaints.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const breachedWardTickets = wardComplaints.filter((t) => {
    const sla = getSlaInfo(t.sla_deadline, t.status === 'resolved' || t.status === 'closed');
    return (sla.isBreached || t.sla_breached) && t.status !== 'resolved' && t.status !== 'closed';
  }).length;
  const resolutionRate = totalWardTickets > 0 ? Math.round((resolvedWardTickets / totalWardTickets) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Zonal Command Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold tracking-wider uppercase">
                {activeWardId} · {activeWard.zone}
              </span>
              {isSuperAdmin && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  SUPER ADMIN OVERRIDE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
              <span>{activeWard.name} • Ward Tactical Console</span>
            </h1>
            <p className="text-xs text-slate-400">
              Assigned Administrator: <strong className="text-teal-300">{activeWard.admin_name}</strong> · ID: {activeWard.employee_id} · Sovereign Zonal Authority
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            {isSuperAdmin && (
              <select
                value={activeWardId}
                onChange={(e) => setActiveWardId(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-teal-500 font-mono"
              >
                {MUNICIPAL_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - {w.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={loadWardData}
              disabled={isLoading}
              className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Ward Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tactical KPI Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Ward Complaints
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{totalWardTickets}</div>
            <span className="text-[11px] text-slate-500">{inProgressWardTickets} in field progress</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
              Field Officers on Duty
            </span>
            <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">{officersList.length} Squads</div>
            <span className="text-[11px] text-slate-500">Across 5 departments</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
              SLA Resolution Rate
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{resolutionRate}%</div>
            <span className="text-[11px] text-emerald-400/80">{resolvedWardTickets} resolved cases</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
              Citizen Disputes
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{disputedComplaints.length} Cases</div>
            <span className="text-[11px] text-slate-500">{breachedWardTickets} breached SLA</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Navigation Tabs */}
      <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'dispatch'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-300" />
            <span>60/40 Dispatch &amp; Arbitration Station</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-teal-200 font-mono font-bold">
              {wardComplaints.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-300" />
            <span>Field Squad Roster &amp; Provisioning</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-teal-200 font-mono font-bold">
              {officersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Municipal Ward Governance Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('volunteers')}
            className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'volunteers'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>Youth Volunteer Verification</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 60/40 TACTICAL DISPATCH & ARBITRATION STATION          */}
      {/* ============================================================== */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Pane (60% / 7 cols): Live Ward Triage Stream */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Live Ward Triage Stream (48h Statutory SLA)</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Select and assign incoming complaints directly to designated specialty officers.
                </p>
              </div>

              {/* Triage Filter Pills */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'unassigned', 'in_progress', 'breached', 'disputed'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDispatchFilter(filter)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                      dispatchFilter === filter
                        ? 'bg-teal-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Triage List */}
            {triageStream.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">No Pending Issues in this Filter</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All complaints in {activeWard.name} matching this criteria have been resolved.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {triageStream.map((ticket) => {
                  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
                  const sla = getSlaInfo(ticket.sla_deadline, isResolved);

                  return (
                    <div
                      key={ticket.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition"
                    >
                      {/* Top Meta Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black bg-slate-900 border border-slate-700 text-teal-300 px-2 py-0.5 rounded">
                            {ticket.tracking_id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] uppercase font-bold border border-slate-800">
                            {ticket.category.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              ticket.priority === 'urgent'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : ticket.priority === 'high'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            • {formatRelativeDate(ticket.created_at)}
                          </span>
                        </div>

                        {/* SLA Countdown Badge */}
                        <div
                          className={`font-mono text-xs font-bold flex items-center gap-1.5 px-2.5 py-0.5 rounded border self-start sm:self-auto ${
                            isResolved
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                              : sla.isBreached
                              ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                              : 'bg-slate-900 text-teal-300 border-slate-800'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{sla.formattedText}</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="flex items-start gap-3">
                        {ticket.photo_url && (
                          <img
                            src={ticket.photo_url}
                            alt={ticket.title}
                            className="w-16 h-16 rounded object-cover border border-slate-800 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{ticket.title}</h4>
                          <p className="text-xs text-slate-300 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                            <span className="truncate">
                              {ticket.location.landmark || ticket.location.address || ticket.location.ward}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Dispatch & Assignment Bar */}
                      <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-400">
                          {ticket.assigned_officer ? (
                            <span className="flex items-center gap-1 text-teal-300 font-mono">
                              <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                              <span>Assigned: {ticket.assigned_officer}</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Pending Squad Dispatch</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleDispatchTicket(ticket, e.target.value);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded text-xs font-semibold focus:outline-none focus:border-teal-500 font-mono"
                          >
                            <option value="" disabled>
                              Dispatch to Officer...
                            </option>
                            {officersList.map((off) => {
                              const isMatch = off.assigned_tasks?.includes(ticket.category);
                              return (
                                <option key={off.id || off.user_id} value={off.id || off.user_id}>
                                  {isMatch ? '★ [MATCH] ' : ''}
                                  {off.name} ({off.designation || 'Officer'})
                                </option>
                              );
                            })}
                          </select>

                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Inspect Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Pane (40% / 5 cols): Deployment Tray & Dispute Arbitration */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Active Field Squad Deployment Tray */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Ward Squad on Duty</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Active personnel authorized for {activeWard.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Provision</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {officersList.map((off) => (
                  <div
                    key={off.id || off.employee_id}
                    className="p-3 bg-slate-900 rounded border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{off.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {off.designation || 'Field Officer'} · {off.phone}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {off.assigned_tasks?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 font-mono text-[9px] uppercase border border-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">Resolved</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {off.reports_resolved_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Citizen Dispute Arbitration Deck */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Dispute Arbitration Deck</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Complaints disputed by citizens requiring ward executive decision.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  {disputedComplaints.length} Cases
                </span>
              </div>

              {disputedComplaints.length === 0 ? (
                <div className="p-6 bg-slate-900 rounded border border-slate-800 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="font-semibold text-white">No Disputed Resolutions</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Citizens have accepted all marked resolutions in this ward.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disputedComplaints.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3.5 bg-slate-900 rounded border border-amber-500/30 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {ticket.tracking_id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatRelativeDate(ticket.updated_at)}
                        </span>
                      </div>

                      <h4 className="font-bold text-white">{ticket.title}</h4>

                      {/* Dispute Details */}
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                        <div className="text-red-300 font-semibold">
                          Citizen Disputed:
                        </div>
                        <p className="text-slate-300 italic">
                          "{ticket.dispute_reason || 'Citizen indicated work is incomplete or substandard.'}"
                        </p>
                      </div>

                      {/* Officer Resolution Notes if present */}
                      {ticket.resolution_notes && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                          <strong className="text-teal-300">Officer Note:</strong> {ticket.resolution_notes}
                        </div>
                      )}

                      {/* Arbitration Decisions */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleArbitrateDispute(ticket, 'uphold')}
                          className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition"
                        >
                          Uphold Resolution
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArbitrateDispute(ticket, 'reopen')}
                          className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs transition"
                        >
                          Re-Open &amp; Re-Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FIELD SQUAD ROSTER & PROVISIONING ENGINE               */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Field Officer Provisioning Engine */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-800 rounded text-teal-400 border border-slate-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base">
                    On-Site Field Officer Specialty Provisioning Engine
                  </h2>
                  <p className="text-xs text-slate-400">
                    Generate credentials for municipal field officers and assign specific maintenance tasks.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-teal-400/20 text-teal-300 text-xs font-mono font-bold border border-teal-400/30">
                {activeWardId} Squads
              </span>
            </div>

            <form onSubmit={handleProvisionFieldOfficer} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Field Officer Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newOfficerName}
                    onChange={(e) => setNewOfficerName(e.target.value)}
                    placeholder="e.g. Er. Surinder Pal Singh"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newOfficerPhone}
                    onChange={(e) => setNewOfficerPhone(e.target.value)}
                    placeholder="e.g. 9814099881"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={newOfficerDesignation}
                    onChange={(e) => setNewOfficerDesignation(e.target.value)}
                    placeholder="e.g. Junior Engineer (JE)"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Assign Specific Task Specialty Domain <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {TASK_SPECIALTIES.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setSelectedSpecialtyId(spec.id)}
                      className={`p-3 rounded-lg border text-left transition flex items-start gap-2.5 ${
                        selectedSpecialtyId === spec.id
                          ? 'border-teal-500 bg-teal-500/20 text-white shadow-xs'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{spec.icon}</span>
                      <div>
                        <div className="font-bold text-xs">{spec.label}</div>
                        <div className={`text-[10px] mt-0.5 ${selectedSpecialtyId === spec.id ? 'text-teal-200' : 'text-slate-500'}`}>
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
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Generating Officer Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>Issue Field Officer Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Ward Officers Squad Roster */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {activeWard.name} • Active Field Officer Squad Roster
                </h3>
                <p className="text-xs text-slate-400">
                  Field personnel authorized to resolve tickets strictly in their assigned task specialty domains.
                </p>
              </div>
              <button
                type="button"
                onClick={loadWardData}
                className="self-start sm:self-auto p-1.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Officer Details</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Assigned Tasks</th>
                    <th className="px-4 py-3">Security Code</th>
                    <th className="px-4 py-3 text-center">Problems Solved</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {officersList.map((off) => (
                    <tr key={off.id || off.employee_id} className="hover:bg-slate-900/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>{off.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {off.phone} {off.email ? `· ${off.email}` : ''}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {off.designation || 'Field Officer'} · {off.department}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200 font-bold">
                          {off.employee_id}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {off.assigned_tasks && off.assigned_tasks.length > 0 ? (
                            off.assigned_tasks.map((task) => (
                              <span
                                key={task}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-300"
                              >
                                {task}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px]">General Field Duties</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-300 font-bold">
                          {off.credential_code || 'OFF-SEC-AUTH'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <Flame className="w-3 h-3 text-emerald-400" />
                          <span>{off.reports_resolved_count || 0} Solved</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to="/dashboard"
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 font-semibold text-[11px] transition inline-flex items-center gap-1"
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CITY-WIDE MUNICIPAL WARD GOVERNANCE MATRIX             */}
      {/* ============================================================== */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-md overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                City-Wide Municipal Ward Governance Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every municipal ward has exactly one assigned Ward Admin who authorizes on-site field officers.
              </p>
            </div>
            <button
              type="button"
              onClick={loadWardData}
              className="self-start sm:self-auto p-1.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Refresh Governance Matrix"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ward Jurisdiction</th>
                  <th className="px-4 py-3">Designated Administrator</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Security Code</th>
                  <th className="px-4 py-3 text-center">Field Squads</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {MUNICIPAL_WARDS.map((ward) => {
                  const isCurrent = ward.id === activeWardId;
                  const squadCount = ward.id === 'Ward-102' ? officersList.length : 0;

                  return (
                    <tr
                      key={ward.id}
                      className={`transition ${isCurrent ? 'bg-teal-500/10' : 'hover:bg-slate-900/60'}`}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block text-sm">{ward.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{ward.id}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>{ward.admin_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {ward.admin_phone} · {ward.admin_email}
                        </div>
                        <div className="text-[10px] text-slate-500">{ward.designation}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200 font-bold">
                          {ward.employee_id}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-300 font-bold">
                          {ward.credential_code}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {squadCount} Officers
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWardId(ward.id);
                            setActiveTab('dispatch');
                            addToast({
                              type: 'info',
                              title: 'Switched Ward Jurisdiction',
                              message: `Now viewing ${ward.name}.`,
                            });
                          }}
                          className={`px-3 py-1.5 rounded font-bold text-xs transition inline-flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                        >
                          <span>{isCurrent ? 'Current Ward' : 'Open Ward Console'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: YOUTH VOLUNTEER VERIFICATION & AUTHORIZATION QUEUE     */}
      {/* ============================================================== */}
      {activeTab === 'volunteers' && (
        <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-md overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  Review collegiate (NSS, NCC, NYKS) and community volunteer applicants. Approvals grant official volunteer status and +100 initiation points.
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
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {statusKey}
                </button>
              ))}
            </div>
          </div>

          {volunteersLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400" />
              <p className="text-xs">Loading volunteer verification queue...</p>
            </div>
          ) : volunteerApps.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white text-sm">No Applications in Queue</p>
              <p className="text-xs text-slate-500">
                There are currently no volunteer applications matching status '{volunteerStatusFilter}'.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {volunteerApps.map((app) => (
                <div
                  key={app.application_id}
                  className="p-4 sm:p-5 hover:bg-slate-900/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/20">
                        {app.scheme}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {app.cadet_or_enrollment_id || 'N/A'}
                      </span>
                    </div>

                    <div className="text-slate-400 font-mono text-[11px]">
                      {app.phone} {app.email ? `· ${app.email}` : ''} · {app.institution || 'Civic Volunteer'}
                    </div>

                    {app.statement && (
                      <p className="text-slate-300 text-xs italic bg-slate-900 p-2 rounded border border-slate-800">
                        "{app.statement}"
                      </p>
                    )}
                  </div>

                  {/* Actions for Pending */}
                  {app.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <button
                        type="button"
                        disabled={reviewingAppId === app.application_id}
                        onClick={() =>
                          setReviewModal({
                            app,
                            action: 'approve',
                            notes: 'Credentials and enrollment verified by Ward Administrator.',
                          })
                        }
                        className="px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve (+100 Pts)</span>
                      </button>

                      <button
                        type="button"
                        disabled={reviewingAppId === app.application_id}
                        onClick={() =>
                          setReviewModal({
                            app,
                            action: 'reject',
                            notes: 'Identification or institutional status could not be validated.',
                          })
                        }
                        className="px-3 py-2 rounded bg-slate-900 hover:bg-red-950 text-red-300 font-semibold text-xs border border-red-800/40 transition flex items-center gap-1 disabled:opacity-50"
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
      )}

      {/* Volunteer Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {reviewModal.action === 'approve' ? 'Authorize Civic Volunteer' : 'Decline Volunteer Application'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>Applicant: <strong className="text-white">{reviewModal.app.name}</strong> ({reviewModal.app.scheme})</p>
              <p>Phone: <span className="font-mono text-teal-300">{reviewModal.app.phone}</span></p>
              {reviewModal.action === 'approve' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-200 text-xs">
                  Approving will elevate this citizen to official <strong>{reviewModal.app.scheme} Volunteer</strong> in <strong>{activeWard.name}</strong> and award <strong>+100 welcome reputation points</strong>.
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-200 text-xs">
                  The applicant profile will remain as a standard citizen.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrative Verification Note
              </label>
              <textarea
                rows={2}
                value={reviewModal.notes}
                onChange={(e) => setReviewModal({ ...reviewModal, notes: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 rounded bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewingAppId === reviewModal.app.application_id}
                onClick={() => handleReviewVolunteer(reviewModal.app.application_id, reviewModal.action, reviewModal.notes)}
                className={`px-4 py-2 text-xs font-bold rounded text-white transition ${
                  reviewModal.action === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-red-700 hover:bg-red-600'
                }`}
              >
                {reviewingAppId === reviewModal.app.application_id
                  ? 'Processing...'
                  : reviewModal.action === 'approve'
                  ? 'Confirm & Authorize'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Slip Modal */}
      {credentialsSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white">
                  Official Field Officer Credentials Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsSlip(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Official dispatch credentials issued for on-site field squad:
            </p>

            <div className="bg-slate-900 p-3.5 rounded border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Officer Name:</span>
                <strong className="text-white">{credentialsSlip.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ward:</span>
                <strong className="text-white">{activeWard.name}</strong>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Employee ID:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-white text-sm font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                    {credentialsSlip.creds.employee_id}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyText(credentialsSlip.creds.employee_id, 'Employee ID')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 transition"
                  >
                    {copiedField === 'Employee ID' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Passcode / PIN:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-amber-300 text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {credentialsSlip.creds.passcode}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyText(credentialsSlip.creds.passcode, 'Passcode')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 transition"
                  >
                    {copiedField === 'Passcode' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Assigned Tasks:</span>
                <div className="flex flex-wrap gap-1">
                  {credentialsSlip.creds.assigned_tasks?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-semibold text-teal-300">
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
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold transition shadow-xs"
              >
                Done &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
