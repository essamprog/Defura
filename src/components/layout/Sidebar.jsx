import { NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuthStore, useUIStore } from "../../store";
import Avatar from "../ui/Avatar";

/**
 * Sidebar — supports two navItem shapes:
 *
 * 1. Section label  : { type: "section", label: "Student Mode" }
 * 2. Nav link       : { label, icon: LucideIcon, path, badge? }
 *    badge: number | string — shown as a red dot/pill on the icon
 */
const Sidebar = ({ navItems = [], accentColor = "blue" }) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const accent = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "text-indigo-500" },
    red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" },
  }[accentColor] ?? { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <aside
      className={[
        "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 bg-white border-r border-gray-100 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
      ].join(" ")}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div
        onClick={() => navigate(ROUTES.HOME)}
        className={[
          "flex items-center h-16 border-b border-gray-100 px-4 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors",
          sidebarOpen ? "gap-3" : "justify-center",
        ].join(" ")}
      >
        <img
          src="/assets/images/Defura_logo.png"
          alt="DefuraLMS Logo"
          className="h-11 w-auto object-contain shrink-0"
        />
        {sidebarOpen && (
          <span className="text-lg font-bold text-gray-900 truncate">
            Defura<span className="text-blue-600">-LMS</span>
          </span>
        )}
      </div>

      {/* ── Nav Items ────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item, idx) => {
          /* ── Section divider ── */
          if (item.type === "section") {
            return (
              <div key={`section-${idx}`} className={["mt-4 mb-1", sidebarOpen ? "px-3" : "flex justify-center"].join(" ")}>
                {sidebarOpen ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 select-none">
                    {item.label}
                  </p>
                ) : (
                  <div className="w-5 h-px bg-gray-200" />
                )}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end ?? true}
              title={!sidebarOpen ? item.label : undefined}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-xl transition-all duration-150 group relative",
                  sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-3",
                  isActive
                    ? `${accent.bg} ${accent.text} font-semibold`
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon + optional badge */}
                  <span className="relative shrink-0">
                    <Icon
                      className={[
                        "w-5 h-5 transition-colors",
                        isActive ? accent.icon : "text-current",
                      ].join(" ")}
                    />
                    {Number(item.badge) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {Number(item.badge) > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>

                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate flex-1">
                      {item.label}
                    </span>
                  )}

                  {/* Badge pill (expanded sidebar only) */}
                  {sidebarOpen && Number(item.badge) > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {Number(item.badge) > 99 ? "99+" : item.badge}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                      {item.badge && Number(item.badge) > 0 ? ` (${item.badge})` : ""}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Footer ──────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Avatar src={user?.profile_picture ?? user?.avatar} name={user?.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar src={user?.profile_picture ?? user?.avatar} name={user?.full_name} size="sm" />
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Toggle Button ────────────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow focus:outline-none"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <ChevronRight
          className={[
            "w-3.5 h-3.5 text-gray-400 transition-transform duration-300",
            sidebarOpen ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>
    </aside>
  );
};

export default Sidebar;