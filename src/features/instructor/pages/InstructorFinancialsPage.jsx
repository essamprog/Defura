import { useState, useEffect } from "react";
import { Wallet, Clock, TrendingUp, ArrowDownToLine, Filter, ChevronDown } from "lucide-react";
import instructorService from "../services/instructorService";
import { Spinner } from "@/components/ui";

const STAT_CARDS = (summary) => [
  { Icon: Wallet,          bg:"#EDE9FE", color:"#7C3AED", label:"AVAILABLE BALANCE", value:`$${summary?.availableBalance?.toLocaleString() ?? 0}`,  badge:"Available", badgeBg:"#F0FDF4", badgeColor:"#16A34A" },
  { Icon: Clock,           bg:"#FEF3C7", color:"#D97706", label:"PENDING BALANCE",   value:`$${summary?.pendingBalance?.toLocaleString() ?? 0}`,   badge:"7d Hold",   badgeBg:"#FEF9C3", badgeColor:"#D97706" },
  { Icon: TrendingUp,      bg:"#EDE9FE", color:"#7C3AED", label:"TOTAL EARNINGS",    value:`$${summary?.totalEarnings?.toLocaleString() ?? 0}`,  badge:"+8.1%",     badgeBg:"#F0FDF4", badgeColor:"#16A34A" },
  { Icon: ArrowDownToLine, bg:"#EDE9FE", color:"#7C3AED", label:"TOTAL WITHDRAWN",   value:`$${summary?.totalWithdrawn?.toLocaleString() ?? 0}`,  badge:null,        badgeBg:null,      badgeColor:null },
];

const PAYMENT_METHODS = ["Vodafone Cash", "InstaPay", "Bank Transfer"];

const WITHDRAWAL_STATUS = {
  pending:  { color:"#D97706", bg:"#FEF9C3" },
  approved: { color:"#7C3AED", bg:"#EDE9FE" },
  paid:     { color:"#16A34A", bg:"#F0FDF4" },
  rejected: { color:"#DC2626", bg:"#FEF2F2" },
};

const TYPE_STYLES = {
  Sale:   { color:"#16A34A", bg:"#F0FDF4" },
  Refund: { color:"#DC2626", bg:"#FEF2F2" },
  Payout: { color:"#7C3AED", bg:"#EDE9FE" },
};

const STATUS_DOT = {
  pending:  "#D97706",
  matured:  "#16A34A",
  refunded: "#DC2626",
  completed:"#16A34A",
  paid:     "#16A34A",
};

const fieldCls =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all";

const InstructorFinancialsPage = () => {
  const [data, setData] = useState({ summary: {}, transactions: [], withdrawals: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [amount,      setAmount]      = useState("0.00");
  const [method,      setMethod]      = useState(PAYMENT_METHODS[0]);
  const [account,     setAccount]     = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      const res = await instructorService.getFinancials();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleWithdraw = async () => {
    setError(null);
    setSuccess(null);
    if (!amount || parseFloat(amount) < 100) {
      setError("Minimum withdrawal amount is 100.");
      return;
    }
    setWithdrawing(true);
    try {
      await instructorService.submitWithdrawal({
        amount: parseFloat(amount),
        method,
        account_detail: account,
        currency: "USD", // Backend uses USD/EGP. Adjust as necessary. Let's send USD to match UI.
      });
      setSuccess("Withdrawal request submitted successfully.");
      setAmount("0.00");
      setAccount("");
      fetchFinancials();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to submit withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (isLoading && !data.summary.totalEarnings) {
    return (
      <div className="flex justify-center items-center py-32 min-h-screen" style={{ background: "#F8F7FF" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "#F8F7FF", fontFamily: "'DM Sans','Inter',sans-serif" }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">Financial Management</h2>
          <p className="text-sm text-gray-500">Manage your earnings, payouts, and revenue streams.</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
        >
          <Wallet className="w-4 h-4" style={{ color: "#7C3AED" }} />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Lifetime Earnings
          </span>
          <span className="font-bold text-gray-900">${data.summary?.lifetimeEarnings?.toLocaleString() ?? 0}</span>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS(data.summary).map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              {card.badge && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: card.badgeBg, color: card.badgeColor }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Withdraw + Transactions ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

        {/* Withdraw Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-5">Withdraw Funds</h3>

          {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-600 mb-4 bg-green-50 p-2 rounded-lg">{success}</p>}

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={fieldCls + " pr-14"}
                min="100"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                USD
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: $100</p>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Method</label>
            <div className="relative">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className={fieldCls + " appearance-none pr-9 cursor-pointer"}
              >
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Account Details */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Account Details</label>
            <input
              type="text"
              placeholder="Mobile Number or Username"
              value={account}
              onChange={e => setAccount(e.target.value)}
              className={fieldCls}
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
            style={{ background: "#6D28D9" }}
          >
            {withdrawing ? "Processing…" : "Withdraw Funds"}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Funds are usually processed within 24–48 hours.
          </p>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">Transaction History</h3>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-5 gap-2 mb-3 px-1">
            {["DATE","DESCRIPTION","TYPE","EARNINGS","STATUS"].map(h => (
              <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
            ))}
          </div>

          <div className="space-y-1">
            {data.transactions.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">No transactions found.</p>
            ) : (
              data.transactions.map((tx, i) => {
                const ts  = TYPE_STYLES[tx.type] ?? TYPE_STYLES.Sale;
                const dot = STATUS_DOT[tx.status] ?? "#6B7280";
                return (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{tx.date}</p>
                      <p className="text-[10px] text-gray-400">{tx.time}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{tx.course}</p>
                      <p className="text-[10px] text-gray-400">{tx.description}</p>
                    </div>
                    <div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: ts.bg, color: ts.color }}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: tx.netAmount < 0 ? "#DC2626" : "#1F2937" }}>
                      {tx.netAmount > 0 ? "+" : ""}{tx.netAmount.toLocaleString()} {tx.currency}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                      <span className="text-xs font-semibold capitalize" style={{ color: dot }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Withdrawal Tracking ───────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-5">Withdrawal Tracking</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["REQUEST ID","AMOUNT","METHOD","REQUESTED DATE","STATUS"].map(h => (
                  <th
                    key={h}
                    className="pb-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-sm text-gray-400">No withdrawals found.</td>
                </tr>
              ) : (
                data.withdrawals.map(w => {
                  const s = WITHDRAWAL_STATUS[w.status] ?? WITHDRAWAL_STATUS.pending;
                  return (
                    <tr
                      key={w.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 text-sm font-mono font-semibold text-gray-700">{w.id}</td>
                      <td className="py-3.5 text-sm font-bold text-gray-900">{w.amount}</td>
                      <td className="py-3.5 text-sm text-gray-600">{w.method} - {w.accountDetail}</td>
                      <td className="py-3.5 text-sm text-gray-500">{w.date}</td>
                      <td className="py-3.5">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {w.status}
                        </span>
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

export default InstructorFinancialsPage;