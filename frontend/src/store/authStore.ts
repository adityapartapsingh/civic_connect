import { create } from 'zustand';
import { UserProfile } from '../types';
import { useToastStore } from './toastStore';

const INITIAL_USER: UserProfile = {
  id: 'usr_c19284',
  name: 'Priya Sharma',
  phone: '+91 98765 43210',
  email: 'priya.sharma@example.com',
  role: 'citizen',
  points: 180,
  level: 3,
  reports_submitted_count: 5,
  reports_resolved_count: 4,
  upvotes_given_count: 14,
  badges: [
    {
      id: 'first_report',
      name: 'Civic Scout',
      description: 'Submitted your first verified civic issue',
      icon: 'Eye',
      is_unlocked: true,
      points_reward: 20,
      unlocked_at: '2026-09-12T10:30:00Z',
    },
    {
      id: 'pothole_patrol',
      name: 'Pothole Patrol',
      description: 'Reported 3 road or pothole safety hazards',
      icon: 'ShieldCheck',
      is_unlocked: true,
      points_reward: 50,
      unlocked_at: '2026-09-28T14:15:00Z',
    },
    {
      id: 'fix_verifier',
      name: 'Resolution Guardian',
      description: 'Verified a completed resolution on-site',
      icon: 'CheckCircle2',
      is_unlocked: true,
      points_reward: 30,
      unlocked_at: '2026-10-02T16:00:00Z',
    },
    {
      id: 'community_champion',
      name: 'Ward Champion',
      description: 'Reached Top 5 citizens in your municipal ward',
      icon: 'Trophy',
      is_unlocked: false,
      points_reward: 100,
    },
    {
      id: 'video_sleuth',
      name: 'Video Sleuth',
      description: 'Recorded a 3-second pan video for critical evidence',
      icon: 'Video',
      is_unlocked: true,
      points_reward: 40,
      unlocked_at: '2026-10-10T11:20:00Z',
    },
  ],
};

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  role: 'citizen' | 'officer' | 'admin';
  isOfficer: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: 'citizen' | 'officer' | 'admin') => void;
  toggleRole: () => void;
  addPoints: (points: number, reason: string) => void;
  logout: () => void;
}

const savedUserStr = localStorage.getItem('civic_user');
const savedToken = localStorage.getItem('civic_auth_token');
let initialUser: UserProfile | null = null;
if (savedUserStr && savedToken) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch {
    initialUser = null;
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_auth_token');
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: savedToken || null,
  role: initialUser ? initialUser.role : 'citizen',
  isOfficer: initialUser?.role === 'officer' || initialUser?.role === 'admin',
  isAuthenticated: Boolean(initialUser && savedToken),
  isGuest: !initialUser,

  login: (token: string, user: UserProfile) => {
    localStorage.setItem('civic_auth_token', token);
    localStorage.setItem('civic_user', JSON.stringify(user));
    set({
      token,
      user,
      role: user.role,
      isOfficer: user.role === 'officer' || user.role === 'admin',
      isAuthenticated: true,
      isGuest: false,
    });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('civic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civic_user');
    }
    set({
      user,
      role: user ? user.role : 'citizen',
      isOfficer: user?.role === 'officer' || user?.role === 'admin',
      isAuthenticated: Boolean(user && get().token),
      isGuest: !user,
    });
  },

  setRole: (role) => {
    set((state) => {
      const isOfficer = role === 'officer' || role === 'admin';
      const updatedUser = state.user
        ? {
            ...state.user,
            role,
            department: isOfficer ? 'Roads & Infrastructure Ward 18' : undefined,
          }
        : null;
      if (updatedUser) {
        localStorage.setItem('civic_user', JSON.stringify(updatedUser));
      }
      return { role, isOfficer, user: updatedUser };
    });
  },

  toggleRole: () => {
    const current = get().role;
    const nextRole = current === 'officer' ? 'citizen' : 'officer';
    get().setRole(nextRole);
    useToastStore.getState().addToast({
      type: 'info',
      title: `Switched View: ${nextRole === 'officer' ? 'Field Officer Portal' : 'Citizen App'}`,
      message: `Now viewing as ${nextRole === 'officer' ? 'Municipal Field Officer' : 'Local Citizen'}.`,
    });
  },

  addPoints: (points, reason) => {
    set((state) => {
      if (!state.user) return state;
      const newPoints = state.user.points + points;
      const newLevel = Math.floor(newPoints / 60) + 1;

      useToastStore.getState().addToast({
        type: 'points',
        title: `+${points} Civic Points!`,
        message: reason,
        points,
      });

      const updated = {
        ...state.user,
        points: newPoints,
        level: newLevel,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));

      return {
        user: updated,
      };
    });
  },

  logout: () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
    set({
      user: null,
      token: null,
      role: 'citizen',
      isOfficer: false,
      isAuthenticated: false,
      isGuest: true,
    });
  },
}));
