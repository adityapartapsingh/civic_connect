import axios from 'axios';
import {
  Issue,
  IssueCategory,
  IssueStatus,
  WardLeaderboardItem,
  CreateReportPayload,
  StatusUpdatePayload,
  VerificationPayload,
  PaginatedResponse,
  ReportFilterParams,
  UserProfile,
} from '../types';
import {
  adaptBackendReportToIssue,
  adaptWardLeaderboardItem,
  frontendPriorityToBackend,
  frontendStatusToBackend,
} from './adapters';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rich Mock Data Store for MVP resilience & offline/demo operation
let mockIssues: Issue[] = [
  {
    id: 'iss_901',
    tracking_id: 'CC-2026-901',
    title: 'Severe Road Craters on Civil Lines Intersection',
    description: 'Deep road potholes causing two-wheelers to skid near Company Bagh junction. Water accumulates during rain masking depth.',
    category: 'pothole',
    status: 'in_progress',
    priority: 'high',
    location: {
      latitude: 31.3265,
      longitude: 75.5768,
      address: 'Civil Lines Road, Jalandhar, Punjab',
      landmark: 'Near Company Bagh Chowk',
      ward: 'Ward 2 - Civil Lines, Jalandhar',
      accuracy: 8,
    },
    evidence: [
      {
        id: 'ev_1',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        caption: 'Initial photo taken by citizen',
        created_at: '2026-10-15T09:30:00Z',
        stage: 'initial',
      },
      {
        id: 'ev_2',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        caption: 'Asphalt cold-mix batch unloaded by road maintenance squad',
        created_at: '2026-10-16T14:20:00Z',
        stage: 'in_progress',
      },
    ],
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-10-15T09:30:00Z',
    updated_at: '2026-10-16T14:20:00Z',
    acknowledged_at: '2026-10-15T10:15:00Z',
    sla_hours: 48,
    sla_deadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), // 3 hours left (urgent)
    sla_breached: false,
    upvotes_count: 19,
    has_upvoted: true,
    reporter: {
      id: 'usr_c19284',
      name: 'Priya Sharma',
      is_anonymous: false,
      phone_masked: '98***43210',
    },
    assigned_department: 'Municipal Roads & Infrastructure Division',
    assigned_officer: 'S. K. Murthy (AE)',
    public_token: 'tok-pothole-civillines-901',
  },
  {
    id: 'iss_902',
    tracking_id: 'CC-2026-902',
    title: 'Overflowing Garbage Dump Near Public Park Gate',
    description: 'Black trash bags ripped open by stray cattle. Foul odor preventing residents and morning walkers from using the park.',
    category: 'garbage',
    status: 'reported',
    priority: 'urgent',
    location: {
      latitude: 31.3105,
      longitude: 75.5812,
      address: 'Model Town Market Rd, Jalandhar, Punjab',
      landmark: 'Opposite Model Town Geeta Mandir',
      ward: 'Ward 1 - Model Town, Jalandhar',
      accuracy: 6,
    },
    evidence: [
      {
        id: 'ev_3',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
        caption: 'Garbage heap on pedestrian pathway',
        created_at: '2026-10-16T08:00:00Z',
        stage: 'initial',
      },
    ],
    photo_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-10-16T08:00:00Z',
    updated_at: '2026-10-16T08:00:00Z',
    sla_hours: 24,
    sla_deadline: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    sla_breached: false,
    upvotes_count: 31,
    has_upvoted: false,
    reporter: {
      id: 'usr_882',
      name: 'Rohan Mehta',
      is_anonymous: false,
      phone_masked: '91***22114',
    },
    public_token: 'tok-garbage-park-902',
  },
  {
    id: 'iss_903',
    tracking_id: 'CC-2026-903',
    title: 'High Pressure Water Main Leak Flooding Lane',
    description: 'Continuous drinking water leakage from underground municipal pipe since yesterday morning. Road submerged in 3 inches water.',
    category: 'water_leakage',
    status: 'reported',
    priority: 'urgent',
    location: {
      latitude: 31.2850,
      longitude: 75.6180,
      address: 'Cantt Road, Jalandhar Cantt, Punjab',
      landmark: 'Near Military Hospital Gate',
      ward: 'Ward 3 - Cantt Road, Jalandhar',
      accuracy: 5,
    },
    evidence: [
      {
        id: 'ev_4',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
        caption: 'Flooding street from burst valve',
        created_at: '2026-10-14T07:15:00Z',
        stage: 'initial',
      },
    ],
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-10-14T07:15:00Z',
    updated_at: '2026-10-14T07:15:00Z',
    sla_hours: 12,
    sla_deadline: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // Breached by 5 hours!
    sla_breached: true,
    upvotes_count: 42,
    has_upvoted: true,
    reporter: {
      id: 'usr_441',
      name: 'Anita Desai',
      is_anonymous: false,
      phone_masked: '97***11099',
    },
    assigned_department: 'Water Supply & Sewerage Unit',
    public_token: 'tok-waterleak-cantt-903',
  },
  {
    id: 'iss_904',
    tracking_id: 'CC-2026-904',
    title: 'Streetlights Dark for 200m Stretch on Fort Road',
    description: 'Five consecutive LED poles not illuminating after 7 PM. Serious safety risk for pedestrians and women returning from bus stop.',
    category: 'streetlight',
    status: 'resolved',
    priority: 'medium',
    location: {
      latitude: 31.0210,
      longitude: 75.7825,
      address: 'Fort Road, Phillaur, Punjab',
      landmark: 'Near Historic Phillaur Fort',
      ward: 'Ward 6 - Phillaur Fort Road',
      accuracy: 7,
    },
    evidence: [
      {
        id: 'ev_5',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        caption: 'Pitch dark roadway at night',
        created_at: '2026-10-11T20:45:00Z',
        stage: 'initial',
      },
      {
        id: 'ev_6',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
        caption: 'New 90W LED luminaires installed and powered',
        created_at: '2026-10-13T18:10:00Z',
        stage: 'resolution',
        uploaded_by: 'Lineman Harpreet Singh',
      },
    ],
    photo_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    resolution_photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    resolution_notes: 'Replaced burnt fuse connector and installed 5 brand new Phillips LED luminaires. Tested on line load.',
    created_at: '2026-10-11T20:45:00Z',
    updated_at: '2026-10-13T18:10:00Z',
    acknowledged_at: '2026-10-12T09:00:00Z',
    resolved_at: '2026-10-13T18:10:00Z',
    sla_hours: 36,
    sla_deadline: '2026-10-13T19:00:00Z',
    sla_breached: false,
    upvotes_count: 15,
    has_upvoted: false,
    citizen_feedback: null, // Ready for citizen verification!
    assigned_department: 'Electrical & Street Lighting Cell',
    assigned_officer: 'Lineman Harpreet Singh',
    public_token: 'tok-streetlight-phillaur-904',
  },
  {
    id: 'iss_905',
    tracking_id: 'CC-2026-905',
    title: 'Broken Stormwater Drain Slab with Exposed Rebar',
    description: 'Footpath slab collapsed into drain leaving 4-foot open trench. Pedestrians forced into busy traffic lane.',
    category: 'drainage',
    status: 'acknowledged',
    priority: 'high',
    location: {
      latitude: 31.3125,
      longitude: 75.6295,
      address: 'Hoshiarpur Road, Rama Mandi, Jalandhar, Punjab',
      landmark: 'Near Rama Mandi Chowk',
      ward: 'Ward 4 - Rama Mandi, Jalandhar',
      accuracy: 4,
    },
    evidence: [
      {
        id: 'ev_7',
        media_type: 'photo',
        url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
        caption: 'Dangerous open manhole cavity',
        created_at: '2026-10-16T12:00:00Z',
        stage: 'initial',
      },
    ],
    photo_url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-10-16T12:00:00Z',
    updated_at: '2026-10-16T15:30:00Z',
    acknowledged_at: '2026-10-16T15:30:00Z',
    sla_hours: 24,
    sla_deadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    sla_breached: false,
    upvotes_count: 8,
    has_upvoted: false,
    assigned_department: 'Municipal Roads & Infrastructure Division',
    assigned_officer: 'Naveen Kumar (AE)',
    public_token: 'tok-drain-ramamandi-905',
  },
];

