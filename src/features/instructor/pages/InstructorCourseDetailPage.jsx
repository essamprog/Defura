// src/features/instructor/pages/InstructorCourseDetailPage.jsx
// Fetches from instructor/course_detail.php?id={courseId}
// Uses exact DB columns: thumbnail_url, average_rating, full_name,
//                        total_duration (seconds), duration_seconds, order_index

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit, Plus, BookOpen, Users, DollarSign,
  Star, Clock, ChevronDown, ChevronRight, Play,
  Eye, Pencil, Trash2, TrendingUp, Award, Lock,
} from "lucide-react";
import { Button, Badge, Spinner, ProgressBar } from "@/components/ui";
import { ConfirmDialog, EmptyState } from "@/components/common";
import { ROUTES } from "@/constants";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** seconds → "Xh Ym" */
const fmtSeconds = (s) => {
  if (!s || s <= 0) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** lessons.duration_seconds → "MM:SS" */
const fmtDuration = (sec) => {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: bg }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Single lesson row ────────────────────────────────────────────────────────
const LessonRow = ({ lesson, onEdit, onDelete }) => (
  <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors rounded-xl group">
    {/* Play icon */}
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: "#EDE9FE" }}
    >
      <Play className="w-3.5 h-3.5 fill-violet-600 text-violet-600" />
    </div>

    {/* Title + meta */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {lesson.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        {/* duration_seconds from lessons table */}
        {lesson.duration_seconds > 0 && (
          <span className="text-[10px] text-gray-400">
            {fmtDuration(lesson.duration_seconds)}
          </span>
        )}
        {/* visibility = 'public' | 'draft' */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={
            lesson.visibility === "public"
              ? { background: "#D1FAE5", color: "#065F46" }
              : { background: "#FEF9C3", color: "#854D0E" }
          }
        >
          {lesson.visibility === "public" ? "Public" : "Draft"}
        </span>
        {lesson.is_free ? (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "#DBEAFE", color: "#1D4ED8" }}
          >
            Free
          </span>
        ) : (
          <Lock className="w-3 h-3 text-gray-300" />
        )}
      </div>
    </div>

    {/* Actions — visible on hover */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit?.(lesson)}
        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        title="Edit lesson"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onDelete?.(lesson.id)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        title="Delete lesson"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─── Section accordion ────────────────────────────────────────────────────────
const SectionAccordion = ({ section, defaultOpen = false, onEditLesson, onDeleteLesson }) => {
  const [open, setOpen] = useState(defaultOpen);

  const sectionDuration = (section.lessons ?? []).reduce(
    (sum, l) => sum + (l.duration_seconds ?? 0),
    0
  );

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Section header — uses sections.order_index */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: "#7C3AED" }}
          >
            {section.order_index + 1}
          </span>
          <span className="text-sm font-bold text-gray-800 truncate">
            {section.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            {section.lessons?.length ?? 0} lessons
            {sectionDuration > 0 && ` · ${fmtSeconds(sectionDuration)}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Lessons list */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-3 py-2 space-y-0.5">
          {(section.lessons ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No lessons yet.
            </p>
          ) : (
            /* Sorted by order_index from lessons table */
            [...(section.lessons ?? [])]
              .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={onEditLesson}
                  onDelete={onDeleteLesson}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const InstructorCourseDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [course,    setCourse]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);
  const [deleteLessonId, setDeleteLessonId] = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  // Fetch course detail from instructor/course_detail.php?id={id}
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: res } = await api.get(
          ENDPOINTS.INSTRUCTOR.COURSE_DETAIL(id)
        );
        setCourse(res.data?.course ?? null);
      } catch (err) {
        setError(
          err.response?.data?.message ??
            "Failed to load course. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Delete lesson
  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;
    setDeleting(true);
    try {
      await api.delete(`${ENDPOINTS.INSTRUCTOR.LESSONS}?id=${deleteLessonId}`);
      // Refresh course data
      const { data: res } = await api.get(ENDPOINTS.INSTRUCTOR.COURSE_DETAIL(id));
      setCourse(res.data?.course ?? null);
    } catch (err) {
      // Silent — could add a toast here
    } finally {
      setDeleting(false);
      setDeleteLessonId(null);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="blue" />
          <p className="text-sm text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Course not found"
          description={error ?? "This course does not exist or you don't have access."}
          action={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
          actionLabel="Back to My Courses"
        />
      </div>
    );
  }

  // ── Computed values using exact DB columns ─────────────────────────────────
  const {
    title,
    subtitle,
    status,
    level,
    price,
    original_price,
    thumbnail_url,         // courses.thumbnail_url
    total_duration,        // courses.total_duration (seconds)
    total_lessons,
    total_students,
    average_rating,        // courses.average_rating (DECIMAL 3,2)
    review_count,
    is_bestseller,
    language,
    published_at,
    category,
    revenue,
    curriculum = [],       // array of sections with nested lessons
  } = course;

  const totalSections = curriculum.length;
  const discount =
    original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

  const STATUS_STYLE = {
    draft:        { bg:"#FEF9C3", color:"#854D0E", label:"Draft" },
    under_review: { bg:"#DBEAFE", color:"#1D4ED8", label:"Under Review" },
    published:    { bg:"#D1FAE5", color:"#065F46", label:"Published" },
    hidden:       { bg:"#F3F4F6", color:"#6B7280", label:"Hidden" },
    archived:     { bg:"#FEE2E2", color:"#991B1B", label:"Archived" },
  };
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.draft;

  return (
    <div className="space-y-6">

      {/* ── Back + Actions header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.courseDetail(id))}
          >
            Preview
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              navigate(ROUTES.INSTRUCTOR_ADD_LESSON, {
                state: { courseId: id, courseTitle: title },
              })
            }
          >
            Add Lesson
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.editCourse(id))}
          >
            Edit Course
          </Button>
        </div>
      </div>

      {/* ── Course hero ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* Thumbnail — uses courses.thumbnail_url */}
          <div className="lg:w-72 xl:w-80 aspect-video lg:aspect-auto shrink-0 bg-gray-100 overflow-hidden">
            {thumbnail_url ? (
              <img
                src={thumbnail_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-48 flex items-center justify-center bg-linear-to-br from-violet-100 to-indigo-100">
                <BookOpen className="w-16 h-16 text-violet-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 flex flex-col justify-between gap-4">
            <div>
              {/* Status + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {statusStyle.label}
                </span>
                {is_bestseller ? (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "#FEF3C7", color: "#92400E" }}
                  >
                    Bestseller
                  </span>
                ) : null}
                {category && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#EDE9FE", color: "#7C3AED" }}
                  >
                    {category}
                  </span>
                )}
                <span className="text-xs text-gray-400 capitalize">{level}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
              )}

              {/* Rating row — uses courses.average_rating */}
              {average_rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(average_rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    {Number(average_rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({review_count?.toLocaleString()} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Meta footer */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400 pt-3 border-t border-gray-100">
              {total_duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {fmtSeconds(total_duration)} total
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {total_lessons} lessons · {totalSections} sections
              </span>
              {language && (
                <span>{language}</span>
              )}
              {published_at && (
                <span>
                  Published{" "}
                  {new Date(published_at).toLocaleDateString("en-US", {
                    month: "short", year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${Number(revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="70% instructor share"
          color="#16A34A"
          bg="#D1FAE5"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={(total_students ?? 0).toLocaleString()}
          sub="Total enrolled"
          color="#7C3AED"
          bg="#EDE9FE"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={
            average_rating > 0
              ? Number(average_rating).toFixed(1)
              : "No ratings"
          }
          sub={`${review_count ?? 0} reviews`}
          color="#D97706"
          bg="#FEF3C7"
        />
        <StatCard
          icon={BookOpen}
          label="Content"
          value={`${total_lessons} lessons`}
          sub={`${totalSections} sections · ${fmtSeconds(total_duration)}`}
          color="#1D4ED8"
          bg="#DBEAFE"
        />
      </div>

      {/* ── Pricing card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Pricing
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${Number(price).toFixed(2)}
            </span>
            {original_price && original_price > price && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ${Number(original_price).toFixed(2)}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#FEE2E2", color: "#DC2626" }}
                >
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.editCourse(id))}
        >
          Edit Pricing
        </Button>
      </div>

      {/* ── Curriculum ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Course Curriculum
          </h2>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              navigate(ROUTES.INSTRUCTOR_ADD_LESSON, {
                state: { courseId: id, courseTitle: title },
              })
            }
          >
            Add Lesson
          </Button>
        </div>

        {curriculum.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <EmptyState
              icon={<BookOpen className="w-7 h-7" />}
              title="No content yet"
              description="Start building your course by adding sections and lessons."
              action={() =>
                navigate(ROUTES.INSTRUCTOR_ADD_LESSON, {
                  state: { courseId: id, courseTitle: title },
                })
              }
              actionLabel="Add First Lesson"
            />
          </div>
        ) : (
          /* Sections sorted by order_index from sections table */
          <div className="space-y-3">
            {[...curriculum]
              .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map((section, idx) => (
                <SectionAccordion
                  key={section.id}
                  section={section}
                  defaultOpen={idx === 0}
                  onEditLesson={(lesson) =>
                    navigate(
                      `${ROUTES.INSTRUCTOR_ADD_LESSON}?lessonId=${lesson.id}`,
                      { state: { courseId: id, lesson } }
                    )
                  }
                  onDeleteLesson={(lessonId) =>
                    setDeleteLessonId(lessonId)
                  }
                />
              ))}
          </div>
        )}
      </div>

      {/* ── Delete lesson confirm dialog ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteLessonId}
        onClose={() => setDeleteLessonId(null)}
        onConfirm={handleDeleteLesson}
        isLoading={deleting}
        title="Delete this lesson?"
        message="This will permanently remove the lesson and any student progress associated with it. This action cannot be undone."
        confirmText="Delete Lesson"
        variant="danger"
      />
    </div>
  );
};

export default InstructorCourseDetailPage;