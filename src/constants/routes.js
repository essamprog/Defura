// src/constants/routes.js

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  HOME:          "/",
  COURSES:       "/courses",
  COURSE_DETAIL: "/courses/:id",
  MARKETPLACE:   "/marketplace",          // ✅ Phase 5 marketplace
  COURSE_PREVIEW:"/preview/:id",          // ✅ Phase 5 course preview
  ABOUT:         "/about",
  INSTRUCTORS:   "/instructors",
  INSTRUCTOR_PUBLIC_PROFILE: "/instructors/:id",
  INSTRUCTOR_INFO:   "/instructor-info",
  BECOME_INSTRUCTOR: "/become-instructor",

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
  INSTRUCTOR_ANALYTICS:     "/instructor/analytics",
  INSTRUCTOR_REVENUE:       "/instructor/revenue",
  INSTRUCTOR_FINANCIALS:    "/instructor/financials",
  INSTRUCTOR_MY_LEARNING:   "/instructor/my-learning",  // ✅ courses instructor purchased
  INSTRUCTOR_NOTIFICATIONS: "/instructor/notifications", // ✅ instructor-scoped notifications
  INSTRUCTOR_SETTINGS:      "/instructor/settings",
  INSTRUCTOR_PROFILE:       "/instructor/profile",

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_DASHBOARD:       "/admin/dashboard",
  ADMIN_USERS:           "/admin/users",
  ADMIN_COURSES:         "/admin/courses",
  ADMIN_ORDERS:          "/admin/orders",
  ADMIN_WITHDRAWALS:     "/admin/withdrawals",
  ADMIN_CATEGORIES:      "/admin/categories",
  ADMIN_SETTINGS:        "/admin/settings",
  ADMIN_AUDIT_LOGS:      "/admin/audit-logs",
  ADMIN_NOTIFICATIONS:   "/admin/notifications",  // ✅ admin-scoped notifications
  ADMIN_PROFILE:         "/admin/profile",         // ✅ admin-scoped profile
  ADMIN_COURSE_PREVIEW:  "/admin/courses/preview/:id", // ✅ admin course preview
  ADMIN_INSTRUCTORS_FINANCIALS: "/admin/instructors-financials",
  ADMIN_APPLICATIONS:    "/admin/applications",

  // ── Helper functions ──────────────────────────────────────────────────────
  courseDetail:          (id)                 => `/courses/${id}`,
  coursePreview:         (id)                 => `/preview/${id}`,
  adminCoursePreview:    (id)                 => `/admin/courses/preview/${id}`,  // ✅ admin only
  player:                (id)                 => `/player/${id}`,
  learning:              (courseId, lessonId) => `/learn/${courseId}/${lessonId}`,
  editCourse:            (id)                 => `/instructor/courses/${id}/edit`,
  instructorCourseDetail:(id)                 => `/instructor/courses/${id}`,
  resetPassword:         (token)              => `/reset-password/${token}`,
  publicInstructorProfile:(id)                 => `/instructors/${id}`,
};
