import { Issue, IssueCategory, IssuePriority, IssueStatus, LocationData, EvidenceItem, WardLeaderboardItem } from '../types';
import { CATEGORIES } from '../utils/constants';

/**
 * Normalizes backend uppercase status strings to frontend lowercase status enum.
 */
export function backendStatusToFrontend(backendStatus?: string): IssueStatus {
  if (!backendStatus) return 'reported';
  const s = backendStatus.toUpperCase().trim();
  switch (s) {
    case 'SUBMITTED':
      return 'reported';
    case 'VERIFIED':
      return 'acknowledged';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'RESOLVED':
      return 'resolved';
    case 'CLOSED':
      return 'closed';
    case 'DISPUTED':
      return 'disputed';
    case 'REJECTED':
      return 'closed';
    default: {
      const lower = backendStatus.toLowerCase();
      if (['reported', 'acknowledged', 'in_progress', 'resolved', 'disputed', 'closed'].includes(lower)) {
        return lower as IssueStatus;
      }
      return 'reported';
    }
  }
}

/**
 * Converts frontend status to backend uppercase representation.
 */
export function frontendStatusToBackend(frontendStatus: IssueStatus | string): string {
  switch (frontendStatus) {
    case 'reported':
      return 'SUBMITTED';
    case 'acknowledged':
      return 'VERIFIED';
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'resolved':
      return 'RESOLVED';
    case 'closed':
      return 'CLOSED';
    case 'disputed':
      return 'DISPUTED';
    default:
      return frontendStatus.toUpperCase();
  }
}

/**
 * Normalizes backend priority levels (LOW, MEDIUM, HIGH, CRITICAL) to frontend.
 */
export function backendPriorityToFrontend(priority?: string): IssuePriority {
  if (!priority) return 'medium';
  const p = priority.toUpperCase().trim();
  switch (p) {
    case 'LOW':
      return 'low';
    case 'MEDIUM':
      return 'medium';
    case 'HIGH':
      return 'high';
    case 'CRITICAL':
    case 'URGENT':
      return 'urgent';
    default: {
      const lower = priority.toLowerCase();
      if (['low', 'medium', 'high', 'urgent'].includes(lower)) {
        return lower as IssuePriority;
      }
      return 'medium';
    }
  }
}

/**
 * Converts frontend priority to backend representation.
 */
export function frontendPriorityToBackend(priority: IssuePriority | string): string {
  switch (priority) {
    case 'low':
      return 'LOW';
    case 'medium':
      return 'MEDIUM';
    case 'high':
      return 'HIGH';
    case 'urgent':
      return 'CRITICAL';
    default:
      return priority.toUpperCase();
  }
}

/**
 * Default SLA hours lookup helper based on category.
 */
export function getCategorySlaHours(category: string): number {
  const cat = CATEGORIES.find((c) => c.id === category.toLowerCase());
  return cat ? cat.slaDefaultHours : 48;
}

/**
 * Adapts raw Django REST API Report response into a strictly-typed frontend Issue object.
 */
