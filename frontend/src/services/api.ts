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
  AdminProvisionPayload,
  AdminCredentialsSlip,
  VolunteerApplication,
  VolunteerRegisterPayload,
  NotificationItem,
} from '../types';
import {
  adaptBackendReportToIssue,
  adaptWardLeaderboardItem,
  adaptUserProfile,
  frontendPriorityToBackend,
  frontendStatusToBackend,
} from './adapters';

const resolveApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) return '/api';
  // Strip trailing slash if present
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // 30s timeout to gracefully accommodate Render cold starts
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getCurrentStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('civic_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Clean Data Store: All reports originate authentically from backend MongoDB
let mockIssues: Issue[] = [];

const mockLeaderboard: WardLeaderboardItem[] = [];

export const issuesApi = {
  // Get paginated issues with filtering by priority, status, category, date range, sort from MongoDB
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
      return {
        total: 0,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total_pages: 1,
        has_next: false,
        has_prev: false,
        results: [],
      };
    } catch (err) {
      console.error('MongoDB reports query failed:', err);
      return {
        total: 0,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total_pages: 1,
        has_next: false,
        has_prev: false,
        results: [],
      };
    }
  },

  // Get all issues directly from MongoDB
  getAll: async (params?: { category?: string; status?: string; ward?: string; reporter_id?: string; reporter_phone?: string; my_reports?: boolean }): Promise<Issue[]> => {
    try {
      const apiParams: Record<string, any> = { page_size: 100 };
      if (params?.category && params.category !== 'all') apiParams.category = params.category;
      if (params?.status && params.status !== 'all') apiParams.status = frontendStatusToBackend(params.status);
      if (params?.ward && params.ward !== 'all') apiParams.ward_id = params.ward;
      if (params?.reporter_id) apiParams.reporter_id = params.reporter_id;
      if (params?.reporter_phone) apiParams.reporter_phone = params.reporter_phone;
      if (params?.my_reports) apiParams.my_reports = 'true';

      const response = await apiClient.get('/reports/', { params: apiParams });
      const rawList = Array.isArray(response.data?.results) ? response.data.results : response.data;
      if (Array.isArray(rawList)) {
        return rawList.map(adaptBackendReportToIssue);
      }
      return [];
    } catch (err) {
      console.error('MongoDB getAll reports failed:', err);
      return [];
    }
  },

  // Real MongoDB 2dsphere Geospatial Nearby Query
  getNearby: async (
    lat: number,
    lng: number,
    radiusMeters = 50000,
    category?: string,
    status?: string,
    includeResolved = true,
    limit = 100,
    skip = 0
  ): Promise<Issue[]> => {
    try {
      const params: Record<string, any> = {
        lat,
        lng,
        radius: radiusMeters,
        include_resolved: includeResolved,
        limit,
        skip,
      };
      if (category && category !== 'all') params.category = category;
      if (status && status !== 'all') params.status = frontendStatusToBackend(status);

      const response = await apiClient.get('/reports/nearby/', { params });
      if (Array.isArray(response.data)) {
        return response.data.map(adaptBackendReportToIssue);
      }
      return [];
    } catch (err) {
      console.error('MongoDB getNearby failed:', err);
      return [];
    }
  },

  // Feed ranked by priority, upvotes, and proximity from MongoDB
  getFeed: async (lat?: number, lng?: number, radiusMeters = 10000): Promise<Issue[]> => {
    try {
      const params: Record<string, any> = { radius: radiusMeters };
      if (lat !== undefined) params.lat = lat;
      if (lng !== undefined) params.lng = lng;

      const response = await apiClient.get('/reports/feed/', { params });
      if (Array.isArray(response.data)) {
        return response.data.map(adaptBackendReportToIssue);
      }
      return [];
    } catch (err) {
      console.error('MongoDB getFeed failed:', err);
      return [];
    }
  },

  // Get single issue by ID or Ticket ID directly from MongoDB
  getById: async (id: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/reports/${id}/`);
      return adaptBackendReportToIssue(response.data);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      throw new Error(detail || `Issue ${id} not found in database.`);
    }
  },

  // Get issue by cryptographic field dispatch action token from MongoDB
  getByToken: async (token: string): Promise<Issue> => {
    try {
      const response = await apiClient.get(`/public-update/${token}/`);
      const reportDoc = response.data?.report || response.data;
      return adaptBackendReportToIssue(reportDoc);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      throw new Error(detail || 'Dispatch link expired or invalid.');
    }
  },

  // Create issue in MongoDB (uploads photo to backend Cloudinary / storage pipeline)
  create: async (payload: CreateReportPayload): Promise<Issue> => {
    const currentUser = getCurrentStoredUser();
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

    // Attach active authenticated citizen details so report is permanently linked in MongoDB
    if (currentUser?.id) formData.append('reporter_id', currentUser.id);
    if (currentUser?.name) formData.append('reporter_name', currentUser.name);
    if (currentUser?.phone) formData.append('reporter_phone', currentUser.phone);

    try {
      const response = await apiClient.post('/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return adaptBackendReportToIssue(response.data);
    } catch (err: any) {
      const errDetail =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : null) ||
        err.message;
      console.error('Failed to create report in MongoDB:', err);
      throw new Error(errDetail || 'Could not save report to database. Please check your network and try again.');
    }
  },

  // Upvote or confirm seeing an issue ("I see this too")
  upvote: async (id: string): Promise<{ upvotes_count: number; has_upvoted: boolean }> => {
    try {
      const response = await apiClient.post(`/reports/${id}/upvote/`);
      const hasUpvoted = Boolean(response.data?.has_upvoted);
      const count = response.data?.upvotes_count ?? response.data?.report?.upvote_count ?? 0;
      return { upvotes_count: count, has_upvoted: hasUpvoted };
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        throw new Error(detail);
      }
      const issue = mockIssues.find((i) => i.id === id);
      if (issue) {
        issue.has_upvoted = !issue.has_upvoted;
        issue.upvotes_count = Math.max(0, issue.upvotes_count + (issue.has_upvoted ? 1 : -1));
        return { upvotes_count: issue.upvotes_count, has_upvoted: issue.has_upvoted };
      }
      throw err;
    }
  },

  // Officer status update
  updateStatus: async (id: string, payload: StatusUpdatePayload): Promise<Issue> => {
    try {
      const formData = new FormData();
      formData.append('status', frontendStatusToBackend(payload.status));
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.materials_used) formData.append('materials_used', payload.materials_used);
      if (payload.assigned_officer) {
        formData.append('assigned_officer', payload.assigned_officer);
        formData.append('changed_by', payload.assigned_officer);
      }
      if (payload.assigned_officer_id) {
        formData.append('assigned_officer_id', payload.assigned_officer_id);
      }
      formData.append('role', 'officer');
      if (payload.resolution_photo_blob) {
        formData.append('resolution_photo', payload.resolution_photo_blob, 'resolution_proof.jpg');
      } else if (payload.resolution_photo_data_url) {
        try {
          const parts = payload.resolution_photo_data_url.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          formData.append('resolution_photo', blob, 'resolution_proof.jpg');
        } catch (err) {
          console.error('Failed to parse resolution photo data URL to Blob', err);
        }
      }
      if (payload.resolution_photo_data_url) {
        formData.append('resolution_photo_url', payload.resolution_photo_data_url);
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
      if (payload.materials_used) issue.materials_used = payload.materials_used;
      if (payload.assigned_department) issue.assigned_department = payload.assigned_department;
      if (payload.assigned_officer) issue.assigned_officer = payload.assigned_officer;
      if (payload.assigned_officer_id) issue.assigned_officer_id = payload.assigned_officer_id;

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
      } else if (payload.resolution_photo_data_url) {
        try {
          const parts = payload.resolution_photo_data_url.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          formData.append('resolution_photo', blob, 'resolution_proof.jpg');
        } catch (err) {
          console.error('Failed to parse resolution photo data URL to Blob', err);
        }
      }
      if (payload.resolution_photo_data_url) {
        formData.append('resolution_photo_url', payload.resolution_photo_data_url);
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

  // Server-side AI Image Analysis (no Gemini key exposed on client)
  analyzeImage: async (
    dataUrl: string
  ): Promise<{ title: string; category: IssueCategory; description: string; confidence: number } | null> => {
    try {
      const response = await apiClient.post('/reports/analyze-image/', {
        image: dataUrl,
      });
      if (response.data && response.data.success) {
        return {
          title: response.data.title || '',
          category: (response.data.category as IssueCategory) || 'other',
          description: response.data.description || '',
          confidence: typeof response.data.confidence === 'number' ? response.data.confidence : 0.8,
        };
      }
      return null;
    } catch (err) {
      console.warn('[AI Analysis] Backend image analysis request failed:', err);
      return null;
    }
  },
};

export const authApi = {
  // Send OTP with 60-second cooldown rate limit enforced by backend
  sendOtp: async (
    phone: string,
    role: string = 'citizen',
    mode?: 'signin' | 'signup'
  ): Promise<{ message: string; retry_after: number; account_exists?: boolean; user_name?: string; test_otp?: string; dev_otp?: string }> => {
    try {
      const response = await apiClient.post('/users/send-otp/', { phone, role, mode });
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error;
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retry_after || 60;
        throw new Error(errDetail || `Rate limit active. Please wait ${retryAfter}s before requesting a new OTP.`);
      }
      if (errDetail) {
        const customErr: any = new Error(errDetail);
        customErr.status = err.response?.status;
        customErr.account_exists = err.response?.data?.account_exists;
        throw customErr;
      }
      // Demo mock fallback if backend offline (network error)
      if (!err.response) {
        return { message: 'OTP dispatched successfully (Demo Code: 123456)', retry_after: 60, account_exists: true, test_otp: '123456', dev_otp: '123456' };
      }
      throw err;
    }
  },

  // Verify OTP and issue JWT + User Profile
  verifyOtp: async (payload: {
    phone: string;
    otp: string;
    password?: string;
    role?: string;
    name?: string;
    email?: string;
    ward?: string;
    ward_id?: string;
    ward_name?: string;
    department?: string;
    designation?: string;
    employee_id?: string;
    jurisdiction_zone?: string;
    mode?: 'signin' | 'signup';
  }): Promise<{ token: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/verify-otp/', payload);
      return {
        ...response.data,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error;
      if (errDetail) {
        const customErr: any = new Error(errDetail);
        customErr.status = err.response?.status;
        throw customErr;
      }
      // Demo mock fallback if backend offline (network error)
      if (!err.response && (payload.otp === '123456' || payload.otp.length === 6)) {
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

  // Update Profile Details (Name, Email, Ward, District, State)
  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await apiClient.post('/users/profile/', payload);
      const adapted = adaptUserProfile(response.data);
      localStorage.setItem('civic_user', JSON.stringify(adapted));
      return adapted;
    } catch (err: any) {
      // Demo mock fallback if backend is offline or network error
      const current = getCurrentStoredUser() || ({} as UserProfile);
      const updated: UserProfile = {
        ...current,
        ...payload,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));
      return updated;
    }
  },

  // Change Password / Passcode Protected by Mandatory Mobile OTP
  changePasswordWithOtp: async (payload: {
    phone: string;
    otp: string;
    new_password: string;
    user_id?: string;
  }): Promise<{ message: string; user?: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/change-password/', payload);
      if (response.data.user) {
        const adapted = adaptUserProfile(response.data.user);
        localStorage.setItem('civic_user', JSON.stringify(adapted));
        return { message: response.data.message || 'Password updated successfully.', user: adapted };
      }
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error;
      if (errDetail) {
        throw new Error(errDetail);
      }
      // Demo mock fallback if network error
      if (!err.response && (payload.otp === '123456' || payload.otp.length === 6)) {
        const current = getCurrentStoredUser();
        if (current) {
          current.credential_code = payload.new_password;
          localStorage.setItem('civic_user', JSON.stringify(current));
        }
        return { message: 'Password updated successfully (Local Session Authenticated).' };
      }
      throw new Error('Failed to update password. Please check your verification code.');
    }
  },

  // Login with Password / Passcode (Citizen & Staff)
  loginWithPassword: async (payload: {
    phone: string;
    password: string;
  }): Promise<{ token: string; user: UserProfile; message?: string }> => {
    try {
      const response = await apiClient.post('/users/login-password/', {
        identifier: payload.phone,
        password: payload.password,
      });
      const adapted = adaptUserProfile(response.data.user);
      localStorage.setItem('civic_auth_token', response.data.token);
      localStorage.setItem('civic_user', JSON.stringify(adapted));
      return {
        token: response.data.token,
        user: adapted,
        message: response.data.message,
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error;
      if (errDetail) {
        throw new Error(errDetail);
      }
      // Demo mock fallback if network error
      if (!err.response) {
        const stored = getCurrentStoredUser();
        if (stored && (stored.credential_code === payload.password || payload.password.length >= 4)) {
          const fakeToken = `jwt-token-${Date.now()}`;
          localStorage.setItem('civic_auth_token', fakeToken);
          return { token: fakeToken, user: stored, message: 'Welcome back (Local Session Authenticated).' };
        }
      }
      throw new Error('Incorrect credentials or server error. Please try again.');
    }
  },

  // Delete user account with mandatory OTP verification
  deleteAccountWithOtp: async (payload: {
    phone: string;
    otp: string;
    user_id?: string;
  }): Promise<{ message: string; success: boolean }> => {
    try {
      const response = await apiClient.post('/users/delete-account/', {
        phone: payload.phone,
        otp: payload.otp,
        user_id: payload.user_id,
      });
      // Clear local session storage upon verified deletion
      localStorage.removeItem('civic_auth_token');
      localStorage.removeItem('civic_user');
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error || err.message;
      throw new Error(errDetail || 'Failed to delete account. Please verify the code.');
    }
  },

  // Redeem municipal reward using spendable Civic Coins (Leaves Reputation Points untouched!)
  redeemReward: async (payload: {
    item_id: string;
    item_name: string;
    coins_cost: number;
    size?: string;
  }): Promise<{ message: string; order_id: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/redeem/', payload);
      const adapted = adaptUserProfile(response.data.user);
      localStorage.setItem('civic_user', JSON.stringify(adapted));
      return {
        message: response.data.message,
        order_id: response.data.order_id,
        user: adapted,
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.response?.data?.error || err.message;
      throw new Error(errDetail || 'Failed to process redemption.');
    }
  },
};

export const adminApi = {
  // Provision a Ward Admin (Super Admin only) or Field Officer (Ward Admin)
  provision: async (payload: AdminProvisionPayload): Promise<{ message: string; user: UserProfile; credentials: AdminCredentialsSlip }> => {
    try {
      const response = await apiClient.post('/users/admin/provision/', payload);
      const data = response.data;
      return {
        message: data.message,
        user: adaptUserProfile(data.admin || data.officer || data.user),
        credentials: data.credentials,
      };
    } catch (err: any) {
      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
      throw err;
    }
  },

  // Get Roster of Ward Admins or Field Officers
  getRoster: async (role: 'admin' | 'officer', ward_id?: string): Promise<UserProfile[]> => {
    try {
      const response = await apiClient.get('/users/admin/roster/', {
        params: { role, ward_id },
      });
      if (Array.isArray(response.data)) {
        return response.data.map(adaptUserProfile);
      }
      return [];
    } catch (err) {
      console.warn('Backend roster fetch fallback:', err);
      return [];
    }
  },

  // Quick Login using generated Employee Badge ID / Phone + Passcode
  quickLogin: async (identifier: string, passcode: string): Promise<{ message: string; token: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/admin/quick-login/', { identifier, passcode });
      return {
        message: response.data.message,
        token: response.data.token,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
      throw err;
    }
  },

  // Revoke credentials
  revoke: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/users/admin/revoke/', { user_id: userId });
    return response.data;
  },
};



export const volunteerApi = {
  // Citizen applies / registers as a civic youth volunteer
  apply: async (payload: VolunteerRegisterPayload): Promise<{ message: string; application_id: string; status: string; application: VolunteerApplication }> => {
    const response = await apiClient.post('/users/volunteers/register/', payload);
    return response.data;
  },

  // Citizen checks their verification status
  getStatus: async (params: { phone?: string; application_id?: string; user_id?: string }): Promise<{ application: VolunteerApplication; status: string }> => {
    const response = await apiClient.get('/users/volunteers/status/', { params });
    return response.data;
  },

  // Public directory of approved active volunteers
  listActive: async (scheme?: string): Promise<UserProfile[]> => {
    const response = await apiClient.get('/users/volunteers/', { params: { scheme } });
    if (Array.isArray(response.data)) {
      return response.data.map(adaptUserProfile);
    }
    return [];
  },

  // Admin: List incoming volunteer applications queue
  listAdminQueue: async (params?: { ward_id?: string; status?: string; scheme?: string }): Promise<{ count: number; pending_count: number; applications: VolunteerApplication[] }> => {
    const response = await apiClient.get('/users/admin/volunteers/', { params });
    return response.data;
  },

  // Admin: Review and approve or reject a volunteer application
  review: async (applicationId: string, action: 'approve' | 'reject', reviewNotes?: string): Promise<{ message: string; status: string; application: VolunteerApplication; user?: UserProfile }> => {
    const response = await apiClient.post(`/users/admin/volunteers/${applicationId}/review/`, {
      action,
      review_notes: reviewNotes,
    });
    return response.data;
  },
};


export interface WhatsAppGatewayStatus {
  gateway_online: boolean;
  connected: boolean;
  phone: string | null;
  status: string;
  has_qr: boolean;
  qr_image: string | null;
  qr_url: string;
  message?: string;
}

export const whatsappAdminApi = {
  getStatus: async (): Promise<WhatsAppGatewayStatus> => {
    const response = await apiClient.get('/users/admin/whatsapp/status/');
    return response.data;
  },

  resetSession: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/users/admin/whatsapp/reset/');
    return response.data;
  },

  sendTest: async (phone: string, otp?: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/users/admin/whatsapp/test/', { phone, otp });
    return response.data;
  },
};

export interface WardItem {
  id: string;
  ward_number?: string;
  name: string;
  zone?: string;
  counselor_name?: string;
  contact_phone?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export const wardsApi = {
  getAll: async (): Promise<WardItem[]> => {
    try {
      const response = await apiClient.get('/wards/');
      if (Array.isArray(response.data)) {
        return response.data.map((w: any) => ({
          id: w.ward_number || w.id,
          ward_number: w.ward_number || w.id,
          name: w.name ? `Ward ${w.ward_number?.replace('Ward-', '') || ''} - ${w.name}` : (w.ward_number || w.id),
          zone: w.zone || '',
          counselor_name: w.counselor_name || '',
          contact_phone: w.contact_phone || '',
          location: w.location,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  create: async (payload: {
    ward_number: string;
    name: string;
    zone: string;
    counselor_name?: string;
    contact_phone?: string;
    lat?: number;
    lng?: number;
  }): Promise<any> => {
    const response = await apiClient.post('/wards/', payload);
    return response.data;
  },
};

export interface LeaderboardEntry {
  rank: number;
  id?: string;
  name: string;
  role: string;
  volunteer_scheme?: string;
  points: number;
  coins?: number;
  badge: string;
  ward_id?: string;
  ward_name?: string;
  ward?: string;
  district?: string;
  state?: string;
  phone_masked?: string;
  reports_resolved_count?: number;
  reports_submitted_count?: number;
  designation?: string;
  department?: string;
  employee_id?: string;
  credential_code?: string;
  jurisdiction_zone?: string;
}

export const gamificationApi = {
  getLeaderboard: async (params?: {
    role?: string;
    ward_id?: string;
    district?: string;
    state?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    try {
      const response = await apiClient.get('/gamification/leaderboard/', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('Failed to fetch gamification leaderboard:', err);
      return [];
    }
  },
  getUserSummary: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/gamification/summary/${userId}/`);
    return response.data;
  },
};

