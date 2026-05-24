import { Outlet } from "react-router-dom";
import { Sidebar, MobileSidebar, Header } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore, useNotificationsStore, useCartStore } from "../../store";
import { ROUTES } from "../../constants";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ShoppingBag,
  Wallet,
  Tag,
  Settings,
  Bell,
  User,
  FileText,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

const AdminLayout = () => {
  const { sidebarOpen, toasts, removeToast } = useUIStore();
  const { unreadCount } = useNotificationsStore();
  const { items } = useCartStore();

  const cartBadge = items.length > 0 ? items.length : undefined;

  const adminNavItems = [
    { label: "Overview", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD, end: true },
    { label: "Users", icon: Users, path: ROUTES.ADMIN_USERS, end: true },
    { label: "Applications", icon: UserCheck, path: ROUTES.ADMIN_APPLICATIONS, end: true },
    { label: "Courses", icon: BookOpen, path: ROUTES.ADMIN_COURSES, end: true },
    { label: "Orders", icon: ShoppingBag, path: ROUTES.ADMIN_ORDERS, end: true },
    { label: "Instructors Financials", icon: DollarSign, path: ROUTES.ADMIN_INSTRUCTORS_FINANCIALS, end: true },
    { label: "Withdrawals", icon: Wallet, path: ROUTES.ADMIN_WITHDRAWALS, end: true },
    { label: "Categories", icon: Tag, path: ROUTES.ADMIN_CATEGORIES, end: true },
    { label: "Settings", icon: Settings, path: ROUTES.ADMIN_SETTINGS, end: true },
    { label: "Audit Logs", icon: FileText, path: ROUTES.ADMIN_AUDIT_LOGS, end: true },

    // ── General pages — no section label ────────────────────────
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
