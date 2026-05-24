import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Linkedin,
  Github,
  BookOpen,
  Users,
  Star,
  Award,
  ExternalLink
} from "lucide-react";
import api from "@/services/api";
import { ROUTES } from "@/constants";
import CourseCard from "@/features/courses/components/CourseCard";
import { Spinner } from "@/components/ui";

const InstructorPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/instructor_profile.php?id=${id}`);
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          throw new Error(response.data?.message || "Failed to load instructor profile.");
        }
      } catch (err) {
        console.error("Error fetching instructor profile:", err);
        setError(err.message || "An error occurred while loading profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarGradient = (name) => {
    const colors = [
      "from-blue-500 to-indigo-600 text-white",
      "from-purple-500 to-pink-600 text-white",
      "from-emerald-500 to-teal-600 text-white",
      "from-rose-500 to-orange-600 text-white",
      "from-amber-500 to-yellow-600 text-white",
    ];
    let sum = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-24 font-sans pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button Skeleton */}
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-slate-200 animate-pulse mb-6" />
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-6" />
              <div className="w-full border-t border-slate-100 pt-6 flex justify-around mb-6">
                <div className="h-10 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-10 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-20 w-full bg-slate-50 rounded animate-pulse" />
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-8">
              <div className="h-8 w-56 bg-slate-200 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-72 animate-pulse">
                    <div className="bg-slate-200 h-40 w-full" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-100 text-center rounded-[2.5rem] p-8 max-w-lg w-full shadow-lg">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Educator Profile Error</h3>
          <p className="text-sm text-slate-500 mb-6">{error || "Failed to locate this instructor profile."}</p>
          <div className="flex gap-4 justify-center">
            <Link
              to={ROUTES.INSTRUCTORS}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
            >
              Back to Educators
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { instructor, courses } = data;
  const initialsGradient = getAvatarGradient(instructor.name);

  return (
    <div className="min-h-screen bg-slate-50/30 pb-24 font-sans pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Back Bar */}
        <Link
          to={ROUTES.INSTRUCTORS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Educators
        </Link>

        {/* Profile Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left Sidebar Profile Card ── */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] flex flex-col items-center">

            {/* Enlarged Avatar Container */}
            <div className="relative mb-6">
              {instructor.avatar ? (
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  className="w-32 h-32 rounded-full object-cover border-[4px] border-white shadow-2xl bg-white"
                />
              ) : null}
              <div
                style={{ display: instructor.avatar ? 'none' : 'flex' }}
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${initialsGradient} flex items-center justify-center text-4xl font-extrabold tracking-wider border-[4px] border-white shadow-2xl`}
              >
                {getInitials(instructor.name)}
              </div>

              {/* Rating Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-md text-xs font-black flex items-center gap-1 border border-slate-100 whitespace-nowrap">
                <span className="text-amber-400 text-sm leading-none">★</span> {Number(instructor.average_rating).toFixed(1)}
              </div>
            </div>

            {/* Educator Badges */}
            <span className="bg-blue-50 text-blue-600 text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full mb-3">
              {instructor.experience}
            </span>

            <h2 className="text-2xl font-black text-slate-900 mb-1 text-center">{instructor.name}</h2>
            <p className="text-sm text-slate-400 font-semibold mb-6 text-center">{instructor.expertise}</p>

            {/* Social Icons row */}
            <div className="flex flex-col gap-2 w-full mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">Contact Links</h4>

              <div className="grid grid-cols-3 gap-2 w-full">
                <a
                  href={instructor.website || "#"}
                  target={instructor.website ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${instructor.website
                    ? "border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-300 pointer-events-none opacity-60"
                    }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Website</span>
                </a>

                <a
                  href={instructor.linkedin || "#"}
                  target={instructor.linkedin ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${instructor.linkedin
                    ? "border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-300 pointer-events-none opacity-60"
                    }`}
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="text-[10px] font-bold">LinkedIn</span>
                </a>

                <a
                  href={instructor.github || "#"}
                  target={instructor.github ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${instructor.github
                    ? "border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-300 pointer-events-none opacity-60"
                    }`}
                >
                  <Github className="w-5 h-5" />
                  <span className="text-[10px] font-bold">GitHub</span>
                </a>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-3 w-full gap-2 border-y border-slate-100 py-6 mb-6 text-center">
              <div>
                <div className="text-blue-600 font-extrabold text-lg">{instructor.courses_count}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Courses</div>
              </div>
              <div className="border-x border-slate-100">
                <div className="text-blue-600 font-extrabold text-lg">
                  {instructor.total_students >= 1000
                    ? `${(instructor.total_students / 1000).toFixed(1)}k`
                    : instructor.total_students}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Students</div>
              </div>
              <div>
                <div className="text-blue-600 font-extrabold text-lg flex items-center justify-center gap-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                  {Number(instructor.average_rating).toFixed(1)}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rating</div>
              </div>
            </div>

            {/* Educator Bio */}
            <div className="w-full text-right">
              <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-50 pb-2">About the teacher</h4>
              <p className="text-sm text-slate-500 leading-relaxed text-justify whitespace-pre-line">
                {instructor.bio || "No bio available for this instructor yet, but they are considered one of our top educators in specialized courses and lectures."}
              </p>
            </div>

          </div>

          {/* ── Right Content Area: Courses Grid ── */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Available Courses ({courses.length})
              </h3>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">No courses published yet</h4>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  This instructor is currently preparing their new educational materials. Stay tuned for their course launches!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    className="shadow-sm border border-slate-100 hover:shadow-lg transition-shadow bg-white"
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default InstructorPublicProfilePage;