export interface SuperAdminUserStats {
  total: number;
  admins_count: number;
  officers_count: number;
  citizens_count: number;
  blocked_count: number;
  wards_count?: number;
}

export const superAdminUsersApi = {
  listUsers: async (params?: {
    role?: string;
    ward_id?: string;
    search?: string;
    is_blocked?: boolean;
  }): Promise<{ users: UserProfile[]; stats: SuperAdminUserStats }> => {
    try {
      const response = await apiClient.get('/users/admin/users/', { params });
      return {
        users: (response.data?.users || []).map(adaptUserProfile),
        stats: response.data?.stats || {
          total: 0,
          admins_count: 0,
          officers_count: 0,
          citizens_count: 0,
          blocked_count: 0,
        },
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to list users.');
    }
  },

  createUser: async (payload: {
    role: string;
    name: string;
    phone: string;
    email?: string;
    ward_id?: string;
    ward_name?: string;
    department?: string;
    designation?: string;
    assigned_tasks?: string[];
    credential_code?: string;
    employee_id?: string;
  }): Promise<{ message: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post('/users/admin/users/', payload);
      return {
        message: response.data.message,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to create user account.');
    }
  },

  updateUser: async (userId: string, payload: Partial<UserProfile>): Promise<{ message: string; user: UserProfile }> => {
    try {
      const response = await apiClient.put(`/users/admin/users/${userId}/`, payload);
      return {
        message: response.data.message,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to update user profile.');
    }
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to remove user account.');
    }
  },

  blockUser: async (userId: string, reason: string): Promise<{ message: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/block/`, {
        action: 'block',
        reason,
      });
      return {
        message: response.data.message,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to suspend account.');
    }
  },

  unblockUser: async (userId: string): Promise<{ message: string; user: UserProfile }> => {
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/block/`, {
        action: 'unblock',
      });
      return {
        message: response.data.message,
        user: adaptUserProfile(response.data.user),
      };
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to reinstate account.');
    }
  },
};

