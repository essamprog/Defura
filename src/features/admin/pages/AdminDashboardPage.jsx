import { Users, BookOpen, DollarSign, ShoppingBag, TrendingUp, UserCheck, UserX, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Spinner } from "@/components/ui";
import { ROUTES } from "@/constants";
import useAdmin from "../hooks/useAdmin";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ORDER_VARIANT = { completed:"success", pending:"warning", refunded:"danger" };

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { stats, users, orders, monthlyChart, isLoading } = useAdmin();

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  const CARDS = [
    { icon: Users,       label:"Total Users",     value: stats?.totalUsers?.toLocaleString() ?? 0,    sub:`${stats?.totalInstructors ?? 0} instructors`, color:"text-blue-600",    bg:"bg-blue-50" },
    { icon: BookOpen,    label:"Total Courses",    value: stats?.totalCourses ?? 0,                    sub:`${stats?.pendingCourses ?? 0} pending review`,color:"text-indigo-600",  bg:"bg-indigo-50" },
    { icon: DollarSign,  label:"Platform Revenue", value:`$${((stats?.totalRevenue ?? 0)/1000).toFixed(0)}`, sub:"Total completed", color:"text-emerald-600", bg:"bg-emerald-50" },
    { icon: ShoppingBag, label:"Total Orders",     value: stats?.totalOrders?.toLocaleString() ?? 0,   sub:"Overall",   color:"text-amber-600",   bg:"bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and key metrics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${c.color}`} /></div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Growth chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">User Growth & Revenue — 2024</h2>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Strong growth</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChart} barSize={14} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #f3f4f6", fontSize:12 }} />
              <Bar yAxisId="left"  dataKey="users"   fill="#dbeafe" name="New Users"  radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#2563eb" name="Revenue"    radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Recent Users</h2>
            <button onClick={() => navigate(ROUTES.ADMIN_USERS)} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {users.slice(0, 5).map(u => (
              <div key={u._id} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 overflow-hidden`}>
                  {u.profile_picture ? <img src={u.profile_picture} alt="" className="w-full h-full object-cover" /> : (u.full_name?.charAt(0) || u.email?.charAt(0) || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{u.full_name || u.email}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{u.role}</p>
                </div>
                <Badge variant={u.status === "active" ? "success" : "danger"} size="sm">{u.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
          <button onClick={() => navigate(ROUTES.ADMIN_ORDERS)} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3 text-left font-semibold">Student</th>
              <th className="px-4 py-3 text-left font-semibold">Course</th>
              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-700 font-medium">{o.user}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]"><span className="line-clamp-1">{o.course}</span></td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">${o.amount}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{o.date}</td>
                  <td className="px-4 py-3"><Badge variant={ORDER_VARIANT[o.status]} size="sm" dot className="capitalize">{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;