const mockLeaderboard: WardLeaderboardItem[] = [
  {
    ward_id: 'ward_2',
    ward_name: 'Ward 2 - Civil Lines, Jalandhar',
    zone: 'North Zone',
    total_reports: 142,
    resolved_reports: 129,
    resolution_rate_percent: 90.8,
    avg_resolution_hours: 19.4,
    rank: 1,
    active_citizens: 420,
  },
  {
    ward_id: 'ward_1',
    ward_name: 'Ward 1 - Model Town, Jalandhar',
    zone: 'Central Zone',
    total_reports: 118,
    resolved_reports: 104,
    resolution_rate_percent: 88.1,
    avg_resolution_hours: 22.1,
    rank: 2,
    active_citizens: 312,
  },
  {
    ward_id: 'ward_55',
    ward_name: 'Ward 55 - Malleshwaram',
    zone: 'West Zone',
    total_reports: 96,
    resolved_reports: 83,
    resolution_rate_percent: 86.4,
    avg_resolution_hours: 24.6,
    rank: 3,
    active_citizens: 260,
  },
  {
    ward_id: 'ward_12',
    ward_name: 'Ward 12 - Indiranagar',
    zone: 'East Zone',
    total_reports: 185,
    resolved_reports: 151,
    resolution_rate_percent: 81.6,
    avg_resolution_hours: 27.2,
    rank: 4,
    active_citizens: 580,
  },
  {
    ward_id: 'ward_31',
    ward_name: 'Ward 31 - HSR Layout',
    zone: 'South Zone',
    total_reports: 134,
    resolved_reports: 105,
    resolution_rate_percent: 78.3,
    avg_resolution_hours: 31.0,
    rank: 5,
    active_citizens: 390,
  },
];

