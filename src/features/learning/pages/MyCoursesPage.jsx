// src/features/learning/pages/MyCoursesPage.jsx
// Uses exact DB column names: thumbnail_url, full_name, average_rating,
// total_duration (seconds), duration_seconds, order_index

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Play, Clock, CheckCircle,
  Search, Filter, ChevronDown, Award,
  RotateCcw, ArrowRight,
} from "lucide-react";
import { Spinner, ProgressBar, Badge } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { ROUTES } from "@/constants";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert total seconds → "Xh Ym" string */
const formatSeconds = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Enrollment status → badge props
// DB statuses: in_progress | completed | refunded | suspended
const STATUS_MAP = {
  in_progress: { label: "In Progress", variant: "primary", dot: "#7C3AED" },
  completed:   { label: "Completed",   variant: "success", dot: "#16A34A" },
  refunded:    { label: "Refunded",    variant: "info",    dot: "#7C3AED" },
  suspended:   { label: "Suspended",   variant: "danger",  dot: "#DC2626" },
};

// ─── Single Course Card ───────────────────────────────────────────────────────
const EnrolledCourseCard = ({ enrollment }) => {
  const navigate = useNavigate();

  // Field names exactly as returned by enrolled.php
  // which JOINs courses → uses courses.thumbnail_url, users.full_name
  const {
    _id,
    title,
    thumbnail_url,        // courses.thumbnail_url
    total_duration,       // courses.total_duration (seconds)
    total_lessons,
    completed_lessons,
    progress,             // enrollments.progress (0-100)
    status,               // enrollments.status (in_progress|completed|refunded|suspended)
    enrolled_at,
    instructor_name,      // users.full_name aliased as instructor_name in PHP
    next_lesson_id,
  } = enrollment;

  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.in_progress;
  const isCompleted = status === "completed";
  const progressColor = isCompleted ? "green" : progress >= 50 ? "blue" : "blue";

  const handleContinue = () => {
    if (next_lesson_id) {
      navigate(ROUTES.learning(_id, next_lesson_id));
    } else {
      navigate(ROUTES.learning(_id, "start"));
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-100 to-indigo-100">
            <BookOpen className="w-12 h-12 text-violet-300" />
          </div>
        )}

        {/* Status overlay badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: isCompleted ? "#D1FAE5" : "#EDE9FE",
              color:      isCompleted ? "#065F46" : "#6D28D9",
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Continue button overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            {isCompleted ? (
              <><RotateCcw className="w-3.5 h-3.5" /> Rewatch</>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /> Continue</>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
          {title}
        </h3>

        {/* Instructor — uses full_name from users table */}
        {instructor_name && (
          <p className="text-xs text-gray-400">
            by{" "}
            <span className="font-medium text-gray-600">{instructor_name}</span>
          </p>
        )}

        {/* Progress bar */}
        <div>
          <ProgressBar
            value={progress}
            max={100}
            height="sm"
            color={isCompleted ? "green" : "blue"}
            showLabel
            label={isCompleted ? "Course Complete" : "Progress"}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">
              {completed_lessons ?? 0}/{total_lessons ?? 0} lessons
            </span>
            <span className="text-[10px] font-semibold text-gray-600">
              {progress}%
            </span>
          </div>
        </div>

        {/* Meta row — uses total_duration in seconds */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
          {total_duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatSeconds(total_duration)}
            </span>
          )}
          {enrolled_at && (
            <span>
              Enrolled {new Date(enrolled_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className={[
            "mt-auto w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all",
            isCompleted
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "text-white hover:opacity-90",
          ].join(" ")}
          style={
            !isCompleted
              ? { background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }
              : {}
          }
        >
          {isCompleted ? (
            <><Award className="w-3.5 h-3.5" /> View Certificate</>
          ) : progress === 0 ? (
            <><Play className="w-3.5 h-3.5 fill-current" /> Start Learning</>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-current" /> Continue Learning</>
          )}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const CourseCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
      <div className="h-2 bg-gray-200 rounded-full" />
      <div className="h-9 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

// ─── Filter options ───────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: "",            label: "All Courses" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed"   },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyCoursesPage = () => {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const PER_PAGE = 9;

  // ── Fetch enrolled courses ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: res } = await api.get(
          ENDPOINTS.STUDENT.ENROLLED,
          {
            params: {
              page,
              per_page: PER_PAGE,
              search:   search || undefined,
              status:   statusFilter || undefined,
            },
          }
        );

        // Backend returns { success, data: [...], pagination: {...} }
        const rows       = res.data       ?? [];
        const pagination = res.pagination ?? {};

        setEnrollments(rows);
        setFiltered(rows);
        setTotalPages(pagination.total_pages ?? 1);
        setTotalCount(pagination.total       ?? rows.length);
      } catch (err) {
        setError(
          err.response?.data?.message ?? "Failed to load your courses."
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [page, search, statusFilter]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ── Stat summary ───────────────────────────────────────────────────────────
  const completedCount  = enrollments.filter(e => e.status === "completed").length;
  const inProgressCount = enrollments.filter(e => e.status === "in_progress").length;
  const avgProgress     = enrollments.length > 0
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0)
        / enrollments.length
      )
    : 0;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount > 0
              ? `${totalCount} enrolled course${totalCount !== 1 ? "s" : ""}`
              : "Your enrolled courses will appear here"}
          </p>
        </div>

        <button
          onClick={() => navigate(ROUTES.COURSES)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#7C3AED" }}
        >
          <BookOpen className="w-4 h-4" />
          Browse More Courses
        </button>
      </div>

      {/* ── Quick stat strip ─────────────────────────────────────────────── */}
      {!isLoading && enrollments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "In Progress", value: inProgressCount, color: "#7C3AED", bg: "#EDE9FE" },
            { label: "Completed",   value: completedCount,  color: "#16A34A", bg: "#D1FAE5" },
            { label: "Avg Progress",value: `${avgProgress}%`,color:"#1D4ED8", bg: "#DBEAFE" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm"
            >
              <p
                className="text-2xl font-bold mb-0.5"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filter row ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 appearance-none cursor-pointer min-w-36"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      {error ? (
        /* Error state */
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>

      ) : isLoading ? (
        /* Skeleton grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>

      ) : enrollments.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {search || statusFilter ? (
            /* No results for current filters */
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No courses match your filters"
              description="Try adjusting your search or clearing the status filter."
              action={() => { setSearch(""); setStatusFilter(""); }}
              actionLabel="Clear Filters"
            />
          ) : (
            /* Not enrolled in anything yet */
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="You are not enrolled in any courses yet"
              description="Explore our catalog and enroll in a course to start your learning journey today."
              action={() => navigate(ROUTES.COURSES)}
              actionLabel="Browse Courses"
            />
          )}
        </div>

      ) : (
        /* Course grid */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment._id ?? enrollment.course_id}
                enrollment={enrollment}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 px-4 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                  style={{ background: "#7C3AED" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyCoursesPage;