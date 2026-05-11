import { useState, useEffect, useCallback } from "react";
import coursesService from "../services/coursesService";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = ["All"];
const LEVELS             = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const SORT_OPTIONS = [
  { value: "popular",  label: "Most Popular" },
  { value: "rating",   label: "Highest Rated" },
  { value: "newest",   label: "Newest" },
  { value: "price-lo", label: "Price: Low to High" },
  { value: "price-hi", label: "Price: High to Low" },
];

const PER_PAGE = 8;

const useCourses = () => {
  const [courses,    setCourses]    = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [level,      setLevel]      = useState("All Levels");
  const [sort,       setSort]       = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 250]);
  const [page,       setPage]       = useState(1);

  // Fetch courses from backend API (with server-side filtering/sorting)
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        per_page: PER_PAGE,
        sort,
      };

      // Only send filter params when active
      if (search.trim())                 params.search    = search.trim();
      if (category !== "All")            params.category  = category;
      if (level !== "All Levels")        params.level     = level.toLowerCase();
      if (priceRange[1] < 250)           params.max_price = priceRange[1];

      const { data: res } = await coursesService.getAll(params);

      // Backend shape: { success, data: { courses, categories, pagination } }
      const payload = res.data ?? res;

      setCourses(payload.courses ?? []);
      setTotalCourses(payload.pagination?.total ?? 0);

      // Build category list from backend response
      if (payload.categories?.length > 0) {
        const catNames = payload.categories.map(c => c.name);
        setCategories(["All", ...catNames]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError(err.response?.data?.message ?? "Failed to load courses.");
      setCourses([]);
      setTotalCourses(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, level, sort, priceRange]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [search, category, level, sort, priceRange]);

  const totalPages = Math.ceil(totalCourses / PER_PAGE);

  const resetFilters = useCallback(() => {
    setSearch(""); setCategory("All"); setLevel("All Levels");
    setSort("popular"); setPriceRange([0, 250]); setPage(1);
  }, []);

  return {
    courses, totalCourses,
    isLoading, error, search, setSearch, category, setCategory,
    level, setLevel, sort, setSort, priceRange, setPriceRange,
    page, setPage, totalPages, resetFilters,
    CATEGORIES: categories, LEVELS, SORT_OPTIONS,
  };
};

export default useCourses;