import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, Clock, Users, BookOpen, Award, Check,
  Play, ChevronDown, Globe, RefreshCw, ShoppingCart,
  ArrowRight, Infinity, Smartphone, AlertCircle,
} from "lucide-react";
import { Button, Badge, Spinner, Accordion, ProgressBar } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useCartStore, useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { formatDuration } from "@/utils";
import coursesService from "../services/coursesService";

const CourseDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addItem, isInCart } = useCartStore();
  const { isAuthenticated }   = useAuthStore();

  const [course,   setCourse]  = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);
  const [openSections, setOpenSections] = useState([0]);

  const inCart = course ? isInCart(course._id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await coursesService.getById(id);
        const payload = res.data ?? res;
        setCourse(payload.course ?? payload);
      } catch (err) {
        console.error("Failed to load course:", err);
        setError(err.response?.data?.message ?? "Course not found.");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleSection = (i) =>
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleEnroll = () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    if (!inCart) addItem(course);
    navigate(ROUTES.CART);
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );

  // ── Error / Not found state ────────────────────────────────
  if (error || !course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <EmptyState
        icon={<AlertCircle className="w-8 h-8" />}
        title={error ?? "Course not found"}
        description="The course you're looking for doesn't exist or has been removed."
        action={() => navigate(ROUTES.COURSES)}
        actionLabel="Browse All Courses"
      />
    </div>
  );

  // ── Data extraction with safe fallbacks ─────────────────────
  const thumbnail       = course.thumbnail ?? course.thumbnail_url ?? course.image;
  const instructorName  = course.instructor?.name ?? course.instructor?.full_name ?? "";
  const instructorAvatar= course.instructor?.avatar ?? course.instructor?.profile_picture ?? instructorName?.[0] ?? "?";
  const rating          = course.rating ?? course.average_rating ?? 0;
  const reviewCount     = course.reviewCount ?? course.review_count ?? 0;
  const students        = course.students ?? course.total_students ?? 0;
  const totalLessons    = course.totalLessons ?? course.total_lessons ?? 0;
  const totalSections   = course.totalSections ?? course.total_sections ?? 0;
  const duration        = course.duration ?? course.total_duration ?? 0;
  const isBestseller    = course.isBestseller ?? course.is_bestseller ?? false;
  const whatYouLearn    = course.whatYouLearn ?? course.what_you_learn ?? [];
  const requirements    = course.requirements ?? [];
  const curriculum      = course.curriculum ?? [];
  const tags            = course.tags ?? [];
  const price           = course.price ?? 0;
  const originalPrice   = course.originalPrice ?? course.original_price ?? null;
  const discount        = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero (dark) ────────────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:max-w-2xl xl:max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
              <button onClick={() => navigate(ROUTES.COURSES)} className="hover:text-gray-200 transition-colors">Courses</button>
              <span>/</span>
              {course.category && <span className="text-blue-400">{course.category}</span>}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              {isBestseller && (
                <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Bestseller</span>
              )}
              {course.category && (
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">{course.category}</span>
              )}
              <span className="text-gray-400 text-xs">{course.level}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-3">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-gray-300 text-base leading-relaxed mb-5">{course.subtitle}</p>
            )}

            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold text-sm">{rating}</span>
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />)}</div>
                  <span className="text-gray-400 text-xs">({reviewCount.toLocaleString()} ratings)</span>
                </div>
              )}
              <span className="flex items-center gap-1 text-gray-400 text-xs"><Users className="w-3.5 h-3.5" /> {students.toLocaleString()} students</span>
              {course.language && <span className="flex items-center gap-1 text-gray-400 text-xs"><Globe className="w-3.5 h-3.5" /> {course.language}</span>}
              {course.lastUpdated && <span className="flex items-center gap-1 text-gray-400 text-xs"><RefreshCw className="w-3.5 h-3.5" /> Updated {course.lastUpdated}</span>}
            </div>

            {/* Instructor */}
            {instructorName && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0">{instructorAvatar[0]}</div>
                <div>
                  <p className="text-xs text-gray-400">Created by</p>
                  <p className="text-sm text-blue-400 font-medium">{instructorName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:flex lg:gap-10">

          {/* ── Left column ───────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* What you'll learn */}
            {whatYouLearn.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whatYouLearn.map(item => (
                    <div key={item} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                      </div>
                      <p className="text-sm text-gray-700 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course content */}
            {curriculum.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {totalSections > 0 && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {totalSections} sections</span>}
                    {totalLessons > 0 && <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> {totalLessons} lessons</span>}
                    {duration > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(duration)}</span>}
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {curriculum.map((section, i) => (
                    <div key={i}>
                      <button
                        onClick={() => toggleSection(i)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-right"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.includes(i) ? "rotate-180" : ""}`} />
                          <span className="text-sm font-semibold text-gray-800 truncate">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 ml-4">
                          <span>{section.lessons?.length ?? section.lesson_count ?? 0} lessons</span>
                          {section.duration > 0 && <span>{formatDuration(section.duration)}</span>}
                        </div>
                      </button>

                      {openSections.includes(i) && section.lessons?.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {section.lessons.map((lesson, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-gray-500 py-1">
                              <Play className="w-3 h-3 text-gray-400 shrink-0" />
                              {typeof lesson === "string" ? lesson : lesson.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {requirements.map(req => (
                    <li key={req} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Instructor */}
            {instructorName && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Your Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {instructorAvatar[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900">{instructorName}</p>
                    <div className="flex flex-wrap gap-4 mt-2 mb-3">
                      {course.instructor?.rating > 0 && <span className="flex items-center gap-1 text-xs text-gray-500"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.instructor.rating} Instructor Rating</span>}
                      {course.instructor?.students > 0 && <span className="flex items-center gap-1 text-xs text-gray-500"><Users className="w-3.5 h-3.5" /> {course.instructor.students.toLocaleString()} Students</span>}
                      {course.instructor?.courses > 0 && <span className="flex items-center gap-1 text-xs text-gray-500"><BookOpen className="w-3.5 h-3.5" /> {course.instructor.courses} Courses</span>}
                    </div>
                    {course.instructor?.bio && <p className="text-sm text-gray-600 leading-relaxed">{course.instructor.bio}</p>}
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* ── Price Card (sticky) ────────────────────────────── */}
          <div className="lg:w-80 xl:w-96 shrink-0 mt-8 lg:mt-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

                {/* Preview thumbnail */}
                <div className="relative aspect-video bg-gray-900 group cursor-pointer">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="w-full h-full object-cover opacity-70" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-white text-xs font-medium bg-black/40 px-3 py-1 rounded-full">Preview this course</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {price > 0 ? `$${price}` : "Free"}
                    </span>
                    {originalPrice && <span className="text-lg text-gray-400 line-through">${originalPrice}</span>}
                    {discount > 0 && <span className="ml-auto text-sm font-bold text-red-500">{discount}% OFF</span>}
                  </div>

                  {/* Countdown (cosmetic) */}
                  {discount > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center gap-2 mb-4">
                      <span className="text-amber-600">⏰</span>
                      <p className="text-xs text-amber-700 font-medium">
                        <strong>Limited time</strong> offer!
                      </p>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="space-y-2.5 mb-5">
                    <Button fullWidth size="lg" onClick={handleEnroll}
                      rightIcon={<ArrowRight className="w-4 h-4" />}>
                      {inCart ? "Go to Cart" : "Enroll Now"}
                    </Button>
                    <Button fullWidth size="lg" variant="outline"
                      leftIcon={<ShoppingCart className="w-4 h-4" />}
                      onClick={() => { if (!inCart) addItem(course); navigate(ROUTES.CART); }}>
                      {inCart ? "In Cart" : "Add to Cart"}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-gray-400 mb-5">30-Day Money-Back Guarantee</p>

                  {/* Includes */}
                  <div className="space-y-2.5 border-t border-gray-100 pt-5">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">This course includes:</p>
                    {[
                      { icon: Clock,      text: duration > 0 ? `${formatDuration(duration)} on-demand video` : "Video content" },
                      { icon: BookOpen,   text: `${totalLessons} lessons` + (totalSections > 0 ? ` in ${totalSections} sections` : "") },
                      { icon: Smartphone, text: "Access on mobile & desktop" },
                      { icon: Infinity,   text: "Full lifetime access" },
                      { icon: Award,      text: "Certificate of completion" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-xs text-gray-600">
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-gray-100">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;