import { create } from "zustand";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

let _pollingInterval = null;

const useNotificationsStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  notifications: [],
  unreadCount:   0,
  isLoading:     false,
  isPolling:     false,

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

  startPolling: () => {
    if (_pollingInterval) return; // already polling
    const { fetchNotifications } = get();
    fetchNotifications(); // immediate fetch
    _pollingInterval = setInterval(fetchNotifications, 5_000);
    set({ isPolling: true });
  },

  stopPolling: () => {
    if (_pollingInterval) {
      clearInterval(_pollingInterval);
      _pollingInterval = null;
    }
    set({ isPolling: false });
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), { id });
    } catch { /* silent */ }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));
    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { all: true });
    } catch { /* silent */ }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount:   state.unreadCount + 1,
    })),
}));

export default useNotificationsStore;