export function adaptBackendReportToIssue(doc: any): Issue {
  if (!doc) {
    throw new Error('Cannot adapt empty report document');
  }

  const category = (doc.category || 'other').toLowerCase() as IssueCategory;
  const status = backendStatusToFrontend(doc.status);
  const priority = backendPriorityToFrontend(doc.priority_level || doc.priority);
  const slaHours = doc.sla_hours || getCategorySlaHours(category);
  
  const createdAtIso = doc.created_at
    ? new Date(doc.created_at).toISOString()
    : new Date().toISOString();
  const updatedAtIso = doc.updated_at
    ? new Date(doc.updated_at).toISOString()
    : createdAtIso;

  // Compute SLA deadline
  const slaDeadline = doc.sla_deadline
    ? new Date(doc.sla_deadline).toISOString()
    : new Date(new Date(createdAtIso).getTime() + slaHours * 3600 * 1000).toISOString();

  const isResolved = status === 'resolved' || status === 'closed';
  const slaBreached = doc.sla_breached !== undefined
    ? Boolean(doc.sla_breached)
    : !isResolved && Date.now() > new Date(slaDeadline).getTime();

  // Location Normalization
  let lat = 31.3260;
  let lng = 75.5762;
  if (doc.latitude !== undefined && doc.longitude !== undefined) {
    lat = Number(doc.latitude);
    lng = Number(doc.longitude);
  } else if (doc.location?.coordinates && Array.isArray(doc.location.coordinates)) {
    // GeoJSON [longitude, latitude]
    lng = Number(doc.location.coordinates[0]);
    lat = Number(doc.location.coordinates[1]);
  }

  const location: LocationData = {
    latitude: lat,
    longitude: lng,
    address: doc.address || '',
    landmark: doc.landmark || '',
    ward: doc.ward_id || doc.ward || 'General Ward',
    accuracy: doc.accuracy ? Number(doc.accuracy) : 15,
  };

  // Primary Photo & Evidence Normalization
  const photosList: string[] = Array.isArray(doc.photos) ? [...doc.photos] : [];
  if (doc.primary_photo && !photosList.includes(doc.primary_photo)) {
    photosList.unshift(doc.primary_photo);
  }
  if (doc.photo_url && !photosList.includes(doc.photo_url)) {
    photosList.unshift(doc.photo_url);
  }

  const evidence: EvidenceItem[] = [];

  // Map backend evidence array if present
  if (Array.isArray(doc.evidence)) {
    doc.evidence.forEach((ev: any, idx: number) => {
      evidence.push({
        id: ev.id || `ev_${idx}`,
        media_type: ev.media_type || 'photo',
        url: ev.photo_url || ev.url || '',
        caption: ev.notes || ev.caption || 'Evidence photo',
        created_at: ev.timestamp || ev.created_at || createdAtIso,
        stage: ev.stage || 'initial',
        uploaded_by: ev.submitted_by || ev.uploaded_by,
      });
    });
  }

  // If no formal evidence array but photos exist, create initial evidence items
  if (evidence.length === 0 && photosList.length > 0) {
    photosList.forEach((url, idx) => {
      evidence.push({
        id: `ev_photo_${idx}`,
        media_type: 'photo',
        url,
        caption: idx === 0 ? 'Initial citizen evidence' : `Supporting photo ${idx + 1}`,
        created_at: createdAtIso,
        stage: 'initial',
        uploaded_by: doc.reporter_name || 'Citizen',
      });
    });
  }

  // If resolution photo exists, append resolution evidence
  if (doc.resolution_photo) {
    const hasResEv = evidence.some((e) => e.stage === 'resolution');
    if (!hasResEv) {
      evidence.push({
        id: 'ev_resolution',
        media_type: 'photo',
        url: doc.resolution_photo,
        caption: doc.resolution_notes || 'Official municipal resolution proof',
        created_at: doc.resolved_at || updatedAtIso,
        stage: 'resolution',
        uploaded_by: 'Field Officer',
      });
    }
  }

  const primaryPhotoUrl = doc.primary_photo || doc.photo_url || (photosList.length > 0 ? photosList[0] : undefined);

  return {
    id: String(doc.id || doc._id || doc.ticket_id),
    tracking_id: doc.ticket_id || doc.tracking_id || String(doc.id || doc._id),
    title: doc.title || `${category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Issue`,
    description: doc.description || '',
    category,
    status,
    priority,
    location,
    ward_id: doc.ward_id || doc.ward || location.ward,
    ward_name: doc.ward_name,
    evidence,
    photo_url: primaryPhotoUrl,
    video_url: doc.video_url,
    created_at: createdAtIso,
    updated_at: updatedAtIso,
    acknowledged_at: doc.acknowledged_at,
    resolved_at: doc.resolved_at,
    sla_hours: slaHours,
    sla_deadline: slaDeadline,
    sla_breached: slaBreached,
    upvotes_count: doc.upvote_count ?? doc.upvotes_count ?? 0,
    has_upvoted: Boolean(doc.has_upvoted),
    reporter: {
      id: doc.reporter_id || 'anonymous',
      name: doc.reporter_name || 'Citizen',
      is_anonymous: !doc.reporter_id || doc.reporter_id === 'anonymous',
      phone_masked: doc.reporter_phone ? doc.reporter_phone.slice(-4).padStart(doc.reporter_phone.length, '•') : undefined,
    },
    assigned_department: doc.department_id || doc.assigned_department,
    assigned_officer: doc.assigned_officer,
    resolution_notes: doc.resolution_notes,
    resolution_photo: doc.resolution_photo,
    citizen_feedback: doc.citizen_feedback ?? (status === 'closed' ? 'confirmed' : status === 'disputed' ? 'disputed' : null),
    dispute_reason: doc.dispute_reason,
  };
}

