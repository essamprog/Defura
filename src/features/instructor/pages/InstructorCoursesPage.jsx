import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, MoreVertical, BookOpen, Star,
  Wallet, Clock, TrendingUp, GraduationCap,
  ChevronLeft, ChevronRight, Eye, Edit, Trash2,
} from "lucide-react";
import { ROUTES } from "@/constants";
import useInstructor from "../hooks/useInstructor";
import { Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/common";

const STAT_CARDS = (stats) => [
  {
    Icon: Wallet,
    bg: "#EDE9FE", color: "#7C3AED",
    label: "AVAILABLE BALANCE",
    value: `$${stats?.revenue?.toLocaleString() ?? 0}`,
    badge: "Available", badgeBg: "#F0FDF4", badgeColor: "#16A34A",
  },
  {
    Icon: Clock,
    bg: "#FEF3C7", color: "#D97706",
    label: "PENDING BALANCE",
    value: "$0", // API doesn't provide pending in dashboard stats easily, but we can mock or use 0
    badge: "7d Hold", badgeBg: "#FEF9C3", badgeColor: "#D97706",
  },
  {
    Icon: TrendingUp,
    bg: "#EDE9FE", color: "#7C3AED",
    label: "TOTAL EARNINGS",
    value: `$${stats?.revenue?.toLocaleString() ?? 0}`,
    badge: "+8.1%", badgeBg: "#F0FDF4", badgeColor: "#16A34A",
  },
  {
    Icon: GraduationCap,
    bg: "#EDE9FE", color: "#7C3AED",
    label: "TOTAL COURSES",
    value: stats?.courses ?? 0,
    badge: "Active", badgeBg: "#EDE9FE", badgeColor: "#7C3AED",
  },
];

const StatusBadge = ({ status }) => {
  let s = { bg: "#FEF9C3", color: "#854D0E", label: "Draft" };
  
  if (status === "published" || status === "live") {
    s = { bg: "#D1FAE5", color: "#065F46", label: "Published" };
  } else if (status === "pending" || status === "under_review") {
    s = { bg: "#FEF3C7", color: "#D97706", label: "Pending" };
  } else if (status === "archived") {
    s = { bg: "#F3F4F6", color: "#374151", label: "Archived" };
  }

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const InstructorCoursesPage = () => {
  const navigate = useNavigate();
  const { stats, courses, isLoading, deleteCourse, refreshCourses } = useInstructor();
  const [openMenu, setOpenMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refreshCourses({ page, per_page: 10 });
  }, [page, refreshCourses]);

  const confirmDelete = async () => {
    setDeleting(true);
    await deleteCourse(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center py-32 min-h-screen" style={{ background: "#F0EFFF" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "#F0EFFF", fontFamily: "'DM Sans','Inter',sans-serif" }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <h1
          className="font-bold text-gray-900 leading-tight"
          style={{ fontSize: "2.5rem" }}
        >
          Course<br />Management
        </h1>
        <button
          onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE_COURSE)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-all"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS(stats).map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: card.badgeBg, color: card.badgeColor }}
              >
                {card.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-1">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Courses Table ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* Table top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Active Courses</h2>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-lg" style={{ color: "#7C3AED" }}>{stats?.courses ?? 0}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Course Name", "Status", "Rating", "Students", "Content", "Price", "Actions"].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-400 tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr
                  key={course.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Course Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={course.thumbnail ?? course.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {course.status === "draft"
                            ? `Draft – Last edited ${course.lastUpdated ?? course.lastEdited}`
                            : `Published ${course.publishedAt}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={course.status} />
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    {course.rating ? (
                      <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Students */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1.5">
                      {course.students?.toLocaleString() ?? 0}
                    </p>
                    <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((course.students ?? 0) / (course.studentsMax ?? 1000)) * 100}%`,
                          background: course.status === "draft" ? "#D1D5DB" : "#7C3AED",
                        }}
                      />
                    </div>
                  </td>

                  {/* Content */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      {course.lessons} Lessons
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ${course.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === course._id ? null : course._id)
                        }
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === course._id && (
                        <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-36">
                          {[
                            { label: "Preview", Icon: Eye,    action: () => navigate(ROUTES.courseDetail(course._id)) },
                            { label: "Edit",    Icon: Edit,   action: () => navigate(ROUTES.editCourse(course._id)) },
                            { label: "Delete",  Icon: Trash2, action: () => setDeleteId(course._id), danger: true },
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => { item.action(); setOpenMenu(null); }}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left ${
                                item.danger ? "text-red-500" : "text-gray-700"
                              }`}
                            >
                              <item.Icon className="w-3.5 h-3.5" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">Showing courses page {page}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-medium px-2">{page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete this course?"
        message="This will permanently remove the course and all its content. Students will lose access immediately. This cannot be undone."
        confirmText="Delete Course"
        variant="danger"
      />
    </div>
  );
};

export default InstructorCoursesPage;