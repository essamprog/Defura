import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar, MobileSidebar, Header } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore, useAuthStore, useNotificationsStore, useCartStore } from "../../store";
import { ROUTES } from "../../constants";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  ShoppingCart,
  User,
  Bell,
  Compass,
  Video,
  CirclePlus,
  Users,
  BarChart2,
  Settings,
  Tag,
  FileText,
  ShoppingBag,
} from "lucide-react";

const StudentLayout = () => {
  const { sidebarOpen, toasts, removeToast } = useUIStore();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const { items } = useCartStore();
  const location = useLocation();

  const cartBadge = items.length > 0 ? items.length : undefined;

  // Paths that anyone logged in (student, instructor, admin) can access under this layout
  const sharedPaths = [ROUTES.CART, ROUTES.CHECKOUT, ROUTES.ORDER_SUCCESS];
  const isSharedPath = sharedPaths.includes(location.pathname);

  // Instructors and admins should always use their own layouts
  // If they somehow land on a student route, redirect them home
  if (!isSharedPath) {
    if (user?.role === "instructor") {
      return <Navigate to={ROUTES.INSTRUCTOR_DASHBOARD} replace />;
    }
    if (user?.role === "admin") {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
  }

  // Determine dynamic sidebar navigation and styling based on the user's role
  let navItems = [];
  let accentColor = "blue";

  if (user?.role === "admin") {
    accentColor = "red";
    navItems = [
      { label: "Overview", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD, end: true },
      { label: "Users", icon: Users, path: ROUTES.ADMIN_USERS, end: true },
      { label: "Courses", icon: BookOpen, path: ROUTES.ADMIN_COURSES, end: true },
      { label: "Orders", icon: ShoppingBag, path: ROUTES.ADMIN_ORDERS, end: true },
      { label: "Categories", icon: Tag, path: ROUTES.ADMIN_CATEGORIES, end: true },
      { label: "Settings", icon: Settings, path: ROUTES.ADMIN_SETTINGS, end: true },
      { label: "Audit Logs", icon: FileText, path: ROUTES.ADMIN_AUDIT_LOGS, end: true },
      { label: "Cart", icon: ShoppingCart, path: ROUTES.CART, end: true, badge: cartBadge },
      {
        label: "Notifications",
        icon: Bell,
        path: ROUTES.ADMIN_NOTIFICATIONS,
        end: true,
        badge: unreadCount,
      },
      { label: "Profile", icon: User, path: ROUTES.ADMIN_PROFILE, end: true },
    ];
  } else if (user?.role === "instructor") {
    accentColor = "indigo";
    navItems = [
      { label: "Overview",       icon: LayoutDashboard, path: ROUTES.INSTRUCTOR_DASHBOARD,    end: true },
      { label: "My Courses",     icon: Video,           path: ROUTES.INSTRUCTOR_COURSES,      end: true },
      { label: "Create Course",  icon: CirclePlus,      path: ROUTES.INSTRUCTOR_CREATE_COURSE, end: true },
      { label: "My Students",    icon: Users,           path: ROUTES.INSTRUCTOR_STUDENTS,     end: true },
      { label: "Analytics",      icon: BarChart2,       path: ROUTES.INSTRUCTOR_ANALYTICS,    end: true },
      {
        label: "Notifications",
        icon: Bell,
        path: ROUTES.INSTRUCTOR_NOTIFICATIONS,
        end: true,
        badge: unreadCount,
      },
      { label: "Settings",       icon: Settings,        path: ROUTES.INSTRUCTOR_SETTINGS,     end: true },
      { label: "Browse Courses",        icon: Compass,  path: ROUTES.COURSES,                 end: true },
      { label: "Cart",                  icon: ShoppingCart, path: ROUTES.CART,                end: true, badge: cartBadge },
      { label: "My Purchased Courses",  icon: BookOpen, path: ROUTES.INSTRUCTOR_MY_LEARNING,  end: true },
      { label: "Profile",               icon: User,     path: ROUTES.INSTRUCTOR_PROFILE,      end: true },
    ];
  } else {
    // Default to student mode
    accentColor = "blue";
    navItems = [
      { label: "Overview",      icon: LayoutDashboard, path: ROUTES.DASHBOARD,     end: true },
      { label: "My Courses",    icon: BookOpen,        path: ROUTES.MY_COURSES,    end: true },
      { label: "Browse",        icon: Compass,         path: ROUTES.COURSES,       end: true },
      { label: "Certificates",  icon: Award,           path: ROUTES.CERTIFICATES,  end: true },
      { label: "Cart",          icon: ShoppingCart,    path: ROUTES.CART,          end: true, badge: cartBadge },
      {
        label: "Notifications",
        icon: Bell,
        path: ROUTES.NOTIFICATIONS,
        end: true,
        badge: unreadCount,
      },
      { label: "Profile",       icon: User,            path: ROUTES.PROFILE,       end: true },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">

      <Sidebar navItems={navItems} accentColor={accentColor} />
      <MobileSidebar navItems={navItems} accentColor={accentColor} />

      <div
        className={[
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20",
        ].join(" ")}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2 w-80 max-w-[calc(100vw-2.5rem)]"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default StudentLayout;