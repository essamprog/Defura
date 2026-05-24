import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Mic } from "lucide-react";
import { ROUTES } from "@/constants";

// ─── Single CTA card ──────────────────────────────────────────────────────────
const CTACard = ({ type }) => {
  const navigate = useNavigate();

  const isStudent = type === "student";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[280px]",
        isStudent
          ? "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10",
      ].join(" ")}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={[
            "absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20",
            isStudent ? "bg-white" : "bg-blue-500",
          ].join(" ")}
          style={{ filter: "blur(40px)" }}
        />
        <div
          className={[
            "absolute -bottom-20 -left-10 w-64 h-64 rounded-full opacity-10",
            isStudent ? "bg-indigo-400" : "bg-indigo-600",
          ].join(" ")}
          style={{ filter: "blur(50px)" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon badge */}
        <div
          className={[
            "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
            isStudent ? "bg-white/15 backdrop-blur-sm" : "bg-white/10",
          ].join(" ")}
        >
          {isStudent
            ? <BookOpen className="w-6 h-6 text-white" />
            : <Mic className="w-6 h-6 text-white" />}
        </div>

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-white/60">
          {isStudent ? "For Learners" : "For Educators"}
        </p>

        {/* Headline */}
        <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-3">
          {isStudent
            ? <>Start learning.<br />Advance your career.</>
            : <>Share your expertise.<br />Earn at scale.</>}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/70 leading-relaxed max-w-sm mb-8">
          {isStudent
            ? "Join 52,000+ IT professionals. Access 500+ expert-led courses and earn certificates recognized worldwide."
            : "Reach thousands of learners, build your brand, and monetize your knowledge on the fastest-growing IT education platform."}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(isStudent ? ROUTES.REGISTER : ROUTES.BECOME_INSTRUCTOR)}
          className={[
            "group inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5",
            isStudent
              ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-blue-900/20"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-black/20",
          ].join(" ")}
        >
          {isStudent ? "Get Started Free" : "Become an Instructor"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => navigate(isStudent ? ROUTES.COURSES : ROUTES.INSTRUCTOR_INFO)}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-medium text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200"
        >
          {isStudent ? "Browse Courses" : "Learn More"}
        </button>
      </div>
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────
const CTASection = () => (
  <section className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CTACard type="student" />
        <CTACard type="instructor" />
      </div>
    </div>
  </section>
);

export default CTASection;