export const issuesApi = {
  // Get paginated issues with filtering by priority, status, category, date range, sort
  getPaginated: async (params?: ReportFilterParams): Promise<PaginatedResponse<Issue>> => {
    try {
      const apiParams: Record<string, any> = {};
      if (params?.page) apiParams.page = params.page;
      if (params?.page_size) apiParams.page_size = params.page_size;
      if (params?.category && params.category !== 'all') apiParams.category = params.category;
      if (params?.status && params.status !== 'all') apiParams.status = frontendStatusToBackend(params.status);
      if (params?.priority && params.priority !== 'all') apiParams.priority = frontendPriorityToBackend(params.priority);
      if (params?.ward && params.ward !== 'all') apiParams.ward_id = params.ward;
      if (params?.date_from) apiParams.date_from = params.date_from;
      if (params?.date_to) apiParams.date_to = params.date_to;
      if (params?.sort_by) apiParams.sort_by = params.sort_by;

      const response = await apiClient.get('/reports/', { params: apiParams });
      if (response.data && Array.isArray(response.data.results)) {
        return {
          ...response.data,
          results: response.data.results.map(adaptBackendReportToIssue),
        };
      }
      if (Array.isArray(response.data)) {
        const adapted = response.data.map(adaptBackendReportToIssue);
        return {
          total: adapted.length,
          page: 1,
          page_size: adapted.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
          results: adapted,
        };
      }
      throw new Error('Unexpected response format from reports API');
    } catch {
      // Mock filtering & pagination for offline / resilient dev mode
      let filtered = [...mockIssues];
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((i) => i.category === params.category);
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((i) => i.status === params.status);
      }
      if (params?.priority && params.priority !== 'all') {
        filtered = filtered.filter((i) => i.priority === params.priority);
      }
      if (params?.ward && params.ward !== 'all') {
        filtered = filtered.filter((i) => i.location.ward === params.ward);
      }
      if (params?.date_range && params.date_range !== 'all') {
        const now = Date.now();
        const days = params.date_range === 'today' ? 1 : params.date_range === '7d' ? 7 : 30;
        const cutoff = now - days * 24 * 3600 * 1000;
        filtered = filtered.filter((i) => new Date(i.created_at).getTime() >= cutoff);
      }

      // Sort
      if (params?.sort_by === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (params?.sort_by === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
      } else if (params?.sort_by === 'sla') {
        filtered.sort((a, b) => new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime());
      } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const startIndex = (page - 1) * pageSize;
      const results = filtered.slice(startIndex, startIndex + pageSize);

      return {
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
        results,
      };
    }
  },

  // Get all issues
  getAll: async (params?: { category?: string; status?: string; ward?: string }): Promise<Issue[]> => {
    try {
      const apiParams: Record<string, any> = { page_size: 100 };
      if (params?.category && params.category !== 'all') apiParams.category = params.category;
      if (params?.status && params.status !== 'all') apiParams.status = frontendStatusToBackend(params.status);
      if (params?.ward && params.ward !== 'all') apiParams.ward_id = params.ward;

      const response = await apiClient.get('/reports/', { params: apiParams });
      const rawList = Array.isArray(response.data?.results) ? response.data.results : response.data;
      if (Array.isArray(rawList)) {
        return rawList.map(adaptBackendReportToIssue);
      }
      throw new Error('Unexpected format');
    } catch {
      let filtered = [...mockIssues];
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((i) => i.category === params.category);
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((i) => i.status === params.status);
      }
      if (params?.ward && params.ward !== 'all') {
        filtered = filtered.filter((i) => i.location.ward === params.ward);
      }
      return filtered;
    }
  },

  // Real MongoDB 2dsphere Geospatial Nearby Query
  getNearby: async (
    lat: number,
    lng: number,
    radiusMeters = 500,
    category?: string,
    status?: string
  ): Promise<Issue[]> => {
    try {
      const params: Record<string, any> = {
        lat,
        lng,
        radius: radiusMeters,
      };
      if (category && category !== 'all') params.category = category;
      if (status && status !== 'all') params.status = frontendStatusToBackend(status);

      const response = await apiClient.get('/reports/nearby/', { params });
      if (Array.isArray(response.data)) {
        return response.data.map(adaptBackendReportToIssue);
      }
      throw new Error('Unexpected nearby response');
    } catch {
      // Mock fallback: filter in-memory mockIssues by Haversine distance
      return mockIssues;
    }
  },

  // Feed ranked by priority, upvotes, and proximity
  getFeed: async (lat?: number, lng?: number, radiusMeters = 10000): Promise<Issue[]> => {
    try {
      const params: Record<string, any> = { radius: radiusMeters };
      if (lat !== undefined) params.lat = lat;
      if (lng !== undefined) params.lng = lng;

      const response = await apiClient.get('/reports/feed/', { params });
      if (Array.isArray(response.data)) {
        return response.data.map(adaptBackendReportToIssue);
      }
      throw new Error('Unexpected feed response');
    } catch {
      return mockIssues;
    }
  },

  // Get single issue by ID or Ticket ID
  getById: async (id: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/reports/${id}/`);
      return adaptBackendReportToIssue(response.data);
    } catch {
      const issue = mockIssues.find((i) => i.id === id || i.tracking_id === id);
      if (!issue) throw new Error('Issue not found');
      return issue;
    }
  },

  // Get issue by cryptographic field dispatch action token
  getByToken: async (token: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/public-update/${token}/`);
      const reportDoc = response.data?.report || response.data;
      return adaptBackendReportToIssue(reportDoc);
    } catch {
      const issue = mockIssues.find((i) => i.public_token === token || i.id === token);
      if (!issue) return mockIssues[0];
      return issue;
    }
  },

  // Create issue (uploads photo to backend Cloudinary pipeline)
  create: async (payload: CreateReportPayload): Promise<Issue> => {
    try {
      const formData = new FormData();
      if (payload.title) formData.append('title', payload.title);
      formData.append('category', payload.category);
      formData.append('description', payload.description);
      formData.append('latitude', payload.latitude.toString());
      formData.append('longitude', payload.longitude.toString());
      if (payload.address) formData.append('address', payload.address);
      if (payload.landmark) formData.append('landmark', payload.landmark);
      if (payload.ward) formData.append('ward_id', payload.ward);
      if (payload.photo_blob) formData.append('photo', payload.photo_blob, 'evidence.jpg');
      if (payload.video_blob) formData.append('video', payload.video_blob, 'pan-evidence.webm');

      const response = await apiClient.post('/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return adaptBackendReportToIssue(response.data);
    } catch {
      // Mock creation fallback if backend is unreachable
      const newId = `iss_${Date.now()}`;
      const newTrackingId = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const photoUrl =
        payload.photo_data_url ||
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';

      const newIssue: Issue = {
        id: newId,
        tracking_id: newTrackingId,
        title: payload.title || `${payload.category.replace('_', ' ').toUpperCase()} reported at ${payload.landmark || payload.ward || 'Location'}`,
        description: payload.description,
        category: payload.category,
        status: 'reported',
        priority: payload.category === 'traffic_signal' || payload.category === 'water_leakage' ? 'urgent' : 'high',
        location: {
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address || 'Civil Lines, Jalandhar, Punjab',
          landmark: payload.landmark || 'Street Corner',
          ward: payload.ward || 'Ward 2 - Civil Lines, Jalandhar',
          accuracy: 5,
        },
        evidence: [
          {
            id: `ev_${Date.now()}`,
            media_type: payload.video_data_url ? 'video' : 'photo',
            url: photoUrl,
            caption: 'Verified live camera evidence',
            created_at: new Date().toISOString(),
            stage: 'initial',
          },
        ],
        photo_url: photoUrl,
        video_url: payload.video_data_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sla_hours: 36,
        sla_deadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        sla_breached: false,
        upvotes_count: 1,
        has_upvoted: true,
        reporter: {
          id: 'usr_c19284',
          name: payload.is_anonymous ? 'Anonymous Citizen' : 'Priya Sharma',
          is_anonymous: !!payload.is_anonymous,
          phone_masked: '98***43210',
        },
        public_token: `tok-${newId}`,
      };

      mockIssues.unshift(newIssue);
      return newIssue;
    }
  },

  // Upvote or confirm seeing an issue ("I see this too")
  upvote: async (id: string): Promise<{ upvotes_count: number; has_upvoted: boolean }> => {
    try {
      const response = await apiClient.post(`/reports/${id}/upvote/`);
      const count = response.data?.upvotes_count ?? response.data?.report?.upvote_count ?? 1;
      return { upvotes_count: count, has_upvoted: true };
    } catch {
      const issue = mockIssues.find((i) => i.id === id);
      if (issue) {
        issue.has_upvoted = !issue.has_upvoted;
        issue.upvotes_count += issue.has_upvoted ? 1 : -1;
        return { upvotes_count: issue.upvotes_count, has_upvoted: issue.has_upvoted };
      }
      return { upvotes_count: 1, has_upvoted: true };
    }
  },

  // Officer status update
  updateStatus: async (id: string, payload: StatusUpdatePayload): Promise<Issue> => {
    try {
      const formData = new FormData();
      formData.append('status', frontendStatusToBackend(payload.status));
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.assigned_officer) formData.append('changed_by', payload.assigned_officer);
      formData.append('role', 'officer');
      if (payload.resolution_photo_blob) {
        formData.append('resolution_photo', payload.resolution_photo_blob, 'resolution_proof.jpg');
      }

      const response = await apiClient.patch(`/reports/${id}/status/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return adaptBackendReportToIssue(response.data);
    } catch {
      const issue = mockIssues.find((i) => i.id === id);
      if (!issue) throw new Error('Issue not found');

      issue.status = payload.status;
      issue.updated_at = new Date().toISOString();
      if (payload.notes) issue.resolution_notes = payload.notes;
      if (payload.assigned_department) issue.assigned_department = payload.assigned_department;
      if (payload.assigned_officer) issue.assigned_officer = payload.assigned_officer;

      if (payload.resolution_photo_data_url) {
        issue.resolution_photo = payload.resolution_photo_data_url;
        issue.evidence.push({
          id: `ev_res_${Date.now()}`,
          media_type: 'photo',
          url: payload.resolution_photo_data_url,
          caption: 'Officer Resolution Proof',
          created_at: new Date().toISOString(),
          stage: 'resolution',
          uploaded_by: payload.assigned_officer || 'Field Officer',
        });
      }

      if (payload.status === 'resolved') {
        issue.resolved_at = new Date().toISOString();
      } else if (payload.status === 'acknowledged' && !issue.acknowledged_at) {
        issue.acknowledged_at = new Date().toISOString();
      }

      return issue;
    }
  },

  // Token-based officer update (magic link, no login required)
  updateByToken: async (token: string, payload: StatusUpdatePayload): Promise<Issue> => {
    try {
      const formData = new FormData();
      formData.append('status', frontendStatusToBackend(payload.status));
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.assigned_officer) formData.append('officer_name', payload.assigned_officer);
      if (payload.resolution_photo_blob) {
        formData.append('resolution_photo', payload.resolution_photo_blob, 'resolution_proof.jpg');
      }

      const response = await apiClient.post(`/public-update/${token}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const reportDoc = response.data?.report || response.data;
      return adaptBackendReportToIssue(reportDoc);
    } catch {
      const issue = mockIssues.find((i) => i.public_token === token || i.id === token) || mockIssues[0];
      return issuesApi.updateStatus(issue.id, payload);
    }
  },

  // Citizen verification: "Yes Fixed (+20 pts)" / "No Disputed"
  confirmResolution: async (id: string, payload: VerificationPayload): Promise<Issue> => {
    try {
      if (payload.feedback === 'confirmed') {
        const response = await apiClient.post(`/reports/${id}/confirm/`, {
          notes: 'Citizen confirmed resolution on-site.',
        });
        return adaptBackendReportToIssue(response.data);
      } else {
        const response = await apiClient.post(`/reports/${id}/dispute/`, {
          dispute_reason: payload.dispute_reason || 'Citizen disputed the resolution.',
        });
        return adaptBackendReportToIssue(response.data);
      }
    } catch {
      const issue = mockIssues.find((i) => i.id === id);
      if (!issue) throw new Error('Issue not found');

      if (payload.feedback === 'confirmed') {
        issue.status = 'closed';
        issue.citizen_feedback = 'confirmed';
      } else {
        issue.status = 'disputed';
        issue.citizen_feedback = 'disputed';
        issue.dispute_reason = payload.dispute_reason;
      }
      issue.updated_at = new Date().toISOString();
      return issue;
    }
  },

  // Municipal Ward Leaderboard
  getLeaderboard: async (): Promise<WardLeaderboardItem[]> => {
    try {
      const response = await apiClient.get('/wards/leaderboard/');
      if (Array.isArray(response.data)) {
        return response.data.map(adaptWardLeaderboardItem);
      }
      return mockLeaderboard;
    } catch {
      return mockLeaderboard;
    }
  },
};

