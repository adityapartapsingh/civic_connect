import { create } from 'zustand';
import { NotificationItem } from '../types';
import { notificationsApi } from '../services/api';

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => {
    const next = !get().isOpen;
    set({ isOpen: next });
    if (next) {
      get().fetchNotifications();
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationsApi.getAll();
      set({
        notifications: data.results || [],
        unreadCount: data.unread_count ?? 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    await notificationsApi.markAsRead(id);
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
    await notificationsApi.markAllAsRead();
  },
}));
