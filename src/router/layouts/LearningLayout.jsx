import { Outlet, Link, useParams } from "react-router-dom";
import { ChevronRight, Menu } from "lucide-react";
import { ROUTES } from "../../constants";
import { useUIStore } from "../../store";

const LearningLayout = () => {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" dir="ltr">

      {/* ── Minimal Top Bar ─────────────────────────────────────── */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 shrink-0 z-20">

        {/* Mobile menu (for lesson list drawer) */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Lesson list"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back link */}
        <Link
          to={ROUTES.MY_COURSES}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm group"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span>My Courses</span>
        </Link>

        {/* Divider */}
        <span className="w-px h-4 bg-gray-700" />

        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <img
            src="/assets/images/Defura_logo.png"
            alt="DefuraLMS Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-base font-bold text-white hidden sm:block">
            Defura
          </span>
        </Link>
      </header>

      {/* ── Learning Content ─────────────────────────────────────── */}
      {/* LessonPlayer + LessonSidebar are composed inside LearningPage */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default LearningLayout;