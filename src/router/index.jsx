// src/router/index.jsx

import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "../constants";
import { ROLES } from "../constants/roles";

// ── Layouts ───────────────────────────────────────────────────────────────────
import {
  PublicLayout,
  AuthLayout,
  StudentLayout,
  InstructorLayout,
  AdminLayout,
  LearningLayout,
} from "./layouts";

// ── Guards ────────────────────────────────────────────────────────────────────
import { PrivateRoute, PublicRoute, RoleGuard } from "../components/guards";

// ── Loading fallback ──────────────────────────────────────────────────────────
import LoadingScreen from "../components/common/LoadingScreen";

// ─── Lazy page imports ────────────────────────────────────────────────────────

// Public
const HomePage         = lazy(() => import("../features/home/pages/HomePage"));
const CoursesPage      = lazy(() => import("../features/courses/pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("../features/courses/pages/CourseDetailPage"));
// ✅ Phase 5 — New student-facing components (previously orphaned)
const Marketplace      = lazy(() => import("../features/student/Marketplace"));
const CoursePreview    = lazy(() => import("../features/student/CoursePreview"));

// Auth
const LoginPage          = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage       = lazy(() => import("../features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage  = lazy(() => import("../features/auth/pages/ResetPasswordPage"));

// Student
const DashboardPage      = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const MyCoursesPage      = lazy(() => import("../features/learning/pages/MyCoursesPage"));        // ✅ NEW
const StudentDashboard   = lazy(() => import("../features/student/StudentDashboard"));              // ✅ Phase 5
const OrderSuccessPage   = lazy(() => import("../features/cart/pages/OrderSuccessPage"));          // ✅ NEW
const ProfilePage        = lazy(() => import("../features/profile/pages/ProfilePage"));
const MyCertificatesPage = lazy(() => import("../features/dashboard/pages/MyCertificatesPage"));
const CartPage           = lazy(() => import("../features/cart/pages/CartPage"));
const CheckoutPage       = lazy(() => import("../features/cart/pages/CheckoutPage"));
const NotificationsPage  = lazy(() => import("../features/notifications/pages/NotificationsPage"));

// Learning (distraction-free layout)
const LearningPage  = lazy(() => import("../features/learning/pages/LearningPage"));
const CoursePlayer  = lazy(() => import("../features/student/CoursePlayer"));    // ✅ Phase 5

// Instructor
const InstructorDashboardPage    = lazy(() => import("../features/instructor/pages/InstructorDashboardPage"));
const InstructorCoursesPage      = lazy(() => import("../features/instructor/pages/InstructorCoursesPage"));
const InstructorCourseDetailPage = lazy(() => import("../features/instructor/pages/InstructorCourseDetailPage")); // ✅ NEW
const AddNewLessonPage           = lazy(() => import("../features/instructor/pages/AddNewLessonPage"));
const CreateCoursePage           = lazy(() => import("../features/instructor/pages/CreateCoursePage"));
const EditCoursePage             = lazy(() => import("../features/instructor/pages/EditCoursePage"));
const InstructorStudentsPage     = lazy(() => import("../features/instructor/pages/InstructorStudentsPage"));
const InstructorRevenuePage      = lazy(() => import("../features/instructor/pages/InstructorRevenuePage"));
const InstructorFinancialsPage   = lazy(() => import("../features/instructor/pages/InstructorFinancialsPage"));

// Admin
const AdminDashboardPage  = lazy(() => import("../features/admin/pages/AdminDashboardPage"));
const AdminUsersPage      = lazy(() => import("../features/admin/pages/AdminUsersPage"));
const AdminCoursesPage    = lazy(() => import("../features/admin/pages/AdminCoursesPage"));
const AdminOrdersPage     = lazy(() => import("../features/admin/pages/AdminOrdersPage"));
const AdminCategoriesPage = lazy(() => import("../features/admin/pages/AdminCategoriesPage"));
const AdminSettingsPage   = lazy(() => import("../features/admin/pages/AdminSettingsPage"));
const AdminAuditLogsPage  = lazy(() => import("../features/admin/pages/AuditLogs"));

// 404
const NotFoundPage = lazy(() => import("../components/common/NotFoundPage"));

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
const L = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

// ─── Router definition ────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public pages ──────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME,           element: <L><HomePage /></L> },
      { path: ROUTES.COURSES,        element: <L><CoursesPage /></L> },
      { path: ROUTES.COURSE_DETAIL,  element: <L><CourseDetailPage /></L> },
      // ✅ Phase 5 public routes
      { path: ROUTES.MARKETPLACE,    element: <L><Marketplace /></L> },
      { path: ROUTES.COURSE_PREVIEW, element: <L><CoursePreview /></L> },
    ],
  },

  // ── Auth pages ─────────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <PublicRoute><L><LoginPage /></L></PublicRoute>,
      },
      {
        path: ROUTES.REGISTER,
        element: <PublicRoute><L><RegisterPage /></L></PublicRoute>,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <PublicRoute><L><ForgotPasswordPage /></L></PublicRoute>,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <PublicRoute><L><ResetPasswordPage /></L></PublicRoute>,
      },
    ],
  },

  // ── Student pages ──────────────────────────────────────────────────────────
  {
    element: <PrivateRoute><StudentLayout /></PrivateRoute>,
    children: [
      // Dashboard overview
      {
        path: ROUTES.DASHBOARD,
        element: <L><DashboardPage /></L>,
      },
      // ✅ Dedicated enrolled courses page
      {
        path: ROUTES.MY_COURSES,
        element: <L><MyCoursesPage /></L>,
      },
      // ✅ Phase 5 student learning dashboard
      {
        path: ROUTES.MY_LEARNING,
        element: <L><StudentDashboard /></L>,
      },
      // ✅ Post-payment success page
      {
        path: ROUTES.ORDER_SUCCESS,
        element: <L><OrderSuccessPage /></L>,
      },
      {
        path: ROUTES.PROFILE,
        element: <L><ProfilePage /></L>,
      },
      {
        path: ROUTES.CERTIFICATES,
        element: <L><MyCertificatesPage /></L>,
      },
      {
        path: ROUTES.CART,
        element: <L><CartPage /></L>,
      },
      {
        path: ROUTES.CHECKOUT,
        element: <L><CheckoutPage /></L>,
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: <L><NotificationsPage /></L>,
      },
    ],
  },

  // ── Learning (distraction-free layout) ────────────────────────────────────
  {
    element: <PrivateRoute><LearningLayout /></PrivateRoute>,
    children: [
      {
        path: ROUTES.LEARNING,
        element: <L><LearningPage /></L>,
      },
      // ✅ Phase 5 course player
      {
        path: ROUTES.PLAYER,
        element: <L><CoursePlayer /></L>,
      },
    ],
  },

  // ── Instructor pages ───────────────────────────────────────────────────────
  {
    element: (
      <RoleGuard allowedRoles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
        <InstructorLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: ROUTES.INSTRUCTOR_DASHBOARD,
        element: <L><InstructorDashboardPage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_COURSES,
        element: <L><InstructorCoursesPage /></L>,
      },
      // ✅ Single course detail — must come BEFORE :id/edit to avoid conflict
      {
        path: ROUTES.INSTRUCTOR_COURSE_DETAIL,  // "/instructor/courses/:id"
        element: <L><InstructorCourseDetailPage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_CREATE_COURSE,  // "/instructor/courses/create"
        element: <L><CreateCoursePage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_EDIT_COURSE,    // "/instructor/courses/:id/edit"
        element: <L><EditCoursePage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_ADD_LESSON,
        element: <L><AddNewLessonPage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_STUDENTS,
        element: <L><InstructorStudentsPage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_REVENUE,
        element: <L><InstructorRevenuePage /></L>,
      },
      {
        path: ROUTES.INSTRUCTOR_FINANCIALS,
        element: <L><InstructorFinancialsPage /></L>,
      },
    ],
  },

  // ── Admin pages ────────────────────────────────────────────────────────────
  {
    element: (
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      { path: ROUTES.ADMIN_DASHBOARD,  element: <L><AdminDashboardPage /></L>  },
      { path: ROUTES.ADMIN_USERS,      element: <L><AdminUsersPage /></L>      },
      { path: ROUTES.ADMIN_COURSES,    element: <L><AdminCoursesPage /></L>    },
      { path: ROUTES.ADMIN_ORDERS,     element: <L><AdminOrdersPage /></L>     },
      { path: ROUTES.ADMIN_CATEGORIES, element: <L><AdminCategoriesPage /></L> },
      { path: ROUTES.ADMIN_SETTINGS,   element: <L><AdminSettingsPage /></L>   },
      { path: ROUTES.ADMIN_AUDIT_LOGS, element: <L><AdminAuditLogsPage /></L>  },
    ],
  },

  // ── 404 catch-all ──────────────────────────────────────────────────────────
  {
    path: "*",
    element: <L><NotFoundPage /></L>,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;