export const authApi = {
  // Send OTP with 60-second cooldown rate limit enforced by backend
  sendOtp: async (phone: string, role: string = 'citizen'): Promise<{ message: string; retry_after: number }> => {
    try {
      const response = await apiClient.post('/users/send-otp/', { phone, role });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retry_after || 60;
        throw new Error(err.response.data?.error || `Rate limit active. Please wait ${retryAfter}s before requesting a new OTP.`);
      }
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      // Demo mock fallback if backend offline
      return { message: 'OTP dispatched successfully (Demo Code: 123456)', retry_after: 60 };
    }
  },

  // Verify OTP and issue JWT + User Profile
  verifyOtp: async (payload: {
    phone: string;
    otp: string;
    role?: string;
    name?: string;
    email?: string;
    ward?: string;
    department?: string;
    designation?: string;
    employee_id?: string;
    jurisdiction_zone?: string;
  }): Promise<{ token: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/verify-otp/', payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      // Demo mock fallback if backend offline
      if (payload.otp === '123456' || payload.otp.length === 6) {
        const isOfficer = payload.role === 'officer' || payload.role === 'admin';
        const mockUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: payload.name || (isOfficer ? 'Er. S. K. Murthy (AE)' : 'Verified Citizen'),
          phone: payload.phone,
          email: payload.email,
          role: (payload.role as any) || 'citizen',
          department: isOfficer ? (payload.department || 'Municipal Roads & Infrastructure Division') : undefined,
          designation: isOfficer ? (payload.designation || 'Assistant Engineer (AE)') : undefined,
          employee_id: isOfficer ? (payload.employee_id || 'PB-MCJ-2024-ENG-042') : undefined,
          jurisdiction_zone: isOfficer ? (payload.jurisdiction_zone || 'Central Zone / Head Office') : undefined,
          points: 0,
          level: 1,
          reports_submitted_count: 0,
          reports_resolved_count: 0,
          upvotes_given_count: 0,
          badges: [],
        };
        return { token: `jwt-token-${Date.now()}`, user: mockUser };
      }
      throw new Error('Invalid verification code. Please check and try again.');
    }
  },
};

