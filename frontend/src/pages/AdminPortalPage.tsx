import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { adminApi, issuesApi } from '../services/api';
import { UserProfile, AdminCredentialsSlip, Issue, IssueStatus } from '../types';
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
  Lock,
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
  const { user, isSuperAdmin } = useAuthStore();
  const { addToast } = useToastStore();

  // Active Ward: Can be switched by Super Admin, or locked to user's assigned ward
  const [activeWardId, setActiveWardId] = useState<string>(user?.ward_id || 'Ward-102');

  // Navigation Tabs: 'dispatch' | 'roster'
  const [activeTab, setActiveTab] = useState<'dispatch' | 'roster'>('dispatch');

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

  useEffect(() => {
    loadWardData();
  }, [activeWardId]);

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
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Zonal Command Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                {activeWardId} · {activeWard.zone}
              </span>
              {isSuperAdmin && (
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200">
                  SUPER ADMIN
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
              <span>{activeWard.name.split('-')[1]?.trim() || activeWard.name} • Ward Console</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500">
              Assigned Administrator: <strong className="text-slate-800">{user?.name || 'Municipal Administrator'}</strong> · ID: {user?.employee_id || user?.phone || 'MCJ-OFFICIAL'} · Sovereign Zonal Authority
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <select
                value={activeWardId}
                onChange={(e) => setActiveWardId(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-slate-300 text-slate-800 rounded-md text-[11px] sm:text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              >
                {MUNICIPAL_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={loadWardData}
              disabled={isLoading}
              className="p-1.5 sm:p-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Refresh Ward Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-slate-900' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tactical KPI: Mobile Single-Line Strip vs Desktop Grid */}
        <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-slate-100">
          {/* Mobile Single-Line Strip */}
          <div className="sm:hidden flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span>Complaints: <strong className="text-slate-900">{totalWardTickets}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Squads: <strong className="text-slate-900">{officersList.length}</strong></span>
            <span className="text-slate-300">|</span>
            <span>SLA: <strong className="text-emerald-700">{resolutionRate}%</strong></span>
            <span className="text-slate-300">|</span>
            <span className={disputedComplaints.length > 0 ? 'text-amber-700' : 'text-slate-500'}>
              Disputes: <strong>{disputedComplaints.length}</strong>
            </span>
          </div>

          {/* Desktop 4-Box Grid */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Ward Complaints
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalWardTickets}</div>
              <span className="text-[11px] text-slate-500">{inProgressWardTickets} in field progress</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 block">
                Field Officers on Duty
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{officersList.length} Squads</div>
              <span className="text-[11px] text-slate-500">Across 5 departments</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                SLA Resolution Rate
              </span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{resolutionRate}%</div>
              <span className="text-[11px] text-slate-500">{resolvedWardTickets} resolved cases</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                Citizen Disputes
              </span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">{disputedComplaints.length} Cases</div>
              <span className="text-[11px] text-slate-500">{breachedWardTickets} breached SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tactical Navigation Tabs */}
      <div className="bg-white border border-slate-200 p-1 rounded-lg sm:rounded-xl flex items-center justify-between gap-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dispatch'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">60/40 Dispatch &amp; Arbitration Station</span>
            <span className="sm:hidden">Dispatch &amp; Triage</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'dispatch' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {wardComplaints.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Field Squad Roster &amp; Provisioning</span>
            <span className="sm:hidden">Squad Roster</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'roster' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {officersList.length}
            </span>
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <span>Live Ward Triage Stream (48h Statutory SLA)</span>
                </h2>
                <p className="text-xs text-slate-500">
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
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition ${
                      dispatchFilter === filter
                        ? 'bg-slate-900 text-white font-black'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Triage List */}
            {triageStream.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 text-sm">No Pending Issues in this Filter</h3>
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
                      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition shadow-xs"
                    >
                      {/* Top Meta Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 text-slate-900 px-2 py-0.5 rounded">
                            {ticket.tracking_id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold border border-slate-200">
                            {ticket.category.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              ticket.priority === 'urgent'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : ticket.priority === 'high'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
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
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : sla.isBreached
                              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
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
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{ticket.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {ticket.location.landmark || ticket.location.address || ticket.location.ward}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Dispatch & Assignment Bar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          {ticket.assigned_officer ? (
                            <span className="flex items-center gap-1 text-slate-800 font-mono font-medium">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Assigned: {ticket.assigned_officer}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
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
                            className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
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
                            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200"
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Ward Squad on Duty</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active personnel authorized for {activeWard.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Provision</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {officersList.map((off) => (
                  <div
                    key={off.id || off.employee_id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{off.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {off.designation || 'Field Officer'} · {off.phone}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {off.assigned_tasks?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded bg-white text-slate-700 font-mono text-[9px] uppercase border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block font-mono">Resolved</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {off.reports_resolved_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Citizen Dispute Arbitration Deck */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-700" />
                    <span>Dispute Arbitration Deck</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complaints disputed by citizens requiring ward executive decision.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-xs font-bold border border-amber-200">
                  {disputedComplaints.length} Cases
                </span>
              </div>

              {disputedComplaints.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="font-semibold text-slate-800">No Disputed Resolutions</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Citizens have accepted all marked resolutions in this ward.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disputedComplaints.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3.5 bg-slate-50 rounded-lg border border-amber-200 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                          {ticket.tracking_id}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatRelativeDate(ticket.updated_at)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900">{ticket.title}</h4>

                      {/* Dispute Details */}
                      <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1 text-[11px]">
                        <div className="text-red-700 font-semibold">
                          Citizen Disputed:
                        </div>
                        <p className="text-slate-700 italic">
                          "{ticket.dispute_reason || 'Citizen indicated work is incomplete or substandard.'}"
                        </p>
                      </div>

                      {/* Officer Resolution Notes if present */}
                      {ticket.resolution_notes && (
                        <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-mono">
                          <strong className="text-slate-900">Officer Note:</strong> {ticket.resolution_notes}
                        </div>
                      )}

                      {/* Arbitration Decisions */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleArbitrateDispute(ticket, 'uphold')}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                        >
                          Uphold Resolution
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArbitrateDispute(ticket, 'reopen')}
                          className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-slate-900">
                    On-Site Field Officer Specialty Provisioning Engine
                  </h2>
                  <p className="text-xs text-slate-500">
                    Generate credentials for municipal field officers and assign specific maintenance tasks.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-200">
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
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                      className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                        selectedSpecialtyId === spec.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{spec.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{spec.label}</div>
                        <div className={`text-[10px] mt-0.5 ${selectedSpecialtyId === spec.id ? 'text-slate-600' : 'text-slate-500'}`}>
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
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                className="self-start sm:self-auto p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Officer Details</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Assigned Tasks</th>
                    <th className="px-4 py-3 text-center">Auth Status</th>
                    <th className="px-4 py-3 text-center">Problems Solved</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {officersList.map((off) => (
                    <tr key={off.id || off.employee_id} className="hover:bg-slate-50/80 transition">
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
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700"
                              >
                                {task}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">General Field Duties</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Key Active</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Flame className="w-3 h-3 text-emerald-600" />
                          <span>{off.reports_resolved_count || 0} Solved</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to="/dashboard"
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-[11px] transition inline-flex items-center gap-1"
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

      {/* Credential Slip Modal */}
      {credentialsSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Official Field Officer Credentials Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsSlip(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Official dispatch credentials issued for on-site field squad:
            </p>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs font-mono">
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
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition shadow-xs"
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
