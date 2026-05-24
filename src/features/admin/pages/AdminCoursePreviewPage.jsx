import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, Globe,
  CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight,
  Award, Play, User,
} from "lucide-react";
import { Spinner } from "@/components/ui";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { ROUTES } from "@/constants";

// Sleek Instructor Avatar with initials fallback & broken image protection
const InstructorAvatar = ({ name, avatar }) => {
  const [error, setError] = useState(false);
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const hasAvatar = avatar && !avatar.includes("default-avatar.png") && !error;

  return hasAvatar ? (
    <img
      src={avatar}
      alt={name}
      onError={() => setError(true)}
      className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
    />
  ) : (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
};

const AdminCoursePreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [actionDone, setActionDone] = useState(null); // "approve" | "reject"

  // Video Preview States
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState("");
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.ADMIN.COURSE_PREVIEW(id));
        setCourse(res.data?.course ?? res.data);
      } catch (err) {
        setError(err?.response?.data?.message ?? "Failed to load course.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      await api.patch(`${ENDPOINTS.ADMIN.COURSES}?id=${id}`, { action });
      setActionDone(action);
    } catch (err) {
      alert(err?.response?.data?.message ?? `Failed to ${action} course.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Course Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">{error}</p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Go Back
      </button>
    </div>
  );

  const statusColors = {
    pending:   "bg-orange-100 text-orange-700 border border-orange-200",
    published: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    draft:     "bg-gray-100 text-gray-600 border border-gray-200",
    archived:  "bg-red-100 text-red-700 border border-red-200",
  };

  // Dynamic calculations for preview robust metadata
  const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? s.lessonCount ?? 0), 0) ?? 0;
  const totalDurationMinutes = course.totalDuration ?? 0;
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Back + Status bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notifications
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusColors[course.status] ?? statusColors.draft}`}>
            {course.status}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Course ID #{course._id}
          </span>
        </div>
      </div>

      {/* ── Action Done Banner ── */}
      {actionDone && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          actionDone === "approve"
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-red-50 border border-red-200"
        }`}>
          {actionDone === "approve"
            ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${actionDone === "approve" ? "text-emerald-800" : "text-red-800"}`}>
              Course {actionDone === "approve" ? "Approved ✅" : "Rejected ❌"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {actionDone === "approve"
                ? "The course is now publicly available to students."
                : "The instructor has been notified about the rejection."}
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_NOTIFICATIONS)}
            className="ml-auto text-xs font-medium text-blue-600 hover:underline"
          >
            ← Back to notifications
          </button>
        </div>
      )}

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Thumbnail */}
        {course.thumbnailUrl && !thumbnailError ? (
          <div className="h-64 overflow-hidden relative group">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              onError={() => setThumbnailError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white gap-2">
            <BookOpen className="w-16 h-16 text-white/40" />
            <span className="text-sm font-medium text-white/80">No course thumbnail uploaded</span>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
          {course.subtitle && (
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{course.subtitle}</p>
          )}

          {/* Meta row - Excluded Student Count as it's not logical for a course in review */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5 border-b border-gray-50 pb-4">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-gray-700">{totalLessons}</span> lessons
            </span>
            {totalDurationMinutes > 0 && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-gray-700">{durationText}</span> duration
              </span>
            )}
            {course.level && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="capitalize font-semibold text-gray-700">{course.level}</span>
              </span>
            )}
            {course.language && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-700">{course.language}</span>
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl font-extrabold text-gray-900">
              {course.price > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}
            </span>
            {course.originalPrice > 0 && course.originalPrice !== course.price && (
              <span className="text-base text-gray-400 line-through">
                ${Number(course.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl">
            <InstructorAvatar name={course.instructor?.name} avatar={course.instructor?.avatar} />
            <div>
              <p className="text-xs text-gray-400 font-medium">Course Creator</p>
              <p className="text-sm font-bold text-gray-800">{course.instructor?.name}</p>
              {course.instructor?.bio && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{course.instructor.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {course.description && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {course.description}
          </p>
        </div>
      )}

      {/* ── Curriculum ── */}
      {course.sections?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Curriculum — {course.sections.length} section{course.sections.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {course.sections.map((s) => (
              <div key={s._id}>
                <button
                  onClick={() => setOpenSections(p => ({ ...p, [s._id]: !p[s._id] }))}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {openSections[s._id]
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                    <span className="text-sm font-bold text-gray-800">{s.title}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {s.lessons?.length ?? s.lessonCount ?? 0} lesson{ (s.lessons?.length ?? s.lessonCount) !== 1 ? "s" : "" }
                  </span>
                </button>

                {openSections[s._id] && (
                  <div className="px-10 pb-4 pt-1 space-y-2 border-t border-gray-50 bg-gray-50/20">
                    {s.lessons?.length > 0 ? (
                      s.lessons.map((lesson) => (
                        <div key={lesson._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                            <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes}m
                            </span>
                            {lesson.videoPath ? (
                              <button
                                onClick={() => {
                                  setActiveVideoUrl(lesson.videoPath);
                                  setActiveVideoTitle(lesson.title);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                              >
                                <Play className="w-2.5 h-2.5 fill-white text-white shrink-0" /> Play Video
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No video</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 py-2 italic text-center">
                        No lessons added to this section yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approve / Reject actions ── */}
      {course.status === "pending" && !actionDone && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Awaiting Your Review</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review the course content, thumbnail, and watch lesson videos above. Then approve or reject the course.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {actionLoading === "approve" ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve Course
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {actionLoading === "reject" ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Course
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Video Player ── */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-gray-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white line-clamp-1">
                Previewing Lesson: <span className="text-indigo-400 font-semibold">{activeVideoTitle}</span>
              </h3>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle("");
                }}
                className="text-gray-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-850 bg-gray-800/50 transition-colors"
              >
                Close Preview
              </button>
            </div>
            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursePreviewPage;
