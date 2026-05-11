// ─── InstructorRevenuePage ────────────────────────────────────────────────────
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import useInstructor from "../hooks/useInstructor";
import { Spinner } from "@/components/ui";
import { DollarSign, TrendingUp, Users, Star } from "lucide-react";

const InstructorRevenuePage = () => {
  const { stats, revenue, isLoading } = useInstructor();

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Revenue & Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total Earned",    value: `$${stats?.revenue?.toLocaleString() ?? 0}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: TrendingUp, label: "This Month",      value: `$${(revenue[revenue.length - 1]?.amount ?? 0).toLocaleString()}`,  color: "text-blue-600",    bg: "bg-blue-50"    },
          { icon: Users,      label: "Total Students",  value: stats?.students ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: Star,       label: "Avg Rating",      value: stats?.avgRating ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
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

      {/* Charts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-5">Monthly Revenue — 2024</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => [`$${v}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }} />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { InstructorRevenuePage };
export default InstructorRevenuePage;