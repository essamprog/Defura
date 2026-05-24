// src/store/slices/authSlice.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

/**
 * Backend returns `_id` for the user ID. Add `id` as an alias so that
 * any code using user?.id (e.g. CheckoutPage, LearningPage) works correctly.
 */
const normalizeUser = (user) => {
  if (!user) return null;
  const id = user._id ?? user.id ?? null;
  return { ...user, _id: id, id };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      isHydrated:      false,   // becomes true once persist rehydration is done
      isLoading:       false,
      error:           null,
      enrolledCourseIds: [], // array of course IDs the student is enrolled in

      // ── Actions ──────────────────────────────────────────────────────────

      // Internal: called by onRehydrateStorage to avoid circular reference
      _setHydrated: () => set({ isHydrated: true }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await api.post(
            ENDPOINTS.AUTH.LOGIN,
            credentials
          );

          // PHP backend wraps payload in data.data
          const { user, accessToken, refreshToken } = res.data;

          localStorage.setItem("accessToken",  accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          set({
            user: normalizeUser(user),
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isHydrated:      true,
            isLoading:       false,
            error:           null,
          });

          // Sync server-side cart after login
          try {
            const { default: useCartStore } = await import("./cartSlice");
            useCartStore.getState().fetchCart();
          } catch { /* non-critical */ }

          // Fetch enrolled course IDs
          get().fetchEnrollments();

          return { success: true, user };
        } catch (err) {
          const message =
            err.response?.data?.message ?? "Login failed. Please try again.";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await api.post(
            ENDPOINTS.AUTH.REGISTER,
            userData
          );

          const { user, accessToken, refreshToken } = res.data;

          localStorage.setItem("accessToken",  accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          set({
            user: normalizeUser(user),
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isHydrated:      true,
            isLoading:       false,
            error:           null,
          });

          // Fetch enrolled course IDs
          get().fetchEnrollments();

          return { success: true, user };
        } catch (err) {
          const message =
            err.response?.data?.message ?? "Registration failed.";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          // Tell the server to invalidate the token
          await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
        } catch {
          // Fail silently — always clear local state
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("auth-storage");
          set({
            user:            null,
            accessToken:     null,
            refreshToken:    null,
            isAuthenticated: false,
            enrolledCourseIds: [],
            error:           null,
          });
        }
      },

      fetchMe: async () => {
        try {
          const { data: res } = await api.get(ENDPOINTS.AUTH.ME);
          set({ user: normalizeUser(res.data.user) });
        } catch {
          // Token is invalid — force logout
          get().logout();
        }
      },

      fetchEnrollments: async () => {
        if (!get().isAuthenticated) return;
        try {
          const { data: res } = await api.get(ENDPOINTS.STUDENT.ENROLLED, {
            params: { per_page: 100 }
          });
          const courses = res.data ?? [];
          const enrolledCourseIds = courses.map((c) => c._id ?? c.id);
          set({ enrolledCourseIds });
        } catch {
          // Silent fallback
        }
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      // Only persist these fields to localStorage
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // After rehydration (page refresh), sync tokens to standalone localStorage keys
      // so api.js interceptor can read them directly, and mark hydration as done.
      // We call state._setHydrated() instead of useAuthStore.setState() to avoid
      // a circular reference (useAuthStore is not assigned yet when persist runs).
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("accessToken",  state.accessToken);
        }
        if (state?.refreshToken) {
          localStorage.setItem("refreshToken", state.refreshToken);
        }
        // Normalize user so both id and _id are always present (handles old sessions)
        if (state?.user) {
          state.user = normalizeUser(state.user);
        }
        // Safe way to mark hydration complete
        state?._setHydrated?.();
      },
    }
  )
);

export default useAuthStore;