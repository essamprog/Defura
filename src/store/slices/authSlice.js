// src/store/slices/authSlice.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      // ── Actions ──────────────────────────────────────────────────────────

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
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading:       false,
            error:           null,
          });

          // Sync server-side cart after login
          try {
            const { default: useCartStore } = await import("./cartSlice");
            useCartStore.getState().fetchCart();
          } catch { /* non-critical */ }

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
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading:       false,
            error:           null,
          });

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
          set({
            user:            null,
            accessToken:     null,
            refreshToken:    null,
            isAuthenticated: false,
            error:           null,
          });
        }
      },

      fetchMe: async () => {
        try {
          const { data: res } = await api.get(ENDPOINTS.AUTH.ME);
          set({ user: res.data.user });
        } catch {
          // Token is invalid — force logout
          get().logout();
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
      // so api.js interceptor can read them directly
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("accessToken",  state.accessToken);
        }
        if (state?.refreshToken) {
          localStorage.setItem("refreshToken", state.refreshToken);
        }
      },
    }
  )
);

export default useAuthStore;