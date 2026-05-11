// src/services/endpoints.js
// All paths are relative to VITE_API_BASE_URL
// e.g. http://localhost/EDUManage/backend/api

export const ENDPOINTS = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login.php',
    REGISTER: '/auth/register.php',
    LOGOUT: '/auth/logout.php',
    REFRESH_TOKEN: '/auth/refresh.php',
    ME: '/auth/me.php',
    FORGOT_PASSWORD: '/auth/forgot_password.php',
    RESET_PASSWORD: '/auth/reset_password.php',
  },

  // ── Public Courses ───────────────────────────────────────────────────────────
  COURSES: {
    // Legacy (old bootstrap system)
    BASE: '/courses/index.php',
    DETAIL: (id) => `/courses/detail.php?id=${id}`,
    ENROLL: (id) => `/courses/enroll.php?id=${id}`,
    CATEGORIES: '/courses/index.php?categories=1',
    // ✅ Phase 4 — Marketplace (db.php system)
    MARKETPLACE: '/student/get_marketplace.php',
    PUBLIC_DETAIL: (id) => `/student/get_course_details.php?id=${id}`,
  },

  // ── Student ──────────────────────────────────────────────────────────────────
  STUDENT: {
    // ✅ All now on System A (bootstrap.php + AuthMiddleware)
    DASHBOARD:        '/student/dashboard.php',           // legacy System A — keep
    ENROLLED:         '/student/get_my_enrollments.php',  // migrated
    PROGRESS:         '/student/update_progress.php',     // migrated
    COMPLETE_LESSON:  '/student/update_progress.php',     // migrated
    MY_ENROLLMENTS:   '/student/get_my_enrollments.php',
    UPDATE_PROGRESS:  '/student/update_progress.php',
    LESSON_VIDEO:     '/student/get_lesson_video.php',
    CHECKOUT:         '/student/checkout.php',
  },

  // ── User / Profile ───────────────────────────────────────────────────────────
  USER: {
    PROFILE: '/auth/me.php',
    UPDATE_PROFILE: '/auth/me.php',
    CHANGE_PASSWORD: '/auth/me.php',
    AVATAR: '/users/avatar.php',
    CERTIFICATES: '/student/dashboard.php',
    ENROLLED_COURSES: '/student/enrolled.php',
  },

  // ── Instructor ───────────────────────────────────────────────────────────────
  INSTRUCTOR: {
    // ✅ All now on System A (bootstrap.php + AuthMiddleware)
    DASHBOARD:      '/instructor/dashboard.php',           // legacy System A — keep
    COURSES:        '/instructor/get_my_courses.php',      // migrated
    COURSE_DETAIL:  (id) => `/instructor/get_curriculum.php?course_id=${id}`,
    CREATE_COURSE:  '/instructor/create_course.php',
    UPDATE_COURSE:  (id) => `/instructor/update_course.php`,
    DELETE_COURSE:  (id) => `/instructor/delete_course.php`,
    STUDENTS:       '/instructor/students.php',            // System A already
    REVENUE:        '/instructor/financials.php',          // System A already
    FINANCIALS:     '/instructor/financials.php',          // System A already
    LESSONS:        '/instructor/save_lesson.php',         // migrated
    UPLOAD_VIDEO:   '/instructor/upload_media.php',        // migrated
    UPLOAD_IMAGE:   '/instructor/upload_media.php',        // migrated
    // Phase 1-3 Curriculum
    MY_COURSES:     '/instructor/get_my_courses.php',
    CURRICULUM:     '/instructor/get_curriculum.php',
    SAVE_SECTION:   '/instructor/save_section.php',
    SAVE_LESSON:    '/instructor/save_lesson.php',
    UPDATE_ORDER:   '/instructor/update_order.php',
    DELETE_ITEM:    '/instructor/delete_item.php',
    UPLOAD_MEDIA:   '/instructor/upload_media.php',
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD: '/admin/dashboard.php',
    USERS: '/admin/users.php',
    USER_DETAIL: (id) => `/admin/users.php?id=${id}`,
    COURSES: '/admin/courses.php',
    COURSE_DETAIL: (id) => `/admin/courses.php?id=${id}`,
    APPROVE_COURSE: '/admin/approve_course.php',
    ORDERS: '/admin/orders.php',
    ORDER_DETAIL: (id) => `/admin/orders.php?id=${id}`,
    CATEGORIES: '/admin/categories.php',
    CATEGORY_DETAIL: (id) => `/admin/categories.php?id=${id}`,
    SETTINGS: '/admin/settings.php',
    AUDIT_LOGS: '/admin/get_audit_logs.php',
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    BASE: '/notifications/index.php',
    LIST: '/notifications/index.php',
    MARK_READ: (id) => `/notifications/index.php`,
    MARK_ALL_READ: '/notifications/index.php',
  },

  // ── Cart & Orders ────────────────────────────────────────────────────────────
  // NOTE: There is no dedicated cart API in the backend yet.
  // These point to placeholder endpoints — build a cart API or
  // use the orders/enroll flow directly.
  CART: {
    BASE:         '/cart/index.php',
    ADD:          '/cart/index.php',
    REMOVE:       (id) => `/cart/index.php?course_id=${id}`,
    CLEAR:        '/cart/index.php?action=clear',
    APPLY_COUPON: '/cart/index.php?action=apply_coupon',
  },
  ORDERS: {
    BASE:     '/admin/orders.php',
    CHECKOUT: '/courses/enroll.php',        // Legacy
    DETAIL:   (id) => `/admin/orders.php?id=${id}`,
    // ✅ Phase 5 — Checkout (db.php system)
    PLACE:    '/student/checkout.php',
  },
};