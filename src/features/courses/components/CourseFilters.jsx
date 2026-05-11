import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui";

const CourseFilters = ({
  CATEGORIES, LEVELS,
  category, setCategory,
  level, setLevel,
  priceRange, setPriceRange,
  onReset,
  activeCount = 0,
}) => {
  const SectionTitle = ({ children }) => (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
      {children}
    </p>
  );

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-7">
        {/* ── Category ────────────────────────────────────────── */}
        <div>
          <SectionTitle>Category</SectionTitle>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={[
                  "text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 font-medium",
                  category === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Level ───────────────────────────────────────────── */}
        <div>
          <SectionTitle>Level</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {LEVELS.map(lvl => (
              <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="level"
                  value={lvl}
                  checked={level === lvl}
                  onChange={() => setLevel(lvl)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className={`text-sm transition-colors ${level === lvl ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-700"}`}>
                  {lvl}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Price Range ─────────────────────────────────────── */}
        <div>
          <SectionTitle>Max Price</SectionTitle>
          <div className="space-y-3">
            <input
              type="range"
              min={0} max={250} step={5}
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Free</span>
              <span className="font-semibold text-gray-800">
                {priceRange[1] >= 250 ? "Any price" : `Up to $${priceRange[1]}`}
              </span>
            </div>
          </div>

          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[0, 50, 100, 150].map(max => (
              <button
                key={max}
                onClick={() => setPriceRange([0, max === 0 ? 250 : max])}
                className={[
                  "text-xs px-2.5 py-1 rounded-full border transition-all duration-150",
                  priceRange[1] === (max === 0 ? 250 : max)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300",
                ].join(" ")}
              >
                {max === 0 ? "Any" : `<$${max}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Rating ──────────────────────────────────────────── */}
        <div>
          <SectionTitle>Min Rating</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {[4.5, 4.0, 3.5].map(r => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" />
                <div className="flex items-center gap-1">
                  {"★★★★★".slice(0, Math.round(r)).split("").map((star, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{r}+</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CourseFilters;