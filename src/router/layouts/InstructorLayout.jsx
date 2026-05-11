import { Outlet } from "react-router-dom";
import { Sidebar, MobileSidebar, Header } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore, useAuthStore } from "../../store";
import { ROUTES } from "../../constants";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  PlusCircle,
  User,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";

const InstructorLayout = () => {
  const { sidebarOpen, toasts, removeToast } = useUIStore();
  const { user } = useAuthStore();

  const instructorNavItems = [
    { label: "Overview",  icon: LayoutDashboard, path: ROUTES.INSTRUCTOR_DASHBOARD },
    { label: "My Courses", icon: BookOpen,         path: ROUTES.INSTRUCTOR_COURSES },
    { label: "New Course", icon: PlusCircle,       path: ROUTES.INSTRUCTOR_CREATE_COURSE },
    { label: "Students",   icon: Users,            path: ROUTES.INSTRUCTOR_STUDENTS },
    { label: "Revenue",    icon: DollarSign,       path: ROUTES.INSTRUCTOR_REVENUE },
    { label: "Financials", icon: Wallet,           path: ROUTES.INSTRUCTOR_FINANCIALS },
    { label: "Notifications", icon: Bell,          path: ROUTES.NOTIFICATIONS },
    { label: "Profile",    icon: User,             path: ROUTES.PROFILE },
  ];

  if (user?.role === "admin") {
    instructorNavItems.push({ label: "Admin Dashboard", icon: Settings, path: ROUTES.ADMIN_DASHBOARD });
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