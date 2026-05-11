import { useNavigate } from "react-router-dom";
import { DollarSign, Users, BookOpen, Star, TrendingUp, Plus, Edit, Trash2, Eye, ArrowRight } from "lucide-react";
import { Button, Badge, Spinner, ProgressBar } from "@/components/ui";
import { ConfirmDialog } from "@/components/common";
import { ROUTES } from "@/constants";
import { useState } from "react";
import useInstructor from "../hooks/useInstructor";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const toFiniteNumber = (value, fallback = 0) => {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : fallback;
};

const formatNumber = (value, fallback = 0) => toFiniteNumber(value, fallback).toLocaleString();
const formatMoney = (value, fallback = 0) => `$${formatNumber(value, fallback)}`;

const STAT_CARDS = (stats) => [
  { icon: DollarSign, label: "Total Revenue",    value: formatMoney(stats?.revenue, 0),              sub: "+18% this month",     color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Users,      label: "Total Students",   value: formatNumber(stats?.students, 0),            sub: "Across all courses",  color: "text-blue-600",   bg: "bg-blue-50"    },
  { icon: BookOpen,   label: "Published Courses",value: formatNumber(stats?.courses, 0),             sub: "Active & earning",    color: "text-indigo-600", bg: "bg-indigo-50"  },
  { icon: Star,       label: "Avg. Rating",     value: stats?.avgRating ?? "—",                      sub: "From all reviews",   color: "text-amber-600",  bg: "bg-amber-50"   },
];

const STATUS_VARIANT = { published: "success", draft: "default", archived: "danger" };

const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const { stats, courses, revenue, isLoading, deleteCourse } = useInstructor();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    await deleteCourse(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500">Here's how your courses are performing.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE_COURSE)}>
          New Course
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(stats).map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + courses */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Revenue Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Monthly Revenue</h2>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +22% YoY
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                formatter={v => [`$${v}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Course Performance</h2>
          <div className="space-y-4">
            {courses.slice(0, 3).map(c => (
              <div key={c.id ?? c._id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">{c.title}</p>
                  <span className="text-xs font-bold text-gray-900 shrink-0">{formatMoney(c.revenue, 0)}</span>
                </div>
                <ProgressBar value={c.total_students ?? c.students ?? 0} max={500} height="xs" color="blue" />
                <p className="text-[10px] text-gray-400 mt-1">{c.total_students ?? c.students ?? 0} students · ⭐ {c.average_rating ?? c.rating ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Courses Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">My Courses</h2>
          <button onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700">
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Students</th>
                <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map(c => (
                <tr key={c.id ?? c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={c.thumbnail_url ?? c.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[180px]">{c.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_VARIANT[c.status] ?? 'default'} dot size="sm" className="capitalize">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{formatNumber(c.total_students ?? c.students, 0)}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatMoney(c.revenue, 0)}</td>
                  <td className="px-4 py-3.5 text-sm text-amber-600 font-semibold">⭐ {c.average_rating ?? c.rating ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(ROUTES.courseDetail(c.id ?? c._id))} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => navigate(ROUTES.editCourse(c.id ?? c._id))} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(c.id ?? c._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default InstructorDashboardPage;