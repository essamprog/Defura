import { useState } from "react";
import {
  Search, LayoutGrid, List, ChevronDown,
  SlidersHorizontal, X, BookOpen,
} from "lucide-react";
import { Spinner, Pagination } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { resolveMediaUrl, COURSE_PLACEHOLDER } from "@/utils";
import CourseCard from "../components/CourseCard";
import CourseFilters from "../components/CourseFilters";
import useCourses from "../hooks/useCourses";

const CoursesPage = () => {
  const {
    courses, totalCourses, isLoading,
    search, setSearch,
    category, setCategory,
    level, setLevel,
    sort, setSort,
    priceRange, setPriceRange,
    page, setPage, totalPages,
    resetFilters,
    CATEGORIES, LEVELS, SORT_OPTIONS,
  } = useCourses();

  const [viewMode,      setViewMode]      = useState("grid");
  const [filtersOpen,   setFiltersOpen]   = useState(false);

  const activeFilterCount = [
    category !== "All",
    level !== "All Levels",
    priceRange[1] < 250,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Explore Courses</h1>
          <p className="text-gray-500 text-base">
            {totalCourses.toLocaleString()} courses to advance your IT career
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mt-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses, skills, or instructors..."
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Desktop Filters Sidebar ──────────────────────────── */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <CourseFilters
                CATEGORIES={CATEGORIES} LEVELS={LEVELS}
                category={category} setCategory={setCategory}
                level={level} setLevel={setLevel}
                priceRange={priceRange} setPriceRange={setPriceRange}
                onReset={resetFilters} activeCount={activeFilterCount}
              />
            </div>
          </div>

          {/* ── Main Content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Active filter chips */}
                {category !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
                    {category}
                    <button onClick={() => setCategory("All")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {level !== "All Levels" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
                    {level}
                    <button onClick={() => setLevel("All Levels")}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* View toggle */}
                <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
                  {[
                    { mode: "grid", Icon: LayoutGrid },
                    { mode: "list", Icon: List },
                  ].map(({ mode, Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={[
                        "w-9 h-9 flex items-center justify-center transition-colors",
                        viewMode === mode ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600",
                      ].join(" ")}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center items-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-400">Loading courses...</p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-4">
                <EmptyState
                  icon={<BookOpen className="w-8 h-8" />}
                  title="No courses found"
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={resetFilters}
                  actionLabel="Clear all filters"
                />
              </div>
            ) : (
              <>
                {/* Grid / List */}
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }>
                  {courses.map(course =>
                    viewMode === "grid" ? (
                      <CourseCard key={course._id} course={course} />
                    ) : (
                      /* List row */
                      <div
                        key={course._id}
                        onClick={() => {}}
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-48 shrink-0 overflow-hidden bg-gray-100">
                          <img
                            src={resolveMediaUrl(course.thumbnail ?? course.thumbnail_url ?? course.image) ?? COURSE_PLACEHOLDER}
                            alt={course.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = COURSE_PLACEHOLDER;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 mb-2 inline-block">{course.category}</span>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                            <p className="text-xs text-gray-400 mb-2">{course.instructor?.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-amber-600">{course.rating}</span>
                              {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= Math.round(course.rating) ? "text-amber-400" : "text-gray-200"}`}>★</span>)}
                              <span className="text-xs text-gray-400">({course.reviewCount?.toLocaleString()})</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold text-gray-900">${course.price}</span>
                              {course.originalPrice && <span className="text-xs text-gray-400 line-through">${course.originalPrice}</span>}
                            </div>
                            <span className="text-xs text-blue-600 font-medium">{course.level}</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      showInfo
                      totalItems={totalCourses}
                      itemsPerPage={8}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filters Drawer ─────────────────────────────── */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold text-gray-900">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <CourseFilters
              CATEGORIES={CATEGORIES} LEVELS={LEVELS}
              category={category} setCategory={setCategory}
              level={level} setLevel={setLevel}
              priceRange={priceRange} setPriceRange={setPriceRange}
              onReset={resetFilters} activeCount={activeFilterCount}
            />
            <button onClick={() => setFiltersOpen(false)} className="mt-6 w-full h-11 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Show {totalCourses} Results
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CoursesPage;