import { Outlet } from "react-router-dom";
import { Sidebar, MobileSidebar, Header } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore } from "../../store";
import { ROUTES } from "../../constants";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  Tag,
  Settings,
  Bell,
  User,
  PlusCircle,
  DollarSign,
  Wallet,
  Award,
  ShoppingCart,
  FileText,
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
  { label: "Users", icon: Users, path: ROUTES.ADMIN_USERS },
  { label: "Courses", icon: BookOpen, path: ROUTES.ADMIN_COURSES },
  { label: "Orders", icon: ShoppingBag, path: ROUTES.ADMIN_ORDERS },
  { label: "Categories", icon: Tag, path: ROUTES.ADMIN_CATEGORIES },
  { label: "Settings", icon: Settings, path: ROUTES.ADMIN_SETTINGS },
  { label: "Audit Logs", icon: FileText, path: ROUTES.ADMIN_AUDIT_LOGS },
  
  // General
  { label: "Notifications", icon: Bell, path: ROUTES.NOTIFICATIONS },
  { label: "Profile", icon: User, path: ROUTES.PROFILE },
];

const AdminLayout = () => {
  const { sidebarOpen, toasts, removeToast } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">

      <Sidebar navItems={adminNavItems} accentColor="red" />
      <MobileSidebar navItems={adminNavItems} accentColor="red" />

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

export default AdminLayout;