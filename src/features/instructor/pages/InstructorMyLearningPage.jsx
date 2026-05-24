import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Play, Clock, Award, Search,
  ShoppingBag, ArrowRight, BarChart2,
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { ROUTES } from "@/constants";
import api from "@/services/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
const pct = (p) => Math.min(100, Math.max(0, Math.round(Number(p ?? 0))));

const ProgressRing = ({ value, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={value >= 100 ? "#10b981" : "#6366f1"}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

const CourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const progress = pct(enrollment.progress);
  const done = progress >= 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {enrollment.thumbnail_url ? (
          <img
            src={enrollment.thumbnail_url}
            alt={enrollment.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {done && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Completed
          </div>
        )}
        {!done && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
          {enrollment.title}
        </h3>
        <p className="text-xs text-gray-400 mb-3">{enrollment.instructor_name ?? "Instructor"}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ProgressRing value={progress} />
            <div>
              <p className="text-xs font-bold text-gray-800">{progress}%</p>
              <p className="text-[10px] text-gray-400">complete</p>
            </div>
          </div>

          <button
            onClick={() => {
              const courseId = enrollment._id;
              const nextLessonId = enrollment.next_lesson_id;
              if (nextLessonId) {
                navigate(ROUTES.learning(courseId, nextLessonId));
              } else {
                navigate(ROUTES.learning(courseId, "start"));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: done ? "#10b981" : "linear-gradient(135deg,#6366f1,#7c3aed)" }}
          >
            {done ? <Award className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {done ? "Review" : progress > 0 ? "Continue" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Main Page ────────────────────────────────────────────────────────────────
const InstructorMyLearningPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | in_progress | completed

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Reuse the student enrollments endpoint — works for any authenticated user
      const { data: res } = await api.get("/student/enrolled.php");
      setEnrollments(res.data ?? []);
    } catch (err) {
      console.error("Failed to load purchased courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => { load(); }, [load]);

  const filtered = enrollments.filter((e) => {
    const matchSearch = search === "" || e.title?.toLowerCase().includes(search.toLowerCase());
    const progress = pct(e.progress);
    const matchFilter =
      filter === "all" ||
      (filter === "completed" && progress >= 100) ||
      (filter === "in_progress" && progress < 100 && progress > 0) ||
      (filter === "not_started" && progress === 0);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: enrollments.length,
    completed: enrollments.filter(e => pct(e.progress) >= 100).length,
    inProgress: enrollments.filter(e => pct(e.progress) > 0 && pct(e.progress) < 100).length,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Purchased Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Courses you&apos;ve bought to expand your own knowledge.</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.COURSES)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}
        >
          <ShoppingBag className="w-4 h-4" /> Browse Courses
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enrolled", value: stats.total, color: "#6366f1", bg: "#EEF2FF" },
          { label: "In Progress", value: stats.inProgress, color: "#f59e0b", bg: "#FFFBEB" },
          { label: "Completed", value: stats.completed, color: "#10b981", bg: "#D1FAE5" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <BarChart2 className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        {[
          { key: "all", label: "All" },
          { key: "in_progress", label: "In Progress" },
          { key: "not_started", label: "Not Started" },
          { key: "completed", label: "Completed" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all",
              filter === f.key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-semibold mb-2">
            {enrollments.length === 0 ? "You haven't purchased any courses yet" : "No courses match your filter"}
          </h3>
          {enrollments.length === 0 && (
            <button
              onClick={() => navigate(ROUTES.COURSES)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}
            >
              Browse Courses <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((enrollment, i) => (
            <CourseCard key={enrollment.course_id ?? enrollment.id ?? i} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorMyLearningPage;
