import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">

        {/* 404 graphic */}
        <div className="relative mb-8">
          <p className="text-[120px] sm:text-[160px] font-black text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's
          get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.HOME)}
          >
            Go Home
          </Button>
          <Button
            size="lg"
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">
            Maybe you were looking for
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Browse Courses", path: ROUTES.COURSES },
              { label: "My Dashboard",  path: ROUTES.DASHBOARD },
              { label: "My Profile",    path: ROUTES.PROFILE },
              { label: "Cart",          path: ROUTES.CART },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;