export interface DeletionRequest {
  request_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_role: string;
  ward_id?: string;
  ward_name?: string;
  department?: string;
  designation?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  target_approver_role: string;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  reviewed_by_name?: string | null;
  review_notes?: string;
}

export const deletionRequestsApi = {
  submitRequest: async (reason: string): Promise<{ message: string; request: DeletionRequest }> => {
    try {
      const response = await apiClient.post('/users/deletion-request/', { reason });
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to submit deletion request.');
    }
  },

  listRequests: async (): Promise<DeletionRequest[]> => {
    try {
      const response = await apiClient.get('/users/deletion-requests/');
      return response.data.requests || [];
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to fetch deletion requests.');
    }
  },

  reviewRequest: async (
    requestId: string,
    action: 'approve' | 'reject',
    reviewNotes?: string
  ): Promise<{ message: string; status: 'approved' | 'rejected'; request_id: string }> => {
    try {
      const response = await apiClient.post(`/users/deletion-requests/${requestId}/review/`, {
        action,
        review_notes: reviewNotes,
      });
      return response.data;
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message;
      throw new Error(errDetail || 'Failed to process deletion request review.');
    }
  },
};

export const notificationsApi = {
  getAll: async (params?: { unread_only?: boolean; limit?: number }): Promise<{ results: NotificationItem[]; unread_count: number }> => {
    try {
      const response = await apiClient.get('/notifications/', { params });
      return response.data;
    } catch {
      return { results: [], unread_count: 0 };
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/notifications/unread-count/');
      return response.data?.unread_count ?? 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read/`);
      return response.data?.success ?? true;
    } catch {
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    try {
      const response = await apiClient.post('/notifications/mark-all-read/');
      return response.data?.success ?? true;
    } catch {
      return false;
    }
  },
};
