import { Outlet, Link } from "react-router-dom";
import { BookOpen, Star, Users, Award } from "lucide-react";
import { ROUTES } from "../../constants";

// ─── Social Proof Stats ───────────────────────────────────────────────────────
const stats = [
  { icon: <Users className="w-4 h-4" />, value: "+50,000", label: "Active learners" },
  { icon: <BookOpen className="w-4 h-4" />, value: "+500", label: "Professional courses" },
  { icon: <Award className="w-4 h-4" />, value: "+200", label: "Expert instructors" },
  { icon: <Star className="w-4 h-4" />, value: "4.8", label: "Platform rating" },
];

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex" dir="ltr">

      {/* ── Left Panel (hidden on mobile) ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-10 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo */}
        <Link to={ROUTES.HOME} className="relative inline-flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Defura</span>
        </Link>

        {/* Headline */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Start your learning journey
            <br />
            <span className="text-blue-200">with top courses and expert instructors</span>
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8 max-w-sm">
            Defura brings professional trainers and flexible online learning
            together so you can reach your career goals faster.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon, value, label }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/10"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none mb-0.5">
                    {value}
                  </p>
                  <p className="text-blue-200 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-blue-300">
          © {new Date().getFullYear()} Defura. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel (form) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">

        {/* Mobile Logo */}
        <Link
          to={ROUTES.HOME}
          className="lg:hidden inline-flex items-center gap-2 mb-8"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Defura<span className="text-blue-600">LMS</span>
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Outlet />
        </div>

        {/* Back link */}
        <Link
          to={ROUTES.HOME}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default AuthLayout;