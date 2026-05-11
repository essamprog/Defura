import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud, Code2, Shield, Database, Cpu, Network,
  LineChart, Terminal, ArrowRight, Loader2, FolderOpen,
} from "lucide-react";
import { ROUTES } from "@/constants";
import coursesService from "../../courses/services/coursesService";

// ─── Icon + color map by category slug (fallback gracefully) ──────────────────
const CATEGORY_STYLE = {
  cloud:       { icon: Cloud,     color: "text-sky-600",     bg: "bg-sky-50",     hover: "hover:bg-sky-100 hover:border-sky-200" },
  development: { icon: Code2,     color: "text-blue-600",    bg: "bg-blue-50",    hover: "hover:bg-blue-100 hover:border-blue-200" },
  security:    { icon: Shield,    color: "text-rose-600",    bg: "bg-rose-50",    hover: "hover:bg-rose-100 hover:border-rose-200" },
  data:        { icon: Database,  color: "text-amber-600",   bg: "bg-amber-50",   hover: "hover:bg-amber-100 hover:border-amber-200" },
  ai:          { icon: Cpu,       color: "text-violet-600",  bg: "bg-violet-50",  hover: "hover:bg-violet-100 hover:border-violet-200" },
  networking:  { icon: Network,   color: "text-teal-600",    bg: "bg-teal-50",    hover: "hover:bg-teal-100 hover:border-teal-200" },
  analytics:   { icon: LineChart, color: "text-indigo-600",  bg: "bg-indigo-50",  hover: "hover:bg-indigo-100 hover:border-indigo-200" },
  devops:      { icon: Terminal,  color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:bg-emerald-100 hover:border-emerald-200" },
};

// Rotating default colors for categories not in the map
const DEFAULT_STYLES = [
  { color: "text-blue-600",   bg: "bg-blue-50",   hover: "hover:bg-blue-100 hover:border-blue-200" },
  { color: "text-violet-600", bg: "bg-violet-50",  hover: "hover:bg-violet-100 hover:border-violet-200" },
  { color: "text-emerald-600",bg: "bg-emerald-50", hover: "hover:bg-emerald-100 hover:border-emerald-200" },
  { color: "text-amber-600",  bg: "bg-amber-50",   hover: "hover:bg-amber-100 hover:border-amber-200" },
  { color: "text-rose-600",   bg: "bg-rose-50",    hover: "hover:bg-rose-100 hover:border-rose-200" },
  { color: "text-sky-600",    bg: "bg-sky-50",     hover: "hover:bg-sky-100 hover:border-sky-200" },
  { color: "text-teal-600",   bg: "bg-teal-50",    hover: "hover:bg-teal-100 hover:border-teal-200" },
  { color: "text-indigo-600", bg: "bg-indigo-50",  hover: "hover:bg-indigo-100 hover:border-indigo-200" },
];

const getStyle = (slug, index) => {
  if (CATEGORY_STYLE[slug]) return CATEGORY_STYLE[slug];
  return { icon: FolderOpen, ...DEFAULT_STYLES[index % DEFAULT_STYLES.length] };
};

// ─── Component ────────────────────────────────────────────────────────────────
const CategorySection = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data: res } = await coursesService.getAll({ page: 1, per_page: 1 });
        const payload = res.data ?? res;
        setCategories(payload.categories ?? []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const goToCategory = (slug) =>
    navigate(`${ROUTES.COURSES}?category=${slug}`);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-4">
              <Terminal className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Browse Topics
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Explore by Category
            </h2>
            <p className="text-gray-500 mt-2 text-base">
              Find the exact skill track you need to grow.
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.COURSES)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
          >
            All categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No categories yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Categories will appear here once courses are added to the platform.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const slug = cat.slug ?? cat.name?.toLowerCase().replace(/\s+/g, "-");
              const style = getStyle(slug, i);
              const Icon = style.icon;
              return (
                <button
                  key={cat.slug ?? cat.name}
                  onClick={() => goToCategory(slug)}
                  className={[
                    "group flex flex-col items-start gap-3 p-5 rounded-2xl",
                    "bg-white border border-gray-100 text-left",
                    "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                    style.hover,
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  ].join(" ")}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 mb-0.5">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {cat.course_count ?? 0} courses
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-150 mt-auto" />
                </button>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default CategorySection;