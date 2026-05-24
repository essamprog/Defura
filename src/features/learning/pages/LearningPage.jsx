import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Play, CheckCircle, Lock, ChevronDown,
  FileText, HelpCircle, MessageSquare, X,
  Edit2, Trash2, CornerDownRight, Send, Save,
} from "lucide-react";
import { ProgressBar, Tabs } from "@/components/ui";
import { useUIStore, useAuthStore } from "@/store";
import { Footer } from "@/components/layout";
import { ROUTES } from "@/constants";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Component ─────────────────────────────────────────────────────────────────
const LearningPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { user } = useAuthStore();
  const studentId = user?._id ?? user?.id;

  // ── All States & Hooks at the top ───────────────────────────────────────────
  const [searchParams] = useSearchParams();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [submittingReplies, setSubmittingReplies] = useState({});

  const [curriculum,    setCurriculum]    = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [videoUrl,      setVideoUrl]      = useState(null);
  const [openSections,  setOpenSections]  = useState([0]);
  const [completed,     setCompleted]     = useState(new Set());
  const [progress,      setProgress]      = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);
  const [course,        setCourse]        = useState(null);
  const [instructorImgFailed, setInstructorImgFailed] = useState(false);

  const [notesText, setNotesText] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved'

  // ── Derived totals ──────────────────────────────────────────────────────────
  const allLessons = curriculum.flatMap(s => s.lessons ?? []);
  const total      = allLessons.length;

  // ── Q&A Discussion Fetching ─────────────────────────────────────────────────
  const fetchQuestions = async (lessonId) => {
    if (!lessonId) return;
    setLoadingQuestions(true);
    try {
      const res = await api.get(ENDPOINTS.COURSES.QA, {
        params: { lesson_id: lessonId }
      });
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load Q&A:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (currentLesson?.id) {
      fetchQuestions(currentLesson.id);
    }
  }, [currentLesson?.id]);

  useEffect(() => {
    if (courseId && currentLesson?.id) {
      const savedNotes = localStorage.getItem(`notes_${courseId}_${currentLesson.id}`);
      setNotesText(savedNotes || "");
      setSaveStatus("idle");
    }
  }, [courseId, currentLesson?.id]);

  const handleSaveNotes = () => {
    if (!courseId || !currentLesson?.id) return;
    setSaveStatus("saving");
    localStorage.setItem(`notes_${courseId}_${currentLesson.id}`, notesText);
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 600);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'qa') {
      setActiveTabIndex(1);
    } else {
      setActiveTabIndex(0);
    }
  }, [searchParams]);

  useEffect(() => {
    const questionId = searchParams.get('question_id');
    const tab = searchParams.get('tab');
    if (tab === 'qa' && questionId && questions.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`qa-item-${questionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [questions, searchParams]);

  // ── Lesson Video Stream Loader ──────────────────────────────────────────────
  const handleSelectLesson = async (lesson) => {
    setCurrentLesson(lesson);
    setVideoUrl(null);
    try {
      const res = await api.get(ENDPOINTS.STUDENT.LESSON_VIDEO, {
        params: { student_id: studentId, lesson_id: lesson.id }
      });
      if (res.data.success) setVideoUrl(res.data.data.video_path);
    } catch { /* locked lesson — no video available */ }
  };

  // ── Q&A Action Handlers ─────────────────────────────────────────────────────
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !currentLesson?.id) return;
    setSubmittingQuestion(true);
    try {
      const res = await api.post(ENDPOINTS.COURSES.QA, {
        lesson_id: currentLesson.id,
        question_text: newQuestionText.trim(),
        parent_id: null
      });
      if (res.data.success) {
        setQuestions(prev => [res.data.data, ...prev]);
        setNewQuestionText("");
      }
    } catch (err) {
      console.error("Failed to create question:", err);
      alert("Failed to submit question. Please try again.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleCreateReply = async (e, parentId) => {
    e.preventDefault();
    const replyText = replyTexts[parentId] || "";
    if (!replyText.trim() || !currentLesson?.id) return;

    setSubmittingReplies(prev => ({ ...prev, [parentId]: true }));
    try {
      const res = await api.post(ENDPOINTS.COURSES.QA, {
        lesson_id: currentLesson.id,
        question_text: replyText.trim(),
        parent_id: parentId
      });
      if (res.data.success) {
        const newReply = res.data.data;
        setQuestions(prev => prev.map(q => {
          if (q.id === parentId) {
            return {
              ...q,
              replies: [...q.replies, newReply]
            };
          }
          return q;
        }));
        setReplyTexts(prev => ({ ...prev, [parentId]: "" }));
        setActiveReplyId(null);
      }
    } catch (err) {
      console.error("Failed to create reply:", err);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReplies(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleDeletePost = async (id, parentId = null) => {
    if (!window.confirm("هل أنت متأكد من أنك تريد حذف هذه المشاركة؟")) return;
    try {
      const res = await api.delete(ENDPOINTS.COURSES.QA, {
        params: { id }
      });
      if (res.data.success) {
        if (parentId === null) {
          setQuestions(prev => prev.filter(q => q.id !== id));
        } else {
          setQuestions(prev => prev.map(q => {
            if (q.id === parentId) {
              return {
                ...q,
                replies: q.replies.filter(r => r.id !== id)
              };
            }
            return q;
          }));
        }
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  // ── Fetch curriculum & progress on mount ────────────────────────────────────
  useEffect(() => {
    if (!courseId || !studentId) return;
    const load = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(ENDPOINTS.COURSES.PUBLIC_DETAIL(courseId)),
          api.get('/student/progress.php', { params: { course_id: courseId } }).catch(err => {
            console.error('Failed to load student progress:', err);
            return null;
          })
        ]);

        if (courseRes.data.success) {
          setCourse(courseRes.data.data);
          const sections = courseRes.data.data?.curriculum ?? [];
          setCurriculum(sections);

          const completedSet = new Set();
          let currentProgress = 0;
          if (progressRes?.data?.success && progressRes.data.data.lessonProgress) {
            const lp = progressRes.data.data.lessonProgress;
            Object.keys(lp).forEach(id => {
              if (lp[id].isCompleted) {
                completedSet.add(Number(id));
              }
            });
          }
          if (progressRes?.data?.success) {
            currentProgress = progressRes.data.data.progress ?? 0;
          }
          setCompleted(completedSet);
          setProgress(currentProgress);
        } else {
          console.error('Course not found or not published');
        }
      } catch (err) {
        console.error('Failed to load curriculum or progress', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId, studentId]);

  // ── Handle lesson auto-selection based on URL parameter ──────────────────
  useEffect(() => {
    if (curriculum.length === 0) return;

    const allLessons = curriculum.flatMap(s => s.lessons ?? []);
    if (allLessons.length === 0) return;

    let selectedLesson = null;

    if (lessonId && lessonId !== "start" && lessonId !== "next") {
      selectedLesson = allLessons.find(l => String(l.id) === String(lessonId));
    } else if (lessonId === "next" || lessonId === "start") {
      selectedLesson = allLessons.find(l => !completed.has(Number(l.id)));
    }

    // Fallback to first lesson if not found
    if (!selectedLesson) {
      selectedLesson = allLessons[0];
    }

    if (selectedLesson) {
      // Find the index of the section containing this lesson to open it in the sidebar
      const sectionIdx = curriculum.findIndex(s =>
        s.lessons?.some(l => l.id === selectedLesson.id)
      );
      if (sectionIdx !== -1) {
        setOpenSections(prev => prev.includes(sectionIdx) ? prev : [...prev, sectionIdx]);
      }

      // If the lesson in params is different (e.g. 'start', 'next', or another ID), update the URL
      if (String(lessonId) !== String(selectedLesson.id)) {
        navigate(ROUTES.learning(courseId, selectedLesson.id), { replace: true });
      }

      // Trigger selection (fetch video, etc.) only if it is different from currently active lesson
      if (!currentLesson || currentLesson.id !== selectedLesson.id) {
        handleSelectLesson(selectedLesson);
      }
    }
  }, [curriculum, completed, lessonId, courseId, navigate]);

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
      if (res.data.success) setProgress(res.data.data.progress ?? Math.round((next.size / total) * 100));

    } catch (err) {
      console.error('Failed to sync progress', err);
    }
  };

  const handleReviewSubmit = (reviewData) => {
    setCourse(prev => {
      if (!prev) return prev;
      
      const existingReviews = prev.reviews ?? [];
      const studentName = user?.full_name ?? user?.name ?? "You";
      const studentAvatar = user?.profile_picture ?? user?.avatar ?? null;
      
      let userProfileUrl = user?.website || user?.linkedin || user?.github || null;
      if (userProfileUrl && !/^(?:f|ht)tps?:\/\//i.test(userProfileUrl)) {
        userProfileUrl = "https://" + userProfileUrl;
      }
      
      const otherReviews = existingReviews.filter(r => Number(r.student_id) !== Number(studentId));
      const newReview = {
        student_id: studentId,
        rating: reviewData.my_rating,
        comment: reviewData.my_comment,
        created_at: new Date().toISOString(),
        student_name: studentName,
        student_avatar: studentAvatar,
        profile_url: userProfileUrl
      };

      return {
        ...prev,
        average_rating: reviewData.average_rating,
        review_count: reviewData.review_count,
        my_review: {
          rating: reviewData.my_rating,
          comment: reviewData.my_comment
        },
        reviews: [newReview, ...otherReviews]
      };
    });
  };

  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

  const handleDeleteReview = async () => {
    if (!window.confirm("هل أنت متأكد من أنك تريد حذف تقييمك؟")) return;
    setDeletingReview(true);
    try {
      const res = await api.post('/student/delete_review.php', {
        course_id: course.id
      });
      if (res.data.success) {
        // Remove from the list in state
        setCourse(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            reviews: (prev.reviews ?? []).filter(r => Number(r.student_id) !== Number(studentId)),
            my_review: null,
            average_rating: res.data.data.average_rating,
            review_count: res.data.data.review_count
          };
        });
        setReviewToEdit({ rating: 0, comment: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    } finally {
      setDeletingReview(false);
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
                  const isCurrent = currentLesson ? lesson.id === currentLesson.id : false;
                  const isDone    = completed.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(ROUTES.learning(courseId, lesson.id))}
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
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {lesson.duration ? `${lesson.duration}m video` : ''}
                        </p>
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

  // ── Guard: invalid courseId ──────────────────────────────────────────────
  const handleInstructorProfileClick = () => {
    const instructorId = course?.instructor_id ?? course?.instructorId ?? course?.instructor?.id;
    if (!instructorId) return;
    navigate(ROUTES.publicInstructorProfile(instructorId));
  };

  if (!courseId || courseId === 'undefined') return (
    <div className="flex flex-1 items-center justify-center bg-gray-950 flex-col gap-4">
      <p className="text-white text-lg font-semibold">Course not found.</p>
      <button
        onClick={() => navigate('/my-courses')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
      >
        Go to My Courses
      </button>
    </div>
  );

  // ── Loading cart ─────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex flex-1 items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-950">

      {/* ── Desktop Lesson Sidebar ─────────────────────────────── */}
      <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col">
        <LessonList />
      </div>

      {/* ── Mobile Lesson Sidebar Drawer ──────────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileSidebar} />
          <div className="fixed top-14 left-0 bottom-0 w-80 z-50 lg:hidden">
            <LessonList isMobile />
          </div>
        </>
      )}

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
        <div className="flex-1 overflow-y-auto bg-white flex flex-col justify-between">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{currentLesson?.title ?? 'Select a lesson to begin'}</h2>
            {currentLesson && (
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
            )}
          </div>

          {currentLesson ? (
          <Tabs
            variant="underline"
            activeIndex={activeTabIndex}
            onChange={setActiveTabIndex}
            tabs={[
              {
                label: "Overview",
                icon: FileText,
                content: (
                  <div className="pt-4 space-y-6 text-sm text-gray-600 leading-relaxed">
                    <div>
                      <p>In this lesson, you'll explore <strong>{currentLesson.title}</strong> in depth with practical examples and real-world patterns used in production applications.</p>
                      <p className="mt-2">By the end you'll understand how to apply these concepts to build scalable, maintainable code that follows industry best practices.</p>
                    </div>

                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Resources</p>
                        <ul className="space-y-2">
                          {currentLesson.resources.map(res => (
                            <li key={res.id} className="text-blue-600 hover:text-blue-700 text-xs">
                              <a
                                href={res.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                              >
                                <FileText className="w-3.5 h-3.5" /> {res.file_name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course && (
                      <div className="mt-8 pt-6 border-t border-gray-100 space-y-6">
                        {/* Grid Container for Instructor & Course Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                          
                          {/* Column 1: Instructor Profile Info */}
                           <button
                              type="button"
                              onClick={handleInstructorProfileClick}
                              className="w-full text-left bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              {course.instructor_avatar && !instructorImgFailed ? (
                                <img
                                  src={course.instructor_avatar}
                                  alt={course.instructor_name}
                                  onError={() => setInstructorImgFailed(true)}
                                  className="w-24 h-24 rounded-full border-2 border-white shadow-md object-cover shrink-0 group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className={[
                                  "w-24 h-24 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-3xl uppercase shrink-0 select-none group-hover:scale-105 transition-transform duration-200",
                                  (course.instructor_name || "I").charCodeAt(0) % 2 === 0
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-indigo-200"
                                    : "bg-gradient-to-br from-purple-500 to-pink-600 text-white border-pink-200"
                                ].join(" ")}>
                                  {(course.instructor_name || "I").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instructor</p>
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate mt-1">{course.instructor_name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{course.expertise || "Senior Educator"}</p>
                              </div>
                            </button>

                          {/* Column 2: Course Quick Metadata */}
                          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-4">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Course details</h4>
                            
                            <div className="grid grid-cols-2 gap-y-3.5 gap-x-5">
                              <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </span>
                                <span className="font-semibold text-gray-880">{formatSecondsToHours(course.total_duration)}</span>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                </span>
                                <span className="font-semibold text-gray-880 capitalize">{course.level || "Beginner"}</span>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-700 col-span-2">
                                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                </span>
                                <span className="font-medium text-gray-800">
                                  Updated: {formatUpdatedDate(course.updated_at || course.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Rating Row */}
                            <div className="flex items-center gap-2.5 border-t border-gray-200 pt-3">
                              <div className="flex items-center gap-1.5 text-amber-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span className="text-base font-bold text-gray-900">{parseFloat(course.average_rating || 0).toFixed(1)}</span>
                              </div>
                              <span className="text-sm text-gray-500 font-medium">({course.review_count || 0} reviews)</span>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Interactive Review Widget */}
                        <div id="rating-section" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4 scroll-mt-6">
                          <div>
                            <h4 className="text-base font-bold text-gray-900">Rate this course</h4>
                            <p className="text-sm text-gray-600 mt-1">Let us and fellow students know what you think about the curriculum and instructor.</p>
                          </div>

                          <CourseReviewForm
                            courseId={course.id}
                            reviewToEdit={reviewToEdit}
                            onReviewSubmit={handleReviewSubmit}
                          />
                        </div>

                        {/* Section 3: Course Reviews List */}
                        {course.reviews && course.reviews.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                            <h4 className="text-lg font-bold text-gray-900">Student Reviews ({course.reviews.length})</h4>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {course.reviews.map((rev, index) => {
                                const revFirstLetter = (rev.student_name || "S").charAt(0).toUpperCase();
                                const isMyReview = Number(rev.student_id) === Number(studentId);
                                return (
                                  <div key={index} className="bg-gray-50/40 border border-gray-100 rounded-2xl p-5 space-y-3 hover:bg-gray-50/70 transition-colors duration-200">
                                    {/* Header info */}
                                    <div className="flex items-center gap-3.5">
                                      {rev.profile_url ? (
                                        <a 
                                          href={rev.profile_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="shrink-0 relative block transition-transform hover:scale-105 duration-200 cursor-pointer group"
                                        >
                                          {rev.student_avatar ? (
                                            <img
                                              src={rev.student_avatar}
                                              alt={rev.student_name}
                                              className="w-20 h-20 rounded-full border border-gray-200 object-cover group-hover:border-blue-400 transition-colors"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display = "flex";
                                              }}
                                            />
                                          ) : null}
                                          {/* Fallback avatar if no avatar or broken */}
                                          <div 
                                            style={{ display: rev.student_avatar ? "none" : "flex" }}
                                            className={[
                                              "w-20 h-20 rounded-full border border-gray-200 items-center justify-center font-bold text-2xl uppercase select-none text-white transition-colors group-hover:border-blue-400",
                                              revFirstLetter.charCodeAt(0) % 2 === 0 ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                            ].join(" ")}
                                          >
                                            {revFirstLetter}
                                          </div>
                                        </a>
                                      ) : (
                                        <div className="shrink-0 relative">
                                          {rev.student_avatar ? (
                                            <img
                                              src={rev.student_avatar}
                                              alt={rev.student_name}
                                              className="w-20 h-20 rounded-full border border-gray-200 object-cover"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display = "flex";
                                              }}
                                            />
                                          ) : null}
                                          {/* Fallback avatar if no avatar or broken */}
                                          <div 
                                            style={{ display: rev.student_avatar ? "none" : "flex" }}
                                            className={[
                                              "w-20 h-20 rounded-full border border-gray-200 items-center justify-center font-bold text-2xl uppercase select-none text-white",
                                              revFirstLetter.charCodeAt(0) % 2 === 0 ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                            ].join(" ")}
                                          >
                                            {revFirstLetter}
                                          </div>
                                        </div>
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between">
                                          <div className="min-w-0 flex-1">
                                            <h5 className="text-lg font-bold text-gray-900 truncate">
                                              {rev.profile_url ? (
                                                <a 
                                                  href={rev.profile_url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="hover:text-blue-600 hover:underline transition-colors duration-150 inline-block cursor-pointer"
                                                >
                                                  {rev.student_name}
                                                </a>
                                              ) : (
                                                rev.student_name
                                              )}
                                            </h5>
                                            {/* Review Stars & Date Row */}
                                            <div className="flex items-center gap-2.5 mt-1.5">
                                              <div className="flex items-center gap-0.5 text-amber-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <svg
                                                    key={star}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill={rev.rating >= star ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    className="w-5 h-5"
                                                  >
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                  </svg>
                                                ))}
                                              </div>
                                              <span className="text-sm text-gray-500 font-semibold border-r border-gray-200 pr-2.5 leading-none">
                                                {formatUpdatedDate(rev.created_at)}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Edit & Delete buttons for my review */}
                                          {isMyReview && (
                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                              <button
                                                onClick={() => {
                                                  setReviewToEdit({ rating: rev.rating, comment: rev.comment, timestamp: Date.now() });
                                                  document.getElementById("rating-section")?.scrollIntoView({ behavior: "smooth" });
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                              >
                                                <Edit2 className="w-3 h-3" />
                                                Edit
                                              </button>
                                              <button
                                                onClick={handleDeleteReview}
                                                disabled={deletingReview}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Comment Body */}
                                    {rev.comment && (
                                      <p className="text-base text-gray-800 leading-relaxed pl-[94px] pr-2 break-words">
                                        {rev.comment}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: "Q&A",
                icon: MessageSquare,
                content: (
                  <div className="pt-4 space-y-6">
                    {/* Add Question Form */}
                    <form onSubmit={handleCreateQuestion} className="space-y-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-gray-900">Ask a new question</h3>
                      <div className="relative">
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="What is your question about this lesson?..."
                          rows={3}
                          className="w-full text-sm rounded-xl border border-gray-200 px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={submittingQuestion || !newQuestionText.trim()}
                          className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>

                    {/* Questions Thread Tree */}
                    {loadingQuestions ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="bg-gray-50 rounded-2xl p-8 text-sm text-gray-500 text-center border border-dashed border-gray-200">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="font-semibold text-gray-700">No questions yet for this lesson</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to ask! Your instructor and peers can reply here.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map((question) => {
                          const isHighlighted = String(searchParams.get('question_id')) === String(question.id);
                          const userFirstLetter = (question.userName || "U").charAt(0).toUpperCase();
                          const isQuestionAuthor = Number(user?.id ?? user?._id) === Number(question.userId);
                          const canDeleteQuestion = isQuestionAuthor || Number(user?.id ?? user?._id) === Number(course?.instructor_id) || user?.role === 'admin';

                          return (
                            <div 
                              key={question.id} 
                              id={`qa-item-${question.id}`}
                              className="qa-thread-container"
                            >

                              {/* Question Card */}
                              <div className={`group/card bg-gray-50/50 hover:bg-gray-50 border rounded-2xl p-4 transition-all duration-300 shadow-sm ${
                                isHighlighted 
                                  ? "ring-2 ring-blue-500 bg-blue-50/30 border-blue-200 shadow-blue-50" 
                                  : "border-gray-100"
                              }`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    {question.userAvatar ? (
                                      <img
                                        src={question.userAvatar}
                                        alt={question.userName}
                                        className="w-10 h-10 rounded-full border border-white shadow-sm object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = "none";
                                          e.target.nextSibling.style.display = "flex";
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      style={{ display: question.userAvatar ? "none" : "flex" }}
                                      className={[
                                        "w-10 h-10 rounded-full items-center justify-center font-bold text-lg uppercase select-none text-white shadow-sm",
                                        userFirstLetter.charCodeAt(0) % 2 === 0 
                                          ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                                          : "bg-gradient-to-br from-purple-500 to-pink-600"
                                      ].join(" ")}
                                    >
                                      {userFirstLetter}
                                    </div>

                                    {/* Name and Badge */}
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-900">{question.userName}</span>
                                        {question.userRole === 'instructor' ? (
                                          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                            Instructor
                                          </span>
                                        ) : (
                                          <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                            Student
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-gray-400">
                                        {formatUpdatedDate(question.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Delete Question */}
                                  {canDeleteQuestion && (
                                    <button
                                      onClick={() => handleDeletePost(question.id)}
                                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover/card:opacity-100 focus:opacity-100"
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-wrap">
                                  {question.questionText}
                                </p>

                                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-100">
                                  <button
                                    onClick={() => setActiveReplyId(activeReplyId === question.id ? null : question.id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                  >
                                    <CornerDownRight className="w-3.5 h-3.5" />
                                    Reply
                                  </button>
                                </div>
                              </div>

                              {/* Nested Replies List */}
                              <div className="pl-11 mt-3 space-y-3">
                                {question.replies && question.replies.map((reply) => {
                                  const isReplyHighlighted = String(searchParams.get('question_id')) === String(reply.id);
                                  const replyUserFirstLetter = (reply.userName || "U").charAt(0).toUpperCase();
                                  const isReplyAuthor = Number(user?.id ?? user?._id) === Number(reply.userId);
                                  const canDeleteReply = isReplyAuthor || Number(user?.id ?? user?._id) === Number(course?.instructor_id) || user?.role === 'admin';

                                  return (
                                    <div 
                                      key={reply.id} 
                                      id={`qa-item-${reply.id}`}
                                      className="qa-reply-item"
                                    >
                                      {/* Curved Connector Line */}
                                      <div className="qa-reply-connector" />

                                      {/* Reply Card */}
                                      <div className={`group/reply bg-white hover:bg-gray-50/50 border rounded-xl p-3.5 transition-all duration-200 shadow-sm ${
                                        isReplyHighlighted 
                                          ? "ring-2 ring-blue-500 bg-blue-50/20 border-blue-200 shadow-blue-50" 
                                          : "border-gray-100"
                                      }`}>
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-2.5">
                                            {/* Avatar */}
                                            {reply.userAvatar ? (
                                              <img
                                                src={reply.userAvatar}
                                                alt={reply.userName}
                                                className="w-8 h-8 rounded-full border border-white shadow-sm object-cover"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.style.display = "none";
                                                  e.target.nextSibling.style.display = "flex";
                                                }}
                                              />
                                            ) : null}
                                            <div 
                                              style={{ display: reply.userAvatar ? "none" : "flex" }}
                                              className={[
                                                "w-8 h-8 rounded-full items-center justify-center font-bold text-sm uppercase select-none text-white shadow-sm",
                                                replyUserFirstLetter.charCodeAt(0) % 2 === 0 
                                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                                                  : "bg-gradient-to-br from-purple-500 to-pink-600"
                                              ].join(" ")}
                                            >
                                              {replyUserFirstLetter}
                                            </div>

                                            {/* Name and Badge */}
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs text-gray-900">{reply.userName}</span>
                                                {reply.userRole === 'instructor' ? (
                                                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                    Instructor
                                                  </span>
                                                ) : (
                                                  <span className="bg-gray-100 text-gray-600 text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                                    Student
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[9px] text-gray-400">
                                                {formatUpdatedDate(reply.createdAt)}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Delete Reply */}
                                          {canDeleteReply && (
                                            <button
                                              onClick={() => handleDeletePost(reply.id, question.id)}
                                              className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover/reply:opacity-100 focus:opacity-100"
                                              title="Delete Reply"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>

                                        <p className="text-xs text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
                                          {reply.questionText}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Active Inline Reply Form */}
                                {activeReplyId === question.id && (
                                  <div className="qa-reply-item">
                                    <div className="qa-reply-connector" />
                                    <form 
                                      onSubmit={(e) => handleCreateReply(e, question.id)}
                                      className="flex gap-2 bg-gray-50/50 p-2 border border-gray-100 rounded-xl"
                                    >
                                      <textarea
                                        value={replyTexts[question.id] || ""}
                                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [question.id]: e.target.value }))}
                                        placeholder="Write a reply..."
                                        rows={1}
                                        className="flex-1 text-xs rounded-lg border border-gray-200 px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none bg-white font-sans"
                                      />
                                      <button
                                        type="submit"
                                        disabled={submittingReplies[question.id] || !(replyTexts[question.id] || "").trim()}
                                        className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: "Notes",
                icon: FileText,
                content: (
                  <div className="pt-4 space-y-4">
                    <textarea
                      value={notesText}
                      onChange={(e) => {
                        setNotesText(e.target.value);
                        if (saveStatus === "saved") setSaveStatus("idle");
                      }}
                      placeholder="Take notes for this lesson..."
                      className="w-full h-40 px-3.5 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400 shadow-inner font-sans transition-all"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {notesText ? `${notesText.length} characters` : "No notes yet"}
                      </span>
                      <button
                        onClick={handleSaveNotes}
                        disabled={saveStatus === "saving"}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Notes"}
                      </button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
              <Play className="w-10 h-10 text-gray-200" />
              <p className="text-sm">Select a lesson from the sidebar to begin</p>
            </div>
            )}
          </div>
          <div className="mt-12">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatSecondsToHours = (seconds) => {
  if (!seconds) return "0h 0m";
  const totalMin = Math.round(seconds / 60);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatUpdatedDate = (dateStr) => {
  try {
    if (!dateStr) return "June 24, 2024";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "June 24, 2024";
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (err) {
    return "June 24, 2024";
  }
};

// ── CourseReviewForm Component ───────────────────────────────────────────────
const CourseReviewForm = ({ courseId, reviewToEdit, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Reset form when course changes
  useEffect(() => {
    setRating(0);
    setComment("");
    setMessage("");
  }, [courseId]);

  // Populates form when student clicks "Edit" on their review
  useEffect(() => {
    if (reviewToEdit) {
      setRating(reviewToEdit.rating ?? 0);
      setComment(reviewToEdit.comment ?? "");
    }
  }, [reviewToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setMessage("Please select a rating between 1 and 5.");
      setIsSuccess(false);
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await api.post('/student/add_review.php', {
        course_id: courseId,
        rating,
        comment
      });
      if (res.data.success) {
        // Clear form immediately
        setComment("");
        setRating(0);
        setMessage("Your review has been submitted successfully!");
        setIsSuccess(true);
        onReviewSubmit({
          average_rating: res.data.data.average_rating,
          review_count: res.data.data.review_count,
          my_rating: rating,
          my_comment: comment
        });
      } else {
        setMessage(res.data.message ?? "Failed to submit review.");
        setIsSuccess(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.message ?? "An error occurred while submitting your review.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-amber-400 focus:outline-none hover:scale-110 transition-transform animate-none bg-transparent border-0 p-0 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback about this course (optional)..."
        rows={3}
        className="w-full text-sm rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
      />

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      {message && (
        <p className={`text-xs font-semibold mt-1.5 ${isSuccess ? "text-emerald-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default LearningPage;
