import { create } from "zustand";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const useNotificationsStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  notifications: [],
  unreadCount:   0,
  isLoading:     false,

  // ── Actions ────────────────────────────────────────────────────────────────

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data: res } = await api.get(ENDPOINTS.NOTIFICATIONS.BASE);
      set({
        notifications: res.data.notifications ?? [],
        unreadCount:   res.data.unreadCount   ?? 0,
        isLoading:     false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    // Optimistic local update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), { id });
    } catch {
      // Could revert here if needed
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));

    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { all: true });
    } catch {
      // Silent fail — optimistic update already applied
    }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount:   state.unreadCount + 1,
    })),
}));

export default useNotificationsStore;