import axios from 'axios';
import {
  Issue,
  IssueCategory,
  IssueStatus,
  WardLeaderboardItem,
  CreateReportPayload,
  StatusUpdatePayload,
  VerificationPayload,
} from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_auth_token') || 'mock-jwt-token-civic-connect';
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
    title: 'Severe Craters on 80ft Road Intersection',
    description: 'Deep road potholes causing two-wheelers to skid near 6th Cross junction. Water accumulates during rain masking depth.',
    category: 'pothole',
    status: 'in_progress',
    priority: 'high',
    location: {
      latitude: 12.9348,
      longitude: 77.6225,
      address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
      landmark: 'Opposite Maharaja Hotel',
      ward: 'Ward 18 - Koramangala',
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
    assigned_department: 'BBMP Major Roads Division',
    assigned_officer: 'S. K. Murthy (AE)',
    public_token: 'tok-pothole-80ft-901',
  },
  {
    id: 'iss_902',
    tracking_id: 'CC-2026-902',
    title: 'Overflowing Garbage Dump Near Public Park Gate',
    description: 'Black trash bags ripped open by stray dogs. Foul odor preventing residents and morning walkers from using the park.',
    category: 'garbage',
    status: 'reported',
    priority: 'urgent',
    location: {
      latitude: 12.9362,
      longitude: 77.6258,
      address: '3rd Cross, 3rd Block, Koramangala, Bengaluru',
      landmark: 'Next to Swabhimana Childrens Park',
      ward: 'Ward 18 - Koramangala',
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
      latitude: 12.9331,
      longitude: 77.6202,
      address: '17th Main Rd, 5th Block, Koramangala, Bengaluru',
      landmark: 'Near Jyoti Nivas College Corner',
      ward: 'Ward 18 - Koramangala',
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
    assigned_department: 'BWSSB Water Supply Unit 4',
    public_token: 'tok-waterleak-jnc-903',
  },
  {
    id: 'iss_904',
    tracking_id: 'CC-2026-904',
    title: 'Streetlights Dark for 200m Stretch on 5th Cross',
    description: 'Five consecutive LED poles not illuminating after 7 PM. Serious safety risk for pedestrians and women returning from bus stop.',
    category: 'streetlight',
    status: 'resolved',
    priority: 'medium',
    location: {
      latitude: 12.9378,
      longitude: 77.6271,
      address: '5th Cross, 6th Block, Koramangala, Bengaluru',
      landmark: 'Behind Police Station',
      ward: 'Ward 18 - Koramangala',
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
        uploaded_by: 'Lineman Venkatesh (BESCOM)',
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
    assigned_department: 'BESCOM Street Lighting Dept',
    assigned_officer: 'Lineman Venkatesh',
    public_token: 'tok-streetlight-5thcr-904',
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
      latitude: 12.932,
      longitude: 77.624,
      address: 'Sarjapur Main Rd, Koramangala 1st Block, Bengaluru',
      landmark: 'Near Wipro Park Signal',
      ward: 'Ward 18 - Koramangala',
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
    assigned_department: 'Stormwater Drain (SWD) Cell',
    assigned_officer: 'Naveen Kumar (AE)',
    public_token: 'tok-drain-wipro-905',
  },
];

const mockLeaderboard: WardLeaderboardItem[] = [
  {
    ward_id: 'ward_18',
    ward_name: 'Ward 18 - Koramangala',
    zone: 'South Zone',
    total_reports: 142,
    resolved_reports: 129,
    resolution_rate_percent: 90.8,
    avg_resolution_hours: 19.4,
    rank: 1,
    active_citizens: 420,
  },
  {
    ward_id: 'ward_42',
    ward_name: 'Ward 42 - Jayanagar',
    zone: 'South Zone',
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
  // Get all issues with optional filtering
  getAll: async (params?: { category?: string; status?: string; ward?: string }): Promise<Issue[]> => {
    try {
      const response = await apiClient.get('/issues/', { params });
      return response.data;
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

  // Get single issue by ID
  getById: async (id: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/issues/${id}/`);
      return response.data;
    } catch {
      const issue = mockIssues.find((i) => i.id === id || i.tracking_id === id);
      if (!issue) throw new Error('Issue not found');
      return issue;
    }
  },

  // Get issue by public magic update token
  getByToken: async (token: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/public/update/${token}/`);
      return response.data;
    } catch {
      const issue = mockIssues.find((i) => i.public_token === token || i.id === token);
      if (!issue) {
        // Fallback to first issue if test token
        return mockIssues[0];
      }
      return issue;
    }
  },

  // Create issue
  create: async (payload: CreateReportPayload): Promise<Issue> => {
    try {
      const formData = new FormData();
      formData.append('category', payload.category);
      formData.append('description', payload.description);
      formData.append('latitude', payload.latitude.toString());
      formData.append('longitude', payload.longitude.toString());
      if (payload.address) formData.append('address', payload.address);
      if (payload.landmark) formData.append('landmark', payload.landmark);
      if (payload.ward) formData.append('ward', payload.ward);
      if (payload.photo_blob) formData.append('photo', payload.photo_blob, 'evidence.jpg');
      if (payload.video_blob) formData.append('video', payload.video_blob, 'pan-evidence.webm');

      const response = await apiClient.post('/issues/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch {
      // Mock creation
      const newId = `iss_${Date.now()}`;
      const newTrackingId = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const photoUrl =
        payload.photo_data_url ||
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';

      const newIssue: Issue = {
        id: newId,
        tracking_id: newTrackingId,
        title: `${payload.category.replace('_', ' ').toUpperCase()} reported at ${payload.landmark || payload.ward || 'Location'}`,
        description: payload.description,
        category: payload.category,
        status: 'reported',
        priority: payload.category === 'traffic_signal' || payload.category === 'water_leakage' ? 'urgent' : 'high',
        location: {
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address || 'Koramangala, Bengaluru, Karnataka',
          landmark: payload.landmark || 'Street Corner',
          ward: payload.ward || 'Ward 18 - Koramangala',
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
      const response = await apiClient.post(`/issues/${id}/upvote/`);
      return response.data;
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
      const response = await apiClient.patch(`/issues/${id}/status/`, payload);
      return response.data;
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
      const response = await apiClient.post(`/public/update/${token}/`, payload);
      return response.data;
    } catch {
      const issue = mockIssues.find((i) => i.public_token === token || i.id === token) || mockIssues[0];
      return issuesApi.updateStatus(issue.id, payload);
    }
  },

  // Citizen verification: "Yes Fixed (+20 pts)" / "No Disputed"
  confirmResolution: async (id: string, payload: VerificationPayload): Promise<Issue> => {
    try {
      const response = await apiClient.post(`/issues/${id}/verify/`, payload);
      return response.data;
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

  // Leaderboard data
  getLeaderboard: async (): Promise<WardLeaderboardItem[]> => {
    try {
      const response = await apiClient.get('/leaderboard/');
      return response.data;
    } catch {
      return mockLeaderboard;
    }
  },
};
