import { create } from "zustand";
import coursesService from "@/features/courses/services/coursesService";

const useCoursesStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────
  courses:    [],
  featured:   [],
  categories: [],
  isLoading:  false,
  error:      null,

  // ─── Actions ──────────────────────────────────────────────
  fetchCourses: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await coursesService.getAll(params);
      set({ courses: data.courses, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message ?? "Failed to load courses.", isLoading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await coursesService.getFeatured();
      set({ featured: data.courses });
    } catch (_) {}
  },

  fetchCategories: async () => {
    try {
      const { data } = await coursesService.getCategories();
      set({ categories: data.categories });
    } catch (_) {}
  },

  clearError: () => set({ error: null }),
}));

export default useCoursesStore;