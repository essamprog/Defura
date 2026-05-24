// ─── InstructorRevenuePage ────────────────────────────────────────────────────
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import useInstructor from "../hooks/useInstructor";
import { Spinner } from "@/components/ui";
import { DollarSign, TrendingUp, Users, Star, Building2, BadgePercent } from "lucide-react";

const PLATFORM_COMMISSION = 0.30; // 30% للمنصة
const INSTRUCTOR_SHARE = 0.70; // 70% للمدرب

const InstructorRevenuePage = () => {
  const { stats, revenue, isLoading } = useInstructor();

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  // الإيراد الإجمالي (100%) — هو totalEarnings = gross_revenue من الباك-إند
  const grossTotal = stats?.revenue ?? 0;
  const instructorNet = parseFloat((grossTotal * INSTRUCTOR_SHARE).toFixed(2));
  const platformFee = parseFloat((grossTotal * PLATFORM_COMMISSION).toFixed(2));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Revenue &amp; Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "This Month", value: `$${(revenue[revenue.length - 1]?.amount ?? 0).toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: DollarSign, label: "Total Earned", value: `$${instructorNet.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Users, label: "Total Students", value: stats?.students ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: Star, label: "Avg Rating", value: stats?.avgRating ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${c.color}`} /></div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Revenue Breakdown ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BadgePercent className="w-5 h-5 text-violet-600" />
          <h2 className="text-sm font-bold text-gray-900">Revenue Breakdown</h2>
        </div>

        {/* Total gross */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500">Gross Sales</span>
          <span className="text-base font-bold text-gray-900">${grossTotal.toLocaleString()}</span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-4 rounded-full overflow-hidden bg-gray-100 mb-5">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all"
            style={{ width: `${INSTRUCTOR_SHARE * 100}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-400 to-rose-300 rounded-r-full transition-all"
            style={{ width: `${PLATFORM_COMMISSION * 100}%` }}
          />
        </div>

        {/* Two boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instructor share */}
          <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">Your Share (70%)</p>
              <p className="text-xl font-bold text-emerald-800">${instructorNet.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 mt-1">
                Your net earnings after platform fee
              </p>
            </div>
          </div>

          {/* Platform commission */}
          <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-4 border border-rose-100">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide mb-0.5">Platform Fee (30%)</p>
              <p className="text-xl font-bold text-rose-800">${platformFee.toLocaleString()}</p>
              <p className="text-[10px] text-rose-600 mt-1">
                Platform earnings for service
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400" />
            Your Share ({INSTRUCTOR_SHARE * 100}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-rose-400" />
            Platform Fee ({PLATFORM_COMMISSION * 100}%)
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-5">Monthly Revenue (Your 70%) — 2024</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => [`$${v}`, "Your Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }} />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { InstructorRevenuePage };
export default InstructorRevenuePage;