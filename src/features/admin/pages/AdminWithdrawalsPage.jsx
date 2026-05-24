import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, Wallet, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const STATUS_STYLE = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  approved: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Approved" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Paid" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
};

const money = (value, currency = "USD") =>
  `${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

const AdminWithdrawalsPage = () => {
  const [searchParams] = useSearchParams();
  const selectedRequest = searchParams.get("request");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(ENDPOINTS.ADMIN.WITHDRAWALS);
      setWithdrawals(res.data?.withdrawals ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    return withdrawals.reduce(
      (acc, w) => {
        acc.pending += w.status === "pending" ? 1 : 0;
        acc.requested += ["pending", "approved"].includes(w.status) ? Number(w.amount) : 0;
        acc.paid += w.status === "paid" ? Number(w.amount) : 0;
        return acc;
      },
      { pending: 0, requested: 0, paid: 0 }
    );
  }, [withdrawals]);

  const runAction = async (id, action) => {
    setActionLoading(`${id}:${action}`);
    setError(null);
    try {
      await api.patch(ENDPOINTS.ADMIN.WITHDRAWALS, { id, action });
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update withdrawal.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review instructor payout requests and verify available balances before payment.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <Clock className="w-5 h-5 text-amber-600 mb-3" />
          <p className="text-xs font-bold text-gray-400 tracking-widest">PENDING REQUESTS</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totals.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <Wallet className="w-5 h-5 text-indigo-600 mb-3" />
          <p className="text-xs font-bold text-gray-400 tracking-widest">REQUESTED FUNDS</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{money(totals.requested)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 mb-3" />
          <p className="text-xs font-bold text-gray-400 tracking-widest">PAID OUT</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{money(totals.paid)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Request", "Instructor", "Requested", "Current Balance", "Reserved", "Method", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-sm text-gray-400">
                    No withdrawal requests yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const style = STATUS_STYLE[w.status] ?? STATUS_STYLE.pending;
                  const highlighted = String(w.id) === String(selectedRequest);
                  const canApprove = w.status === "pending" && w.isAvailable;
                  const canPay = w.status === "approved" && w.isAvailable;

                  return (
                    <tr key={w.id} className={`border-b border-gray-50 last:border-0 ${highlighted ? "bg-blue-50/50" : "hover:bg-gray-50/60"}`}>
                      <td className="px-4 py-4">
                        <p className="font-mono text-sm font-bold text-gray-800">{w.displayId}</p>
                        <p className="text-[11px] text-gray-400">{new Date(w.requestedAt).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{w.instructorName}</p>
                        <p className="text-xs text-gray-400">{w.instructorEmail}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-gray-900">{money(w.amount, w.currency)}</p>
                        {["pending", "approved"].includes(w.status) && (
                          <p className={`text-xs font-semibold ${w.isAvailable ? "text-emerald-600" : "text-red-600"}`}>
                            {w.isAvailable ? "Available" : "Not available"}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {money(w.balance?.availableBalance, w.currency)}
                        <p className="text-[11px] text-gray-400">Gross {money(w.balance?.grossAvailable, w.currency)}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {money(w.balance?.reservedWithdrawals, w.currency)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{w.method}</p>
                        <p className="text-xs text-gray-400">{w.accountDetail}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {w.status === "pending" && (
                            <>
                              <button
                                disabled={!canApprove || actionLoading === `${w.id}:approve`}
                                onClick={() => runAction(w.id, "approve")}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                              <button
                                disabled={actionLoading === `${w.id}:reject`}
                                onClick={() => runAction(w.id, "reject")}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {w.status === "approved" && (
                            <button
                              disabled={!canPay || actionLoading === `${w.id}:mark_paid`}
                              onClick={() => runAction(w.id, "mark_paid")}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Mark Paid
                            </button>
                          )}
                          {!["pending", "approved"].includes(w.status) && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              {w.status === "paid" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              Closed
                            </span>
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
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;
