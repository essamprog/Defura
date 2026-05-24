import { useState, useEffect } from "react";
import {
  Search, MoreVertical,
  ChevronLeft, ChevronRight,
  CheckCircle, Users, Monitor, Star,
} from "lucide-react";
import instructorService from "../services/instructorService";
import { Spinner } from "@/components/ui";

const STAT_CARDS = (stats) => [
  { Icon: CheckCircle, bg:"#EDE9FE", color:"#7C3AED", label:"TOTAL ENROLLED",     value: stats?.totalEnrolled ?? 0 },
  { Icon: Users,       bg:"#EDE9FE", color:"#7C3AED", label:"NEW TODAY",          value: stats?.newToday ?? 0   },
  { Icon: Monitor,     bg:"#EDE9FE", color:"#7C3AED", label:"COURSE COMPLETIONS", value: stats?.courseCompletions ?? 0   },
  { Icon: Star,        bg:"#EDE9FE", color:"#7C3AED", label:"AVERAGE RATING",     value: stats?.avgRating ?? 0   },
];

const STATUS_STYLES = {
  in_progress: { label:"In Progress", color:"#7C3AED", bg:"#EDE9FE", dot:"#7C3AED" },
  completed:  { label:"Completed",   color:"#065F46", bg:"#D1FAE5", dot:"#16A34A" },
  refunded:   { label:"Refunded",    color:"#7C3AED", bg:"#EDE9FE", dot:"#7C3AED" },
  banned:     { label:"Banned",      color:"#DC2626", bg:"#FEE2E2", dot:"#DC2626" },
  active:     { label:"Active",      color:"#7C3AED", bg:"#EDE9FE", dot:"#7C3AED" }, // fallback
};

const PROGRESS_COLORS = {
  in_progress: "#7C3AED",
  completed:  "#16A34A",
  refunded:   "#D1D5DB",
  banned:     "#D1D5DB",
};

const InstructorStudentsPage = () => {
  const [search,   setSearch]   = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [page,     setPage]     = useState(1);
  const [data,     setData]     = useState({ students: [], stats: {}, pagination: {} });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async (currentPage, searchQuery) => {
    setIsLoading(true);
    try {
      const res = await instructorService.getStudents({
        page: currentPage,
        per_page: 10,
        search: searchQuery || undefined,
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchStudents(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  if (isLoading && data.students.length === 0) {
    return (
      <div className="flex justify-center items-center py-32 min-h-screen" style={{ background: "#F4F3FF" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const { students, stats, pagination } = data;

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "#F4F3FF", fontFamily: "'DM Sans','Inter',sans-serif" }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-0.5">Student Directory</h2>
        <p className="text-sm text-gray-500">Real-time enrollment tracking and student management.</p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS(stats).map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: card.bg }}
            >
              <card.Icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Student Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Enrolled Students</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students in courses..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["STUDENT NAME","COURSE NAME","ENROLLMENT DATE","PROGRESS","PRICE PAID","ACTIONS"].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-sm text-gray-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const progressColor = PROGRESS_COLORS[student.status] ?? "#7C3AED";
                  // Unique key based on enrollment since student can be in multiple courses
                  const rowKey = student.enrollment_id ?? idx;

                  return (
                    <tr
                      key={rowKey}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Student Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-500 text-xs">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name || student.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (student.name || student.full_name || "?").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{student.name || student.full_name}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium">{student.course}</p>
                      </td>

                      {/* Enrollment Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{student.enrollDate}</p>
                      </td>

                      {/* Progress */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${student.progress}%`, background: progressColor }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {student.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Price Paid */}
                      <td className="px-6 py-4">
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center justify-center w-fit gap-1 shadow-sm shrink-0"
                          style={{
                            background: student.pricePaid > 0 ? "#ECFDF5" : "#F3F4F6",
                            color: student.pricePaid > 0 ? "#059669" : "#4B5563",
                            borderColor: student.pricePaid > 0 ? "#A7F3D0" : "#E5E7EB"
                          }}
                        >
                          {student.pricePaid > 0 ? `$${Number(student.pricePaid).toFixed(2)}` : "Free"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === rowKey ? null : rowKey)
                            }
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenu === rowKey && (
                            <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-40">
                              {["View Profile", "Send Message", "Remove Student"].map((label, actionIdx) => (
                                <button
                                  key={label}
                                  onClick={() => setOpenMenu(null)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                    actionIdx === 2 ? "text-red-500" : "text-gray-700"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * pagination.per_page + 1}–{Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} students
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 font-medium px-2">{page}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudentsPage;