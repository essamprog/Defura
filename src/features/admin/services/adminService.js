import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const adminService = {

  getDashboard: () =>
    api.get(ENDPOINTS.ADMIN.DASHBOARD),

  // ── Users ────────────────────────────────────────────────────────────────
  getUsers: (params = {}) =>
    api.get(ENDPOINTS.ADMIN.USERS, { params }),

  updateUser: (id, data) =>
    api.put(ENDPOINTS.ADMIN.USER_DETAIL(id), data),

  deleteUser: (id) =>
    api.delete(ENDPOINTS.ADMIN.USER_DETAIL(id)),

  // ── Courses ──────────────────────────────────────────────────────────────
  getCourses: (params = {}) =>
    api.get(ENDPOINTS.ADMIN.COURSES, { params }),

  approveCourse: (id) =>
    api.patch(ENDPOINTS.ADMIN.COURSE_DETAIL(id), { action: "approve" }),

  rejectCourse: (id) =>
    api.patch(ENDPOINTS.ADMIN.COURSE_DETAIL(id), { action: "reject" }),

  deleteCourse: (id) =>
    api.delete(ENDPOINTS.ADMIN.COURSE_DETAIL(id)),

  // ── Orders ───────────────────────────────────────────────────────────────
  getOrders: (params = {}) =>
    api.get(ENDPOINTS.ADMIN.ORDERS, { params }),

  refundOrder: (id) =>
    api.patch(ENDPOINTS.ADMIN.ORDER_DETAIL(id)),

  // ── Categories ───────────────────────────────────────────────────────────
  getCategories: () =>
    api.get(ENDPOINTS.ADMIN.CATEGORIES),

  createCategory: (data) =>
    api.post(ENDPOINTS.ADMIN.CATEGORIES, data),

  updateCategory: (id, data) =>
    api.put(ENDPOINTS.ADMIN.CATEGORY_DETAIL(id), data),

  deleteCategory: (id) =>
    api.delete(ENDPOINTS.ADMIN.CATEGORY_DETAIL(id)),

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings: () =>
    api.get(ENDPOINTS.ADMIN.SETTINGS),

  updateSettings: (data) =>
    api.put(ENDPOINTS.ADMIN.SETTINGS, data),
};

export default adminService;