import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  BookOpen,
  LayoutDashboard,
  LogOut,
  User,
  Bell,
  Check,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuthStore, useCartStore, useNotificationsStore } from "../../store";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import { formatRelativeTime } from "../../utils";

// ── Notification dot color per type ────────────────────────────────────────────
const typeStyle = {
  course: { dot: "bg-blue-500" },
  course_update: { dot: "bg-blue-500" },
  course_pending: { dot: "bg-orange-500" },  // ⭐ pending review
  certificate: { dot: "bg-amber-400" },
  cert: { dot: "bg-amber-400" },
  enrollment: { dot: "bg-emerald-500" },
  payment: { dot: "bg-violet-500" },
  purchase_success: { dot: "bg-emerald-500" },
  default: { dot: "bg-gray-400" },
};

// ── Notification Bell + Dropdown ──────────────────────────────────────────
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Notifications page route depends on role
  const notifRoute = user?.role === 'admin'
    ? ROUTES.ADMIN_NOTIFICATIONS
    : user?.role === 'instructor'
      ? ROUTES.INSTRUCTOR_NOTIFICATIONS
      : ROUTES.NOTIFICATIONS;

  // Fetch on mount and poll every 60s to keep badge count fresh
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Also refresh immediately when dropdown is opened
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const preview = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-12" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">All caught up!</p>
                <p className="text-xs text-gray-400 mt-0.5">No new notifications</p>
              </div>
            ) : (
              preview.map((n) => {
                const style = typeStyle[n.type] ?? typeStyle.default;
                // Normalize text across different field names the API may return
                const text = n.body ?? n.message ?? n.title ?? "";
                // Normalize time across different field names
                const time = n.createdAt ?? n.created_at ?? n.time;
                return (
                  <button
                    key={n._id}
                    onClick={() => {
                      markAsRead(n._id);
                      setOpen(false);
                      if (n.link) navigate(n.link.replace(/^\/admin/, '/admin').replace(/^\/instructor/, '/instructor'));
                    }}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/40" : ""
                      }`}
                  >
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot} ${n.isRead ? "opacity-30" : ""
                      }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug mb-0.5 font-semibold ${n.isRead ? "text-gray-400" : "text-gray-800"
                        }`}>
                        {n.title}
                      </p>
                      <p className={`text-xs leading-snug line-clamp-2 ${n.isRead ? "text-gray-400" : "text-gray-600"
                        }`}>
                        {text}
                      </p>
                      {time && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatRelativeTime(time)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => { setOpen(false); navigate(notifRoute); }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1"
            >
              View all notifications <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Nav links ─────────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Home", path: ROUTES.HOME },
  { label: "Courses", path: ROUTES.COURSES },
  { label: "Instructors", path: ROUTES.INSTRUCTORS },
];

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const getDashboardRoute = () => {
    if (user?.role === "admin") return ROUTES.ADMIN_DASHBOARD;
    if (user?.role === "instructor") return ROUTES.INSTRUCTOR_DASHBOARD;
    return ROUTES.DASHBOARD;
  };

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Defura<span className="text-blue-600">LMS</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right Actions ─────────────────────────────────── */}
          <div className="flex items-center gap-1.5">

            {/* Cart */}
            <Link
              to={ROUTES.CART}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {items.length}
                </span>
              )}
            </Link>

            {/* 🔔 Notification Bell — authenticated only */}
            {isAuthenticated && <NotificationBell />}

            {/* Auth */}
            {isAuthenticated ? (
              <Dropdown>
                {({ open, setOpen }) => (
                  <>
                    <button
                      onClick={() => setOpen((v) => !v)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Avatar
                        src={user?.profile_picture ?? user?.avatar}
                        name={user?.full_name}
                        size="sm"
                      />
                      <ChevronDown
                        className={[
                          "w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block",
                          open ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>
                    <Dropdown.Menu open={open} align="left">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      <Dropdown.Item
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        onClick={() => { navigate(getDashboardRoute()); setOpen(false); }}
                      >
                        Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item
                        icon={<User className="w-4 h-4" />}
                        onClick={() => { navigate(ROUTES.PROFILE); setOpen(false); }}
                      >
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        icon={<LogOut className="w-4 h-4" />}
                        danger
                        onClick={handleLogout}
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </>
                )}
              </Dropdown>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                  Sign up free
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}

            {!isAuthenticated && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { navigate(ROUTES.LOGIN); setMobileOpen(false); }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  onClick={() => { navigate(ROUTES.REGISTER); setMobileOpen(false); }}
                >
                  Sign up free
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;