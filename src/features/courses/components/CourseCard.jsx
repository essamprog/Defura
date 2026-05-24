import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, Users, ArrowRight, ShoppingCart, Check, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui";
import { useCartStore, useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { formatDuration, resolveMediaUrl } from "@/utils";

// Deterministic avatar color
const AVATAR_COLORS = [
  "bg-blue-500","bg-indigo-500","bg-violet-500","bg-sky-500",
  "bg-emerald-500","bg-amber-500","bg-rose-500","bg-teal-500",
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

const CourseCard = ({ course, className = "" }) => {
  const navigate  = useNavigate();
  const { addItem, isInCart } = useCartStore();
  const { enrolledCourseIds, isAuthenticated } = useAuthStore();
  
  const courseId = course._id ?? course.id;
  const isEnrolled = isAuthenticated && enrolledCourseIds.some(id => Number(id) === Number(courseId));

  // Pass the full course object so isInCart can resolve any ID field (_id / id / course_id).
  // isInCart is a pure function of get().items — every Zustand subscriber re-runs this
  // per-card so each card has its OWN independent boolean.
  const inCart = isInCart(course);

  const [adding, setAdding] = useState(false);
  const [thumbErrored, setThumbErrored] = useState(false);
  const [avatarErrored, setAvatarErrored] = useState(false);

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handleCart = async (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(ROUTES.learning(courseId, "start"));
      return;
    }
    if (inCart || adding) return;   // idempotent guard
    setAdding(true);
    await addItem(course);          // addItem posts to API; rolls back on failure
    setAdding(false);
    // inCart is derived from store state, so it updates automatically on success
  };

  // Backend sends `thumbnail` (normalized from thumbnail_url)
  const thumbnailRaw = course.thumbnail ?? course.thumbnail_url ?? course.image;
  const thumbnailResolved = resolveMediaUrl(thumbnailRaw);
  const thumbnail = !thumbErrored ? thumbnailResolved : null;

  const instructorName = course.instructor?.name ?? course.instructor_name ?? "";
  const instructorAvatarUrl = resolveMediaUrl(
    course.instructor?.avatar ?? course.instructor_avatar ?? null
  );
  const instructorInitial =
    (instructorName.trim()?.[0] ?? course.instructor?.full_name?.trim()?.[0] ?? "?").toUpperCase();
  const rating = course.rating ?? course.average_rating ?? 0;
  const isBestseller = course.isBestseller ?? course.bestseller ?? false;

  return (
    <div
      onClick={() => navigate(ROUTES.courseDetail(courseId))}
      className={[
        "group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer",
        "hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col",
        className,
      ].join(" ")}
    >
      {/* ── Thumbnail ─────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 shrink-0">
        <img
          src={thumbnail ?? COURSE_PLACEHOLDER}
          alt={course.title}
          loading="lazy"
          onError={(e) => {
            if (!thumbErrored) setThumbErrored(true);
            e.currentTarget.onerror = null;
            e.currentTarget.src = COURSE_PLACEHOLDER;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!thumbnailRaw && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-4xl text-blue-200">📚</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            View Course
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
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

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category + Level */}
        <div className="flex items-center gap-2">
          {course.category && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {course.category}
            </span>
          )}
          <span className="text-[10px] text-gray-400">{course.level}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
          {course.title}
        </h3>

        {/* Instructor */}
        {instructorName && (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${avatarColor(instructorName)} flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden border border-gray-100`}>
              {instructorAvatarUrl && !avatarErrored ? (
                <img
                  src={instructorAvatarUrl}
                  alt={instructorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    setAvatarErrored(true);
                    e.currentTarget.onerror = null;
                  }}
                />
              ) : (
                <span>{instructorInitial}</span>
              )}
            </div>
            <span className="text-xs text-gray-500 truncate">{instructorName}</span>
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-600">{rating}</span>
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({(course.reviewCount ?? 0).toLocaleString()})</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.duration)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {(course.students ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              {course.price > 0 ? `$${course.price}` : "Free"}
            </span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">${course.originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleCart}
            disabled={(!isEnrolled && inCart) || adding}
            className={[
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150",
              isEnrolled
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                : inCart
                  ? "bg-green-50 text-green-600 cursor-default"
                  : adding
                    ? "bg-blue-50 text-blue-400 cursor-wait"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
            ].join(" ")}
          >
            {isEnrolled ? (
              <><Play className="w-3 h-3 fill-current" /> Start</>
            ) : inCart ? (
              <><Check className="w-3 h-3" /> Added</>
            ) : adding ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Adding...</>
            ) : (
              <><ShoppingCart className="w-3 h-3" /> Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;