import { useState, useEffect } from "react";
import { Search, ChevronDown, RefreshCw, ShoppingCart } from "lucide-react";
import { Badge, Pagination, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/common";
import adminService from "../services/adminService";

const STATUS_VARIANT = { completed:"success", pending:"warning", refunded:"info", failed:"danger" };
const STATUSES = ["All Status", "completed", "pending", "refunded", "failed"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await adminService.getOrders();
        setOrders(res.data?.orders ?? res.data ?? []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [page,   setPage]   = useState(1);
  const PER = 6;

  const filtered  = orders.filter(o =>
    (o.user.toLowerCase().includes(search.toLowerCase()) || o._id.toLowerCase().includes(search.toLowerCase())) &&
    (status === "All Status" || o.status === status)
  );
  const paginated  = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);

  const totalRevenue  = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.amount, 0);
  const totalRefunded = orders.filter(o => o.status === "refunded").reduce((s, o) => s + o.amount, 0);

  const issueRefund = (id) =>
    setOrders(p => p.map(o => o._id === id ? { ...o, status:"refunded" } : o));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Orders & Transactions</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Total Orders",    value: orders.length,                                            color:"text-gray-900" },
          { label:"Revenue",         value:`$${totalRevenue.toLocaleString()}`,                       color:"text-emerald-600" },
          { label:"Pending",         value: orders.filter(o => o.status === "pending").length,        color:"text-amber-600" },
          { label:"Refunded",        value:`$${totalRefunded}`,                                       color:"text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or order ID..." className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="relative">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 text-left font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Method</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{o._id}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{o.user}</p>
                    <p className="text-xs text-gray-400">{o.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[160px]"><span className="line-clamp-1">{o.course}</span></td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">${o.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{o.method}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{o.date}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_VARIANT[o.status]} size="sm" dot className="capitalize">{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    {o.status === "completed" && (
                      <button onClick={() => issueRefund(o._id)} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 px-2 py-1 rounded-lg transition-all">
                        <RefreshCw className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showInfo totalItems={filtered.length} itemsPerPage={PER} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;