/**
 * Adapts raw Django REST API Ward Leaderboard response into a strictly-typed WardLeaderboardItem.
 */
export function adaptWardLeaderboardItem(doc: any, idx?: number): WardLeaderboardItem {
  return {
    ward_id: doc.ward_number || doc.ward_id || `Ward-${(idx ?? 0) + 1}`,
    ward_name: doc.name || doc.ward_name || `Ward ${doc.ward_number || ''}`,
    zone: doc.zone || 'General Zone',
    total_reports: doc.total_reports ?? 0,
    resolved_reports: doc.resolved_reports ?? 0,
    resolution_rate_percent: Math.round(doc.resolution_rate_percent ?? 0),
    avg_resolution_hours: Math.round((doc.avg_resolution_hours ?? 24) * 10) / 10,
    rank: doc.rank ?? (idx ? idx + 1 : 1),
    active_citizens: doc.active_citizens ?? Math.max(1, Math.round((doc.total_reports ?? 0) * 0.8)),
  };
}

/**
 * Adapts raw Django REST API User response into a strongly-typed UserProfile.
 */
export function adaptUserProfile(doc: any): import('../types').UserProfile {
  if (!doc) {
    return {
      id: 'usr_unknown',
      name: 'Unknown User',
      phone: '',
      role: 'citizen',
      points: 0,
      level: 1,
      badges: [],
      reports_submitted_count: 0,
      reports_resolved_count: 0,
      upvotes_given_count: 0,
    };
  }
  return {
    id: doc.id || doc.user_id || doc._id || 'usr_unknown',
    name: doc.name || 'Verified Civic User',
    phone: doc.phone || '',
    email: doc.email,
    role: doc.role || 'citizen',
    ward: doc.ward || doc.ward_name,
    ward_id: doc.ward_id,
    ward_name: doc.ward_name,
    district: doc.district,
    state: doc.state,
    department: doc.department,
    designation: doc.designation,
    employee_id: doc.employee_id,
    jurisdiction_zone: doc.jurisdiction_zone,
    assigned_tasks: doc.assigned_tasks || [],
    credential_code: doc.credential_code,
    created_by: doc.created_by,
    officers_count: doc.officers_count ?? 0,
    volunteer_scheme: doc.volunteer_scheme,
    volunteer_status: doc.volunteer_status,
    volunteer_institution: doc.volunteer_institution,
    volunteer_application_id: doc.volunteer_application_id,
    points: doc.points ?? 0,
    coins: doc.coins ?? doc.points ?? 50,
    level: doc.level ?? Math.max(1, Math.floor((doc.points ?? 0) / 60) + 1),
    badges: doc.badges || [],
    reports_submitted_count: doc.reports_submitted_count ?? 0,
    reports_resolved_count: doc.reports_resolved_count ?? 0,
    upvotes_given_count: doc.upvotes_given_count ?? 0,
  };
}
