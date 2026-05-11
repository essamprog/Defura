import { NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen, LogOut } from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuthStore, useUIStore } from "../../store";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

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
      {/* ── Logo Area ──────────────────────────────────────────── */}
      <div
        onClick={() => navigate(ROUTES.HOME)}
        className={[
          "flex items-center h-16 border-b border-gray-100 px-4 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors",
          sidebarOpen ? "gap-3" : "justify-center",
        ].join(" ")}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="text-base font-bold text-gray-900 truncate">
            Learn<span className="text-blue-600">Hub</span>
          </span>
        )}
      </div>

      {/* ── Nav Items ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
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
                    ? `${accent.bg} ${accent.text}`
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive ? accent.icon : "text-current",
                    ].join(" ")}
                  />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {!sidebarOpen && (
                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Footer ────────────────────────────────────────── */}
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

      {/* ── Toggle Button ──────────────────────────────────────── */}
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