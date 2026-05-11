import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Clock, Award, TrendingUp,
  Play, ArrowRight, CheckCircle, Flame,
  BarChart3, Calendar, Loader2,
} from "lucide-react";
import { ProgressBar, Badge, Button, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { formatDuration } from "@/utils";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Component ────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [activity, setActivity] = useState([]);

  const firstName = (user?.full_name ?? "there").split(" ")[0];

  const hour    = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.STUDENT.DASHBOARD);
        const payload = res.data ?? res;

        setStats(payload.stats ?? null);
        setEnrolled(payload.enrolledCourses ?? []);
        setActivity(payload.recentActivity ?? []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        // Gracefully show empty state — no crash
        setStats(null);
        setEnrolled([]);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Activity icon mapping
  const activityIconMap = {
    lesson_completed: { icon: CheckCircle, color: "text-emerald-500" },
    course_started:   { icon: Play,        color: "text-blue-500" },
    certificate:      { icon: Award,       color: "text-amber-500" },
    enrolled:         { icon: BookOpen,    color: "text-indigo-500" },
  };

  // ── Stat cards config ──────────────────────────────────────
  const statCards = [
    { icon: BookOpen, label: "Enrolled",      value: stats?.enrolledCourses ?? 0,  sub: "Active courses",       color: "text-blue-600",    bg: "bg-blue-50" },
    { icon: Clock,    label: "Hours Learned", value: `${stats?.hoursLearned ?? 0}h`, sub: "Total watch time",   color: "text-indigo-600",  bg: "bg-indigo-50" },
    { icon: Award,    label: "Certificates",  value: stats?.certificates ?? 0,     sub: "Earned so far",        color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Flame,    label: "Day Streak",    value: stats?.dayStreak ?? 0,        sub: "Keep it going! 🔥",   color: "text-amber-600",   bg: "bg-amber-50" },
  ];

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* ── Welcome Banner ───────────────────────────────────── */}
      <div className="bg-[#0f172a] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Grid pattern and glow */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {firstName} 👋
          </h1>
          <p className="text-gray-300 text-sm max-w-md">
            {enrolled.length > 0
              ? <>You have <strong className="text-white">{enrolled.length} course{enrolled.length > 1 ? "s" : ""}</strong> in progress. Keep the momentum going!</>
              : "Start your learning journey by enrolling in a course today!"}
          </p>
          <Button
            size="sm"
            className="mt-4 bg-blue-600 text-white hover:bg-blue-700 border-none"
            rightIcon={<Play className="w-3.5 h-3.5 fill-white" />}
            onClick={() => navigate(enrolled.length > 0 ? ROUTES.MY_COURSES : ROUTES.COURSES)}
          >
            {enrolled.length > 0 ? "Continue Learning" : "Continue Learning"}
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── My Courses + Activity ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Enrolled courses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Continue Learning</h2>
            <button
              onClick={() => navigate(ROUTES.MY_COURSES)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {enrolled.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="No courses yet"
              description="You haven't enrolled in any courses yet. Explore our catalog to get started!"
              action={() => navigate(ROUTES.COURSES)}
              actionLabel="Browse Courses"
            />
          ) : (
            <div className="space-y-4">
              {enrolled.map(course => (
                <div
                  key={course._id}
                  onClick={() => navigate(ROUTES.learning(course._id, "next"))}
                  className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <BookOpen className="w-5 h-5 text-blue-200" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">Next: {course.lastLesson ?? "Start learning"}</p>
                    <ProgressBar value={course.progress ?? 0} height="sm" color={(course.progress ?? 0) >= 80 ? "green" : "blue"} />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">{course.completedLessons ?? 0}/{course.totalLessons ?? 0} lessons</p>
                      <p className="text-xs font-semibold text-gray-600">{course.progress ?? 0}%</p>
                    </div>
                  </div>

                  {/* Play button */}
                  <div className="shrink-0 self-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                      <Play className="w-3.5 h-3.5 text-blue-600 group-hover:text-white fill-current ml-0.5 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>

          {activity.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No activity yet</p>
              <p className="text-xs text-gray-300 mt-1">Your learning activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.map((item, i) => {
                const mapped = activityIconMap[item.type] ?? { icon: CheckCircle, color: "text-gray-400" };
                const Icon = mapped.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${mapped.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-700 leading-snug">{item.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Weekly goal */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Weekly Goal</p>
              <p className="text-xs text-gray-400">{Math.round(stats?.hoursLearned ?? 0)}h / 7h</p>
            </div>
            <ProgressBar value={Math.min(stats?.hoursLearned ?? 0, 7)} max={7} color="indigo" height="sm" />
            <p className="text-xs text-gray-400 mt-1.5">
              {(stats?.hoursLearned ?? 0) >= 7
                ? "🎉 Weekly goal achieved! Great job!"
                : `${Math.max(0, 7 - Math.round(stats?.hoursLearned ?? 0))} more hours to hit your goal this week 💪`}
            </p>
          </div>
        </div>

      </div>

      {/* ── Recommended Courses CTA ───────────────────────────── */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Ready to expand your skills?</p>
            <p className="text-xs text-gray-500">New courses are added regularly. Find your next challenge.</p>
          </div>
        </div>
        <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate(ROUTES.COURSES)}>
          Browse Courses
        </Button>
      </div>

    </div>
  );
};

export default DashboardPage;