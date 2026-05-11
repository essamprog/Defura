import { create } from "zustand";

const useUIStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  sidebarOpen: false,
  mobileSidebarOpen: false,
  theme: "light",
  toasts: [],

  // ─── Sidebar ─────────────────────────────────────────────
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (value) => set({ sidebarOpen: value }),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  // ─── Theme ───────────────────────────────────────────────
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),

  // ─── Toasts ──────────────────────────────────────────────
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));
    setTimeout(() => get().removeToast(id), toast.duration || 4000);
    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Shorthand helpers
  showSuccess: (message) =>
    get().addToast({ type: "success", message }),

  showError: (message) =>
    get().addToast({ type: "error", message, duration: 5000 }),

  showInfo: (message) =>
    get().addToast({ type: "info", message }),
}));

export default useUIStore;