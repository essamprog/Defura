import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, Users, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store";
import { resolveMediaUrl } from "@/utils";
import coursesService from "../../courses/services/coursesService";

// ─── Avatar color helper ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-emerald-500","bg-sky-500",
  "bg-amber-500","bg-rose-500","bg-indigo-500","bg-teal-500",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const COURSE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eff6ff"/>
          <stop offset="1" stop-color="#e0e7ff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <g fill="#93c5fd">
        <path d="M260 152c0-18 14-32 32-32h240c18 0 32 14 32 32v176c0 18-14 32-32 32H292c-18 0-32-14-32-32V152zm40 24h200a16 16 0 0 1 16 16v136a16 16 0 0 1-16 16H300a16 16 0 0 1-16-16V192a16 16 0 0 1 16-16z"/>
        <path d="M320 220h160v24H320zM320 268h120v24H320z"/>
      </g>
    </svg>
  `);

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard = ({ course, visible, index }) => {
  const navigate = useNavigate();
  const { enrolledCourseIds, isAuthenticated } = useAuthStore();

  const courseId = course._id ?? course.id;
  const isEnrolled = isAuthenticated && enrolledCourseIds.some(id => Number(id) === Number(courseId));

  const thumbnailRaw = course.thumbnail ?? course.thumbnail_url ?? course.image;
  const thumbnail = resolveMediaUrl(thumbnailRaw);

  const instructorName = course.instructor?.name ?? course.instructor_name ?? "";
  const instructorAvatarRaw = course.instructor?.avatar ?? course.instructor_avatar ?? null;
  const instructorAvatar = resolveMediaUrl(instructorAvatarRaw);
  const rating = course.rating ?? course.average_rating ?? 0;
  const isBestseller = course.isBestseller ?? course.bestseller ?? false;

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(ROUTES.courseDetail(courseId))}
      className={[
        "group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer",
        "hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      ].join(" ")}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = COURSE_PLACEHOLDER;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BookOpen className="w-10 h-10 text-blue-200" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gray-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full">
            Preview Course
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isBestseller && (
            <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2.5">
          {course.category && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {course.category}
            </span>
          )}
          <span className="text-[10px] text-gray-400">{course.level}</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        {instructorName && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 rounded-full ${avatarColor(instructorName)} flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden border border-gray-100`}>
              {instructorAvatar ? (
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                instructorName[0]
              )}
            </div>
            <span className="text-sm text-gray-500 truncate">{instructorName}</span>
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs font-bold text-amber-600">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({(course.reviewCount ?? 0).toLocaleString()})</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {Math.floor(course.duration / 60)}h {course.duration % 60}m
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {(course.students ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              {course.price > 0 ? `$${course.price}` : "Free"}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
            )}
          </div>
          {isEnrolled ? (
            <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
              Start <ArrowRight className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5 transition-colors">
              Enroll <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────
const FeaturedCourses = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Fetch top courses from API
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const { data: res } = await coursesService.getAll({
          page: 1,
          per_page: 4,
          sort: "popular",
        });
        const payload = res.data ?? res;
        setCourses(payload.courses ?? []);
      } catch (err) {
        console.error("Failed to load featured courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-4">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Top Picks
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Featured Courses
            </h2>
            <p className="text-gray-500 mt-2 text-base max-w-lg">
              Hand-picked by our curriculum team. Start with these and advance
              your IT career in weeks, not years.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.COURSES)}
          >
            View All Courses
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          /* ── Elegant empty state ─────────────────────────────── */
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No courses available yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              We're preparing amazing courses for you. Check back soon!
            </p>
          </div>
        ) : (
          /* ── Grid ────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {courses.map((course, i) => (
              <CourseCard key={course._id ?? course.id ?? i} course={course} visible={visible} index={i} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedCourses;