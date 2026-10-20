export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water_leakage'
  | 'drainage'
  | 'road_damage'
  | 'traffic_signal'
  | 'fallen_tree'
  | 'sidewalk'
  | 'other';

export type IssueStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'disputed'
  | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  ward?: string;
  accuracy?: number;
  isMockSuspected?: boolean;
}

export interface EvidenceItem {
  id: string;
  media_type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  created_at: string;
  stage: 'initial' | 'in_progress' | 'resolution' | 'dispute';
  uploaded_by?: string;
}

export interface Issue {
  id: string;
  tracking_id: string; // e.g. "CC-2026-9481"
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: LocationData;
  evidence: EvidenceItem[];
  photo_url?: string; // primary photo
  video_url?: string;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  sla_hours: number;
  sla_deadline: string;
  sla_breached: boolean;
  upvotes_count: number;
  has_upvoted?: boolean;
  reporter?: {
    id: string;
    name: string;
    is_anonymous: boolean;
    phone_masked?: string;
  };
  assigned_department?: string;
  assigned_officer?: string;
  resolution_notes?: string;
  resolution_photo?: string;
  citizen_feedback?: 'confirmed' | 'disputed' | null;
  dispute_reason?: string;
  public_token?: string; // magic token for officer quick update
}

export interface WardLeaderboardItem {
  ward_id: string;
  ward_name: string;
  zone: string;
  total_reports: number;
  resolved_reports: number;
  resolution_rate_percent: number;
  avg_resolution_hours: number;
  rank: number;
  active_citizens: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'officer' | 'admin';
  ward?: string;
  department?: string; // if officer
  designation?: string; // if officer (e.g., Assistant Engineer, Junior Engineer, SDO, Sanitary Inspector)
  employee_id?: string; // if officer (e.g., PB-MCJ-2024-ENG-082)
  jurisdiction_zone?: string; // if officer (e.g., Central Zone, North Division, Phillaur Sub-Division)
  points: number;
  level: number;
  badges: UserBadge[];
  reports_submitted_count: number;
  reports_resolved_count: number;
  upvotes_given_count: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  is_unlocked: boolean;
  points_reward: number;
}

export interface CategoryInfo {
  id: IssueCategory;
  label: string;
  description: string;
  slaDefaultHours: number;
  color: string;
  icon: string;
}

export interface CreateReportPayload {
  title?: string;
  category: IssueCategory;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  ward?: string;
  is_anonymous?: boolean;
  photo_blob?: Blob | null;
  photo_data_url?: string;
  video_blob?: Blob | null;
  video_data_url?: string;
}

export interface StatusUpdatePayload {
  status: IssueStatus;
  notes?: string;
  resolution_photo_blob?: Blob;
  resolution_photo_data_url?: string;
  assigned_department?: string;
  assigned_officer?: string;
}

export interface VerificationPayload {
  feedback: 'confirmed' | 'disputed';
  dispute_reason?: string;
  evidence_blob?: Blob;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  results: T[];
}

export interface ReportFilterParams {
  page?: number;
  page_size?: number;
  priority?: string;
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  date_range?: 'all' | 'today' | '7d' | '30d';
  sort_by?: 'newest' | 'oldest' | 'priority' | 'sla';
  ward?: string;
}

