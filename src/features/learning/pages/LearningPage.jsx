import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Play, CheckCircle, Lock, ChevronDown,
  FileText, HelpCircle, MessageSquare, X,
} from "lucide-react";
import { ProgressBar, Tabs } from "@/components/ui";
import { useUIStore, useAuthStore } from "@/store";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Component ────────────────────────────────────────────────────────────────
const LearningPage = () => {
  const { courseId, lessonId } = useParams();
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { user } = useAuthStore();
  const studentId = user?.id;

  // ── Real curriculum state ───────────────────────────────────────────────────
  const [curriculum,    setCurriculum]    = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [videoUrl,      setVideoUrl]      = useState(null);
  const [openSections,  setOpenSections]  = useState([0]);
  const [completed,     setCompleted]     = useState(new Set());
  const [progress,      setProgress]      = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const allLessons = curriculum.flatMap(s => s.lessons ?? []);
  const total      = allLessons.length;

  // ── Fetch curriculum on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !studentId) return;
    const load = async () => {
      try {
        const res = await api.get(ENDPOINTS.COURSES.PUBLIC_DETAIL, { params: { id: courseId } });
        if (res.data.status) {
          const sections = res.data.data.curriculum ?? [];
          setCurriculum(sections);
          setOpenSections([0]);
          // Auto-select first lesson
          const first = sections[0]?.lessons?.[0];
          if (first) handleSelectLesson(first);
        }
      } catch (err) {
        console.error('Failed to load curriculum', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId, studentId]);

  // ── Load secure video stream for a lesson ───────────────────────────────────
  const handleSelectLesson = async (lesson) => {
    setCurrentLesson(lesson);
    setVideoUrl(null);
    try {
      const res = await api.get(ENDPOINTS.STUDENT.LESSON_VIDEO, {
        params: { student_id: studentId, lesson_id: lesson.id }
      });
      if (res.data.status) setVideoUrl(res.data.data.video_path);
    } catch { /* locked lesson — no video available */ }
  };

  const toggleSection = (i) =>
    setOpenSections(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  // ── Mark complete & sync progress to backend ────────────────────────────────
  const toggleComplete = async (lessonId) => {
    if (completed.has(lessonId)) return; // prevent un-completing
    const next = new Set(completed);
    next.add(lessonId);
    setCompleted(next);
    setProgress(Math.round((next.size / total) * 100));
    try {
      const res = await api.post(ENDPOINTS.STUDENT.UPDATE_PROGRESS, {
        student_id: studentId,
        course_id:  courseId,
        lesson_id:  lessonId,
      });
      if (res.data.status) setProgress(res.data.data.progress);
    } catch (err) {
      console.error('Failed to sync progress', err);
    }
  };

  // ── Lesson Sidebar ──────────────────────────────────────────────────────────
  const LessonList = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full bg-gray-900 ${isMobile ? "" : "border-r border-gray-700"}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-white">Course Content</p>
          {isMobile && (
            <button onClick={closeMobileSidebar} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <ProgressBar value={progress} height="xs" color="blue" />
        <p className="text-xs text-gray-400 mt-1">{completed.size}/{total} completed</p>
      </div>

      {/* Curriculum */}
      <div className="flex-1 overflow-y-auto">
        {curriculum.map((section, si) => (
          <div key={si} className="border-b border-gray-800">
            <button
              onClick={() => toggleSection(si)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors text-right"
            >
              <span className="text-xs font-semibold text-gray-200 text-right">{section.title}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 shrink-0 ml-2 transition-transform ${openSections.includes(si) ? "rotate-180" : ""}`} />
            </button>

            {openSections.includes(si) && (
              <div>
                {section.lessons.map(lesson => {
                  const isCurrent = lesson.id === currentLesson.id;
                  const isDone    = completed.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={[
                        "w-full flex items-start gap-3 px-4 py-3 text-right transition-colors",
                        isCurrent ? "bg-blue-600/20 border-r-2 border-blue-500" : "hover:bg-gray-800",
                      ].join(" ")}
                    >
                      {/* Status icon */}
                      <div className="shrink-0 mt-0.5">
                        {isDone
                          ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                          : <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? "border-blue-400" : "border-gray-600"}`} />}
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-xs leading-snug ${isCurrent ? "text-white font-medium" : isDone ? "text-gray-400" : "text-gray-300"}`}>
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{lesson.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="flex flex-1 items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-950">

      {/* ── Video + Content Area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Video player */}
        <div className="bg-black aspect-video max-h-[60vh] flex items-center justify-center relative">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              onEnded={() => currentLesson && toggleComplete(currentLesson.id)}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">{currentLesson?.title ?? 'Select a lesson'}</p>
              <p className="text-gray-400 text-sm mt-1">{currentLesson?.duration_minutes ? `${currentLesson.duration_minutes} min` : ''}</p>
            </div>
          )}
        </div>

        {/* Lesson content tabs */}
        <div className="flex-1 overflow-y-auto bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{currentLesson.title}</h2>
            <button
              onClick={() => toggleComplete(currentLesson.id)}
              className={[
                "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all",
                completed.has(currentLesson.id)
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
              ].join(" ")}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {completed.has(currentLesson.id) ? "Completed" : "Mark Complete"}
            </button>
          </div>

          <Tabs
            variant="underline"
            tabs={[
              {
                label: "Overview",
                icon: FileText,
                content: (
                  <div className="pt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
                    <p>In this lesson, you'll explore <strong>{currentLesson.title}</strong> in depth with practical examples and real-world patterns used in production applications.</p>
                    <p>By the end you'll understand how to apply these concepts to build scalable, maintainable code that follows industry best practices.</p>
                    <div className="mt-4">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Resources</p>
                      <ul className="space-y-2">
                        {["Lesson slides (PDF)", "Source code on GitHub", "Further reading links"].map(r => (
                          <li key={r} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer text-xs">
                            <FileText className="w-3.5 h-3.5" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ),
              },
              {
                label: "Q&A",
                icon: MessageSquare,
                content: (
                  <div className="pt-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
                      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No questions yet for this lesson. Be the first to ask!
                    </div>
                    <textarea
                      placeholder="Ask a question about this lesson..."
                      className="mt-3 w-full h-20 px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ),
              },
              {
                label: "Notes",
                icon: HelpCircle,
                content: (
                  <div className="pt-4">
                    <textarea
                      placeholder="Take notes for this lesson..."
                      className="w-full h-40 px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* ── Desktop Lesson Sidebar ─────────────────────────────── */}
      <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col">
        <LessonList />
      </div>

      {/* ── Mobile Lesson Sidebar Drawer ──────────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileSidebar} />
          <div className="fixed top-14 right-0 bottom-0 w-80 z-50 lg:hidden">
            <LessonList isMobile />
          </div>
        </>
      )}
    </div>
  );
};

export default LearningPage;