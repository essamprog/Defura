import { useState, useEffect } from "react";
import {
  DollarSign, Users, BookOpen, Search, ArrowRight,
  ChevronLeft, ChevronRight, Wallet, Lock, CheckCircle, TrendingUp
} from "lucide-react";
import { Spinner, Avatar, Badge } from "@/components/ui";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const formatUSD = (val) =>
  `$${Number(val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AdminInstructorsFinancialsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalLifetimeEarnings: 0,
      totalAvailableBalance: 0,
      totalPendingBalance: 0,
      totalPendingWithdrawals: 0,
      totalPaidWithdrawals: 0,
      totalPlatformRevenue: 0,
    },
    instructors: [],
    pagination: {},
  });

  const fetchData = async (currentPage, searchQuery) => {
    setIsLoading(true);
    try {
      const { data: res } = await api.get(ENDPOINTS.ADMIN.INSTRUCTORS_FINANCIALS, {
        params: {
          page: currentPage,
          per_page: 10,
          search: searchQuery || undefined,
        },
      });
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load instructors financials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const { summary, instructors, pagination } = data;

  const STAT_CARDS = [
    {
      icon: TrendingUp,
      label: "Total Platform Sales",
      value: formatUSD(summary?.totalLifetimeEarnings),
      sub: "100% Gross sales volume",
      gradient: "from-slate-700 to-slate-800",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-slate-100",
    },
    {
      icon: DollarSign,
      label: "Platform Net Revenue",
      value: formatUSD(summary?.totalPlatformRevenue),
      sub: "30% share (after instructor cut)",
      gradient: "from-blue-600 to-indigo-600",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-blue-100",
    },
    {
      icon: Users,
      label: "Instructors Share",
      value: formatUSD((summary?.totalLifetimeEarnings ?? 0) * 0.70),
      sub: "70% lifetime earnings share",
      gradient: "from-violet-600 to-purple-600",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-violet-100",
    },
    {
      icon: Wallet,
      label: "Withdrawable Balances",
      value: formatUSD(summary?.totalAvailableBalance),
      sub: "Available in instructor wallets",
      gradient: "from-emerald-600 to-teal-600",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-emerald-100",
    },
    {
      icon: Lock,
      label: "Locked / Pending Funds",
      value: formatUSD((summary?.totalPendingBalance ?? 0) + (summary?.totalPendingWithdrawals ?? 0)),
      sub: `Pending wallet + ${formatUSD(summary?.totalPendingWithdrawals)} in queue`,
      gradient: "from-amber-500 to-orange-500",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-amber-100",
    },
    {
      icon: CheckCircle,
      label: "Total Processed Payouts",
      value: formatUSD(summary?.totalPaidWithdrawals),
      sub: "Successfully paid withdrawals",
      gradient: "from-fuchsia-600 to-pink-600",
      textClass: "text-white",
      bgClass: "bg-white/10",
      iconColor: "text-fuchsia-100",
    },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors Financials</h1>
          <p className="text-sm text-gray-500">
            Monitor earnings, withdrawable balances, and withdrawals for all platform instructors.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-6 shadow-md border border-white/15 relative overflow-hidden group`}
            >
              {/* Subtle design element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl ${card.bgClass} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-extrabold text-white leading-tight mb-2">
                {card.value}
              </p>
              <p className="text-xs text-white/75">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Directory Table Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Instructor Directory</h3>
            <p className="text-xs text-gray-400">Total {pagination.total ?? 0} instructors found</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by instructor name or email..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {isLoading && instructors.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/40">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Instructor Details
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Courses
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    Students
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Lifetime Earnings
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Withdrawable Balance
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Locked / Pending
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Paid Out
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {instructors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-sm text-gray-400">
                      No instructors found matching your filters.
                    </td>
                  </tr>
                ) : (
                  instructors.map((instructor) => (
                    <tr
                      key={instructor.id}
                      className="hover:bg-gray-50/40 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={instructor.avatar}
                            name={instructor.name || instructor.email}
                            size="md"
                            className="shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {instructor.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {instructor.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Courses */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                          {instructor.coursesCount}
                        </span>
                      </td>

                      {/* Students */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                          {instructor.totalStudents?.toLocaleString()}
                        </span>
                      </td>

                      {/* Lifetime Earnings */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-indigo-600 font-mono">
                          {formatUSD(instructor.lifetimeEarnings)}
                        </span>
                      </td>

                      {/* Withdrawable Balance */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                          {formatUSD(instructor.availableBalance)}
                        </span>
                      </td>

                      {/* Locked / Pending */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-amber-600 font-mono">
                          {formatUSD(instructor.pendingBalance + instructor.pendingWithdrawn)}
                        </span>
                        {instructor.pendingWithdrawn > 0 && (
                          <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                            ({formatUSD(instructor.pendingWithdrawn)} in payout process)
                          </p>
                        )}
                      </td>

                      {/* Paid Out */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-gray-600 font-mono">
                          {formatUSD(instructor.totalWithdrawn)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={instructor.status === "active" ? "success" : "danger"}
                          size="sm"
                          className="capitalize"
                        >
                          {instructor.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination?.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/20">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * pagination.per_page + 1}–
              {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total}{" "}
              instructors
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-700 px-3 py-1 bg-white border border-gray-100 rounded-xl shadow-xs">
                {page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
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

export default AdminInstructorsFinancialsPage;
