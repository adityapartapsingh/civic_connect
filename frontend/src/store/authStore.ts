import { create } from 'zustand';
import { UserProfile } from '../types';
import { useToastStore } from './toastStore';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  role: 'citizen' | 'volunteer' | 'officer' | 'admin' | 'super_admin';
  isOfficer: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: 'citizen' | 'volunteer' | 'officer' | 'admin' | 'super_admin') => void;
  toggleRole: () => void;
  addPoints: (points: number, reason: string) => void;
  addReward: (points: number, coins: number, reason: string) => void;
  deductPoints: (points: number, reason: string) => boolean;
  deductCoins: (coins: number, reason: string) => boolean;
  applyFraudPenalty: (pointsPenalty: number, coinsPenalty: number, reason: string) => void;
  logout: () => void;
}

const savedUserStr = localStorage.getItem('civic_user');
const savedToken = localStorage.getItem('civic_auth_token');
let initialUser: UserProfile | null = null;
if (savedUserStr && savedToken) {
  try {
    initialUser = JSON.parse(savedUserStr);
    if (initialUser && !initialUser.badges) {
      initialUser.badges = [];
    }
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
  isOfficer: initialUser?.role === 'officer' || initialUser?.role === 'admin' || initialUser?.role === 'super_admin',
  isAdmin: initialUser?.role === 'admin' || initialUser?.role === 'super_admin',
  isSuperAdmin: initialUser?.role === 'super_admin',
  isAuthenticated: Boolean(initialUser && savedToken),
  isGuest: !initialUser,

  login: (token: string, user: UserProfile) => {
    localStorage.setItem('civic_auth_token', token);
    localStorage.setItem('civic_user', JSON.stringify(user));
    set({
      token,
      user,
      role: user.role,
      isOfficer: user.role === 'officer' || user.role === 'admin' || user.role === 'super_admin',
      isAdmin: user.role === 'admin' || user.role === 'super_admin',
      isSuperAdmin: user.role === 'super_admin',
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
      isOfficer: user?.role === 'officer' || user?.role === 'admin' || user?.role === 'super_admin',
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      isSuperAdmin: user?.role === 'super_admin',
      isAuthenticated: Boolean(user && get().token),
      isGuest: !user,
    });
  },

  setRole: (role) => {
    set((state) => {
      const isOfficer = role === 'officer' || role === 'admin' || role === 'super_admin';
      const isAdmin = role === 'admin' || role === 'super_admin';
      const isSuperAdmin = role === 'super_admin';
      const updatedUser = state.user
        ? {
            ...state.user,
            role,
            department: isOfficer ? (state.user.department || 'Roads & Infrastructure Ward 2') : undefined,
          }
        : null;
      if (updatedUser) {
        localStorage.setItem('civic_user', JSON.stringify(updatedUser));
      }
      return { role, isOfficer, isAdmin, isSuperAdmin, user: updatedUser };
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
      const curCoins = state.user.coins ?? state.user.points ?? 0;
      const newCoins = curCoins + points;
      const newLevel = Math.floor(newPoints / 60) + 1;

      useToastStore.getState().addToast({
        type: 'points',
        title: `+${points} Points & +${points} Coins!`,
        message: reason,
        points,
      });

      const updated = {
        ...state.user,
        points: newPoints,
        coins: newCoins,
        level: newLevel,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));

      return {
        user: updated,
      };
    });
  },

  addReward: (points, coins, reason) => {
    set((state) => {
      if (!state.user) return state;
      const newPoints = state.user.points + points;
      const curCoins = state.user.coins ?? state.user.points ?? 0;
      const newCoins = curCoins + coins;
      const newLevel = Math.floor(newPoints / 60) + 1;

      useToastStore.getState().addToast({
        type: 'points',
        title: `+${points} Points & +${coins} Coins!`,
        message: reason,
        points,
      });

      const updated = {
        ...state.user,
        points: newPoints,
        coins: newCoins,
        level: newLevel,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));

      return {
        user: updated,
      };
    });
  },

  deductCoins: (coins, reason) => {
    const user = get().user;
    const currentCoins = user?.coins ?? user?.points ?? 0;
    if (currentCoins < coins) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Insufficient Civic Coins',
        message: `You have ${currentCoins} coins, but this reward requires ${coins} coins.`,
      });
      return false;
    }

    set((state) => {
      if (!state.user) return state;
      const userCoins = state.user.coins ?? state.user.points ?? 0;
      const newCoins = Math.max(0, userCoins - coins);
      // CRITICAL RULE: state.user.points and level are NOT reduced when buying rewards!
      const updated: UserProfile = {
        ...state.user,
        coins: newCoins,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));
      return { user: updated };
    });

    useToastStore.getState().addToast({
      type: 'success',
      title: `-${coins} Coins Redeemed!`,
      message: `${reason}. Your Civic Reputation Points remain 100% intact!`,
    });
    return true;
  },

  applyFraudPenalty: (pointsPenalty, coinsPenalty, reason) => {
    set((state) => {
      if (!state.user) return state;
      const currentPts = state.user.points ?? 0;
      const currentCoins = state.user.coins ?? currentPts;
      const newPoints = Math.max(0, currentPts - pointsPenalty);
      const newCoins = Math.max(0, currentCoins - coinsPenalty);
      const newLevel = Math.max(1, Math.floor(newPoints / 60) + 1);

      const updated: UserProfile = {
        ...state.user,
        points: newPoints,
        coins: newCoins,
        level: newLevel,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));

      useToastStore.getState().addToast({
        type: 'error',
        title: 'Civic Penalty Applied',
        message: `${reason} (-${pointsPenalty} Points, -${coinsPenalty} Coins).`,
      });

      return { user: updated };
    });
  },

  deductPoints: (points, reason) => {
    const currentPoints = get().user?.points ?? 0;
    if (currentPoints < points) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Insufficient Points',
        message: `You have ${currentPoints} points, but this reward requires ${points} points.`,
      });
      return false;
    }

    set((state) => {
      if (!state.user) return state;
      const newPoints = state.user.points - points;
      const updated: UserProfile = {
        ...state.user,
        points: newPoints,
      };
      localStorage.setItem('civic_user', JSON.stringify(updated));
      return { user: updated };
    });

    useToastStore.getState().addToast({
      type: 'points',
      title: `-${points} Points Redeemed!`,
      message: reason,
      points: -points,
    });
    return true;
  },

  logout: () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
    set({
      user: null,
      token: null,
      role: 'citizen',
      isOfficer: false,
      isAdmin: false,
      isSuperAdmin: false,
      isAuthenticated: false,
      isGuest: true,
    });
  },
}));
