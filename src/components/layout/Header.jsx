import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import { useAuthStore, useUIStore, useNotificationsStore } from "../../store";
import { ROUTES } from "../../constants";
import Avatar from "../ui/Avatar";
import Dropdown from "../ui/Dropdown";

const Header = () => {
  const { user } = useAuthStore();
  const { toggleMobileSidebar } = useUIStore();
  const { unreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 h-16 flex items-center px-4 sm:px-6 gap-4 shrink-0">
      {/* Mobile menu */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-500">
          {greeting},{" "}
          <span className="font-semibold text-gray-800">
            {user?.full_name?.split(" ")[0]}
          </span>{" "}
          👋
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 mr-auto">
        {/* Search */}
        <button
          onClick={() => navigate(ROUTES.COURSES)}
          className="hidden sm:flex items-center gap-2 text-sm text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Avatar src={user?.profile_picture ?? user?.avatar} name={user?.full_name} size="sm" />
        </button>
      </div>
    </header>
  );
};

export default Header;