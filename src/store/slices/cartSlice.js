// src/store/slices/cartSlice.js
import { create } from "zustand";
import api from "@/services/api";

const getCourseId = (course) => course?._id ?? course?.id ?? course?.course_id ?? null;

/** Normalize any ID to string for type-safe comparison (avoids "5" !== 5 false negatives). */
const toIdStr = (id) => (id == null ? "" : String(id));

const normalizeCartItems = (items = []) =>
  items.map((c) => ({
    // Ensure CartPage/CheckoutPage can keep using existing field names
    _id: c._id ?? c.id ?? c.course_id,
    id: c._id ?? c.id ?? c.course_id,
    title: c.title,
    subtitle: c.subtitle,
    image: c.image ?? c.thumbnail ?? c.thumbnail_url,
    thumbnail: c.thumbnail ?? c.thumbnail_url ?? c.image,
    thumbnail_url: c.thumbnail_url ?? c.thumbnail ?? c.image,
    // Parse price as float to prevent string concatenation in reduce()
    price: parseFloat(c.price ?? 0) || 0,
    originalPrice: c.originalPrice ?? c.original_price ?? null,
    // Widen duration fallback chain to cover all known API keys
    duration: Number(c.duration ?? c.total_duration ?? c.course_duration ?? 0),
    level: c.level,
    // Widen students fallback chain to cover all known API keys
    students: c.students ?? c.total_students ?? c.enrollment_count ?? c.enrollments ?? 0,
    instructor: c.instructor,
  }));

const useCartStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  items: [],
  coupon: null,
  discount: 0,
  isLoading: false,

  // ─── Computed selectors ──────────────────────────────────
  // NOTE: Zustand does NOT support native JS getter syntax inside create().
  // These are plain selector functions — call them as store.getSubtotal() etc.
  getSubtotal: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  },
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    return Math.max(0, subtotal - discount);
  },

  // ─── Server-backed cart ───────────────────────────────────
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      // Prefer the existing richer endpoint (includes instructor/level/etc).
      // Fallback to /student/cart.php if you want the minimal payload.
      const { data: res } = await api.get(`/cart/index.php`);
      const items = normalizeCartItems(res.data?.items ?? []);
      set({ items, isLoading: false });
      return { success: true, items };
    } catch (err) {
      // If not authenticated, just keep the cart empty (server is source of truth)
      set({ items: [], isLoading: false, coupon: null, discount: 0 });
      return { success: false, error: err?.response?.data?.message ?? "Failed to fetch cart." };
    }
  },

  addItem: async (course) => {
    const courseId = getCourseId(course);
    if (!courseId) return { success: false, error: "Invalid course." };

    // Optimistic local add (snappy UI), then reconcile with server
    if (!get().items.some((i) => getCourseId(i) === courseId)) {
      set((s) => ({ items: [...s.items, normalizeCartItems([course])[0]] }));
    }

    try {
      await api.post(`/cart/index.php`, { course_id: courseId });
      // Refresh to get canonical shape (and any server-side filtering)
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      // Rollback optimistic add
      set((s) => ({ items: s.items.filter((i) => getCourseId(i) !== courseId) }));
      return { success: false, error: err?.response?.data?.message ?? "Failed to add to cart." };
    }
  },

  removeItem: async (courseId) => {
    const id = Number(courseId);
    if (!id) return { success: false, error: "Invalid course_id." };

    const prev = get().items;
    set((s) => ({ items: s.items.filter((i) => getCourseId(i) !== id) }));

    try {
      await api.delete(`/cart/index.php`, { params: { course_id: id } });
      return { success: true };
    } catch (err) {
      // Rollback
      set({ items: prev });
      return { success: false, error: err?.response?.data?.message ?? "Failed to remove from cart." };
    }
  },

  clearCart: async () => {
    const prev = get().items;
    set({ items: [], coupon: null, discount: 0 });
    try {
      // action=clear must be in the URL query string, not axios params object
      await api.delete(`/cart/index.php?action=clear`);
      return { success: true };
    } catch (err) {
      set({ items: prev });
      return { success: false, error: err?.response?.data?.message ?? "Failed to clear cart." };
    }
  },


  /**
   * Check if a course is in the cart.
   * Accepts a raw ID (number or string) or a course object.
   * Uses string comparison to safely handle mixed number/string IDs from the API.
   */
  isInCart: (courseIdOrCourse) => {
    const rawId = typeof courseIdOrCourse === "object" && courseIdOrCourse !== null
      ? getCourseId(courseIdOrCourse)
      : courseIdOrCourse;
    if (rawId == null) return false;
    const needle = toIdStr(rawId);
    return get().items.some((i) => toIdStr(getCourseId(i)) === needle);
  },

  // ─── Coupon (server-backed) ───────────────────────────────
  applyCoupon: async (code) => {
    set({ isLoading: true });
    try {
      const { data: res } = await api.post(`/cart/index.php?action=apply_coupon`, {
        code: String(code || "").trim(),
      });

      const couponData = {
        code: res.data.code,
        discount: Number(res.data.discount ?? 0),
      };
      set({ coupon: couponData, discount: couponData.discount, isLoading: false });
      return { success: true, coupon: couponData };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err?.response?.data?.message ?? "Invalid coupon." };
    }
  },

  removeCoupon: () => set({ coupon: null, discount: 0 }),
}));

export default useCartStore;