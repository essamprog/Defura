// src/constants/routes.js

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  HOME:          "/",
  COURSES:       "/courses",
  COURSE_DETAIL: "/courses/:id",
  MARKETPLACE:   "/marketplace",          // ✅ Phase 5 marketplace
  COURSE_PREVIEW:"/preview/:id",          // ✅ Phase 5 course preview
  ABOUT:         "/about",

  // ── Auth ──────────────────────────────────────────────────────────────────
  LOGIN:           "/login",
  REGISTER:        "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD:  "/reset-password/:token",

  // ── Student ───────────────────────────────────────────────────────────────
  DASHBOARD:     "/dashboard",
  MY_COURSES:    "/my-courses",           // ✅ dedicated enrolled courses page
  MY_LEARNING:   "/my-learning",          // ✅ Phase 5 student dashboard
  PLAYER:        "/player/:id",           // ✅ Phase 5 course player
  PROFILE:       "/profile",
  CART:          "/cart",
  CHECKOUT:      "/checkout",
  ORDER_SUCCESS: "/order-success",        // ✅ post-payment success page
  LEARNING:      "/learn/:courseId/:lessonId",
  CERTIFICATES:  "/certificates",
  NOTIFICATIONS: "/notifications",

  // ── Instructor ────────────────────────────────────────────────────────────
  INSTRUCTOR_DASHBOARD:     "/instructor/dashboard",
  INSTRUCTOR_COURSES:       "/instructor/courses",
  INSTRUCTOR_COURSE_DETAIL: "/instructor/courses/:id", // ✅ single course detail
  INSTRUCTOR_CREATE_COURSE: "/instructor/courses/create",
  INSTRUCTOR_EDIT_COURSE:   "/instructor/courses/:id/edit",
  INSTRUCTOR_ADD_LESSON:    "/instructor/courses/add-lesson",
  INSTRUCTOR_STUDENTS:      "/instructor/students",
  INSTRUCTOR_REVENUE:       "/instructor/revenue",
  INSTRUCTOR_FINANCIALS:    "/instructor/financials",

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_DASHBOARD:  "/admin/dashboard",
  ADMIN_USERS:      "/admin/users",
  ADMIN_COURSES:    "/admin/courses",
  ADMIN_ORDERS:     "/admin/orders",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_SETTINGS:   "/admin/settings",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",

  // ── Helper functions ──────────────────────────────────────────────────────
  courseDetail:          (id)                 => `/courses/${id}`,
  coursePreview:         (id)                 => `/preview/${id}`,
  player:                (id)                 => `/player/${id}`,
  learning:              (courseId, lessonId) => `/learn/${courseId}/${lessonId}`,
  editCourse:            (id)                 => `/instructor/courses/${id}/edit`,
  instructorCourseDetail:(id)                 => `/instructor/courses/${id}`,
  resetPassword:         (token)              => `/reset-password/${token}`,
};