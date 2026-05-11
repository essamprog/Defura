import { useEffect, useCallback } from "react";
import { useNotificationsStore } from "@/store";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  } = useNotificationsStore();

  // Load on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ── Actions wired to PHP API ────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id) => {
    // Optimistic update
    markAsRead(id);
    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), { id });
    } catch {
      // Revert is handled by re-fetching if needed
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    markAllAsRead();
    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { all: true });
    } catch {
      // Silent — state already updated optimistically
    }
  }, [markAllAsRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead:    handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    addNotification,
    refresh:       fetchNotifications,
  };
};

export default useNotifications;