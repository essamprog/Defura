import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { VideoPlayer } from '@/components/common';
import { resolveMediaUrl, COURSE_PLACEHOLDER, isFreePreviewLesson } from '@/utils';

export default function CoursePreview() {
  const { id: courseId } = useParams();
  const navigate          = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [course,      setCourse]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState('');
  const [thumbErrored, setThumbErrored] = useState(false);

  useEffect(() => {
    if (courseId) fetchDetails();
  }, [courseId]);

  const playVideo = (url, title = '') => {
    const resolved = resolveMediaUrl(url);
    if (resolved) {
      setActiveVideo(resolved);
      setActiveVideoTitle(title);
    }
  };

  const fetchDetails = async () => {
    setActiveVideo(null);
    setActiveVideoTitle('');
    setThumbErrored(false);
    try {
      const res = await api.get(ENDPOINTS.COURSES.PUBLIC_DETAIL(courseId));
      // Handle both {status, data} and direct response shapes
      const payload = res.data?.data ?? res.data;
      if (payload?.id) {
        setCourse(payload);
      } else {
        setError(res.data?.message || 'Course data unavailable.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Course not found or is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading skeleton ─────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="max-w-6xl mx-auto p-8 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-2xl w-full mb-8" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3 h-96 bg-gray-200 rounded-2xl" />
        <div className="w-full md:w-1/3 h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );

  if (error || !course) return (
    <div className="text-center p-20 text-red-500 text-xl font-bold">{error || 'Course not found.'}</div>
  );

  const price = typeof course.price === 'number' ? course.price : parseFloat(course.price ?? 0);
  const thumbnailUrl = !thumbErrored
    ? resolveMediaUrl(course?.thumbnail ?? course?.thumbnail_url)
    : null;
  const promoVideoUrl = resolveMediaUrl(course?.promo_video_url);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Dark Header Banner ──────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white py-16 px-4 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-2xl" />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-start relative z-10">

          {/* Left — course meta */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {course.level}
              </span>
              {course.is_bestseller == 1 && (
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-gray-300 mb-6 font-light">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-300 font-medium">
              <span className="flex items-center text-amber-400">
                <span className="mr-1 text-lg">★</span>
                {course.average_rating ?? '—'} Rating
              </span>
              <span>👨‍🎓 {course.total_students ?? 0} Students</span>
              <span>✍️ Created by <strong className="text-white">{course.instructor_name}</strong></span>
            </div>
          </div>

          {/* Right — Enrollment card */}
          <div className="w-full md:w-80 bg-white text-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-100 md:translate-y-8 z-20 shrink-0">
            {/* Video / thumbnail preview */}
            {activeVideo ? (
              <VideoPlayer
                src={activeVideo}
                poster={thumbnailUrl}
                title={activeVideoTitle}
                autoPlay
                className="mb-5 rounded-xl"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-xl mb-5 relative overflow-hidden group flex items-center justify-center shadow-inner">
                <img
                  src={thumbnailUrl ?? COURSE_PLACEHOLDER}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  alt={course?.title ?? 'Course thumbnail'}
                  onError={(e) => {
                    if (!thumbErrored) setThumbErrored(true);
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = COURSE_PLACEHOLDER;
                  }}
                />
                {promoVideoUrl && (
                  <button
                    type="button"
                    className="absolute inset-0 bg-gray-900/40 flex items-center justify-center cursor-pointer border-0"
                    onClick={() => playVideo(course?.promo_video_url, 'Promo video')}
                  >
                    <span className="bg-white/95 text-indigo-600 p-4 rounded-full shadow-xl transform group-hover:scale-110 transition-all font-bold text-sm flex items-center gap-2">
                      <span className="text-xl">▶</span> Preview
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-extrabold text-gray-900">${price.toFixed(2)}</span>
              {course.original_price && parseFloat(course.original_price) > price && (
                <span className="text-lg text-gray-400 line-through">${parseFloat(course.original_price).toFixed(2)}</span>
              )}
            </div>

            {/* CTA */}
            <button
              id="enroll-btn"
              onClick={() =>
                isAuthenticated
                  ? navigate('/checkout', { state: { courseId } })
                  : navigate('/login')
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-lg mb-4 transform hover:-translate-y-0.5"
            >
              {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
            </button>

            <p className="text-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
              30-Day Money-Back Guarantee
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-14">

          {/* About */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">About this course</h2>
            <div
              className="prose prose-indigo prose-lg text-gray-600 max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.description || 'No description provided by the instructor.' }}
            />
          </section>

          {/* Curriculum */}
          {course.curriculum && course.curriculum.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Course Curriculum</h2>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {course.curriculum.map((section) => (
                  <div key={section.id} className="border-b border-gray-100 last:border-0">
                    <div className="bg-gray-50 px-6 py-4 font-bold text-gray-800 flex justify-between items-center">
                      <span className="text-base">{section.title}</span>
                      <span className="text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">
                        {section.lessons?.length ?? 0} lessons
                      </span>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {(section.lessons ?? []).map((lesson) => (
                        <div
                          key={lesson.id}
                          className="px-6 py-4 flex justify-between items-center hover:bg-indigo-50/50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            {isFreePreviewLesson(lesson) && resolveMediaUrl(lesson?.video_path) ? (
                              <button
                                type="button"
                                className="text-indigo-600 bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 border-0"
                                onClick={() => playVideo(lesson?.video_path, lesson?.title)}
                              >
                                ▶
                              </button>
                            ) : (
                              <span className="text-gray-400 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                🔒
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={!(isFreePreviewLesson(lesson) && resolveMediaUrl(lesson?.video_path))}
                              className={[
                                'font-medium text-sm text-left border-0 bg-transparent p-0',
                                isFreePreviewLesson(lesson) && resolveMediaUrl(lesson?.video_path)
                                  ? 'text-indigo-900 cursor-pointer hover:underline'
                                  : 'text-gray-600 cursor-default',
                              ].join(' ')}
                              onClick={() => isFreePreviewLesson(lesson) && playVideo(lesson?.video_path, lesson?.title)}
                            >
                              {lesson?.title}
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                            {isFreePreviewLesson(lesson) && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider">
                                Free
                              </span>
                            )}
                            {lesson.duration_minutes > 0 && (
                              <span className="text-gray-500">{lesson.duration_minutes}m</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Your Instructor</h2>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-black uppercase shrink-0 shadow-lg">
                {course.instructor_name?.charAt(0) ?? '?'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{course.instructor_name}</h3>
                <p className="text-indigo-600 font-bold mb-4 text-sm">{course.expertise || 'Course Instructor'}</p>
                <div className="flex gap-6 mb-4 text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500 text-base">★</span>
                    {course.instructor_rating ?? '0.0'} Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-indigo-500 text-base">👨‍🎓</span>
                    {course.instructor_students ?? '0'} Students
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {course.instructor_bio || 'The instructor has not provided a bio yet.'}
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
