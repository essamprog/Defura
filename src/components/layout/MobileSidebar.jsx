import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, BookOpen, LogOut } from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuthStore, useUIStore } from "../../store";
import Avatar from "../ui/Avatar";

/**
 * MobileSidebar — supports section dividers and unread badges.
 *
 * navItem shapes:
 *   { type: "section", label: "Student Mode" }  → renders a section header
 *   { label, icon, path, badge? }               → renders a NavLink
 */
const MobileSidebar = ({ navItems = [], accentColor = "blue" }) => {
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  const accent = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
  }[accentColor] ?? "bg-blue-50 text-blue-600";

  const handleLogout = async () => {
    await logout();
    closeMobileSidebar();
    navigate(ROUTES.HOME);
  };

  if (!mobileSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeMobileSidebar}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col lg:hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { closeMobileSidebar(); navigate(ROUTES.HOME); }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">
              Defura<span className="text-blue-600">LMS</span>
            </span>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-0.5">
          {navItems.map((item, idx) => {
            /* Section divider */
            if (item.type === "section") {
              return (
                <div key={`section-${idx}`} className="mt-4 mb-1 px-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 select-none">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end ?? true}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive ? accent : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                  ].join(" ")
                }
              >
                <span className="relative shrink-0">
                  <Icon className="w-5 h-5 shrink-0" />
                  {Number(item.badge) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {Number(item.badge) > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </span>
                <span className="flex-1">{item.label}</span>
                {Number(item.badge) > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {Number(item.badge) > 99 ? "99+" : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Avatar src={user?.profile_picture ?? user?.avatar} name={user?.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;