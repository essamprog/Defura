import { ChevronRight, ChevronLeft } from "lucide-react";

const getPageRange = (current, total, delta = 2) => {
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("...");
  if (total > 1) range.push(total);

  return range;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages);
  const from = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const to = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  const btnBase =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  return (
    <div className={["flex flex-wrap items-center justify-between gap-3", className].filter(Boolean).join(" ")}>
      {/* Info */}
      {showInfo && totalItems && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{from}–{to}</span> of{" "}
          <span className="font-medium text-gray-700">{totalItems}</span> results
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 mr-auto">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={[btnBase, "text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"].join(" ")}
          aria-label="Previous page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Pages */}
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={[
                btnBase,
                page === currentPage
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100",
              ].join(" ")}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={[btnBase, "text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"].join(" ")}
          aria-label="Next page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;