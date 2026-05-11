import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common";

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Table = ({
  columns,        // [{ key, label, sortable?, render?, width?, align? }]
  data    = [],
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = "No data found",
  emptyDescription = "",
  emptyAction,
  emptyActionLabel,
  className = "",
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const alignClass = (align) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <div className={["bg-white rounded-2xl border border-gray-100 overflow-hidden", className].join(" ")}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Head */}
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : {}}
                  className={[
                    "px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",
                    alignClass(col.align),
                    col.sortable ? "cursor-pointer hover:text-gray-600 select-none" : "",
                  ].join(" ")}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}>
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === "asc"
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />
                        : <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      actionLabel={emptyActionLabel}
                    />
                  </td>
                </tr>
              )
              : sorted.map((row, ri) => (
                <tr key={row._id ?? ri} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={["px-5 py-3.5 text-sm text-gray-700", alignClass(col.align)].join(" ")}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;