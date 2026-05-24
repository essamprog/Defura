import { Outlet } from "react-router-dom";
import { Sidebar, MobileSidebar, Header } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore, useAuthStore, useNotificationsStore, useCartStore } from "../../store";
import { ROUTES } from "../../constants";
import {
  LayoutDashboard,
  Video,
  CirclePlus,
  Users,
  BarChart2,
  Wallet,
  Bell,
  Settings,
  Compass,
  BookOpen,
  User,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

const InstructorLayout = () => {
  const { sidebarOpen, toasts, removeToast } = useUIStore();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const { items } = useCartStore();

  const cartBadge = items.length > 0 ? items.length : undefined;

  const instructorNavItems = [
    // Instructor-specific pages
    { label: "Overview",       icon: LayoutDashboard, path: ROUTES.INSTRUCTOR_DASHBOARD,    end: true },
    { label: "My Courses",     icon: Video,           path: ROUTES.INSTRUCTOR_COURSES,      end: true },
    { label: "Create Course",  icon: CirclePlus,      path: ROUTES.INSTRUCTOR_CREATE_COURSE, end: true },
    { label: "My Students",    icon: Users,           path: ROUTES.INSTRUCTOR_STUDENTS,     end: true },
    { label: "Analytics",      icon: BarChart2,       path: ROUTES.INSTRUCTOR_ANALYTICS,    end: true },
    { label: "Financials",     icon: Wallet,          path: ROUTES.INSTRUCTOR_FINANCIALS,   end: true },
    {
      label: "Notifications",
      icon: Bell,
      path: ROUTES.INSTRUCTOR_NOTIFICATIONS,
      end: true,
      badge: unreadCount,
    },
    { label: "Settings",       icon: Settings,        path: ROUTES.INSTRUCTOR_SETTINGS,     end: true },

    // ── Student pages — NO section label ────────────────────────
    { label: "Browse Courses",        icon: Compass,  path: ROUTES.COURSES,                 end: true },
    { label: "Cart",                  icon: ShoppingCart, path: ROUTES.CART,                end: true, badge: cartBadge },
    { label: "My Purchased Courses",  icon: BookOpen, path: ROUTES.INSTRUCTOR_MY_LEARNING,  end: true },
    { label: "Profile",               icon: User,     path: ROUTES.INSTRUCTOR_PROFILE,      end: true },
  ];

  // Admin shortcut (only if logged in as admin using instructor layout)
  if (user?.role === "admin") {
    instructorNavItems.push(
      { type: "section", label: "Admin" },
      { label: "Admin Dashboard", icon: ShieldCheck, path: ROUTES.ADMIN_DASHBOARD, end: true }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">

      <Sidebar navItems={instructorNavItems} accentColor="indigo" />
      <MobileSidebar navItems={instructorNavItems} accentColor="indigo" />

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
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default InstructorLayout;