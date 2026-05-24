import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FileText, Video, Paperclip,
  ChevronDown, CloudUpload, Info, X, ImageIcon,
  Plus, Loader2, AlertCircle, CheckCircle, FolderPlus,
  Lock, Eye,
} from "lucide-react";
import { ROUTES } from "@/constants";
import instructorService from "../services/instructorService";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// ─── Shared field class ────────────────────────────────────────────────────────
const fieldCls =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all";

// ─── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
      type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    }`}
  >
    {type === "success"
      ? <CheckCircle className="w-4 h-4 shrink-0" />
      : <AlertCircle className="w-4 h-4 shrink-0" />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── New Section Modal ─────────────────────────────────────────────────────────
const NewSectionModal = ({ courseId, onCreated, onClose }) => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) { setError("Section title is required."); return; }
    setSaving(true);
    try {
      const { data: res } = await api.post(ENDPOINTS.INSTRUCTOR.SAVE_SECTION, {
        course_id: Number(courseId),
        title: title.trim(),
        order_index: 0,
      });
      onCreated({ id: res.data?.id, title: title.trim() });
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create section.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
            <FolderPlus className="w-4 h-4" style={{ color: "#7C3AED" }} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Create New Section</h3>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Section Title</label>
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. Introduction to React"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          className={fieldCls}
        />
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-all"
            style={{ background: "#6D28D9" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Creating…" : "Create Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AddNewLessonPage = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const [searchParams] = useSearchParams();

  // lessonId in query = edit mode
  const editLessonId = searchParams.get("lessonId") ?? null;
  const isEditMode   = !!editLessonId;

  // Navigation state from InstructorCourseDetailPage
  const prefill = location.state ?? {};
  // prefill.courseId  — course id (always present)
  // prefill.lesson    — full lesson object (present in edit mode)

  const [courseList,      setCourseList]      = useState([]);
  const [sectionList,     setSectionList]     = useState([]);
  const [loadingCourses,  setLoadingCourses]  = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingLesson,   setLoadingLesson]   = useState(isEditMode);
  const [showNewSection,  setShowNewSection]  = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    course:      String(prefill.courseId ?? ""),
    section:     "",
    title:       "",
    order:       "1",
    duration:    "15",
    videoTab:    "direct",
    // "free"      = anyone can watch (is_free_preview = 1)
    // "enrolled"  = only paid/enrolled students (is_free_preview = 0)
    visibility:  "enrolled",
    thumbnail:   null,
    videoUrl:    "",
    existingVideoUrl: "", // video already saved in DB (edit mode)
  });

  const [dragOver,    setDragOver]    = useState(false);
  const [videoFile,   setVideoFile]   = useState(null);
  const [uploadPct,   setUploadPct]   = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [errors,      setErrors]      = useState({});

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── 1. Load courses ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingCourses(true);
      try {
        const { data: res } = await instructorService.getCourses();
        const courses = res.data?.courses ?? res.data ?? [];
        setCourseList(courses);

        if (!prefill.courseId && courses.length > 0) {
          set("course", String(courses[0].id ?? courses[0]._id));
        }
      } catch {
        showToast("Failed to load courses.", "error");
      } finally {
        setLoadingCourses(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Load sections when course changes ──────────────────────────────────────
  useEffect(() => {
    if (!form.course) { setSectionList([]); return; }

    const load = async () => {
      setLoadingSections(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.INSTRUCTOR.CURRICULUM, {
          params: { course_id: form.course },
        });
        const sections = res.data ?? [];
        setSectionList(sections);

        // In edit mode: keep section from lesson data (set after lesson loads)
        // In create mode: auto-select first
        if (!isEditMode && sections.length > 0) {
          set("section", String(sections[0].id));
        }
      } catch {
        showToast("Could not load sections for this course.", "error");
      } finally {
        setLoadingSections(false);
      }
    };
    load();
  }, [form.course]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Load existing lesson data in edit mode ─────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    const lesson = prefill.lesson; // passed from InstructorCourseDetailPage

    if (lesson) {
      // We already have full lesson data from navigation state
      populateForm(lesson);
    } else {
      // Fallback: fetch from curriculum (won't normally happen)
      setLoadingLesson(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const populateForm = (lesson) => {
    const sectionId  = String(lesson.section_id ?? lesson.sectionId ?? "");
    const videoPath  = lesson.video_path ?? lesson.videoPath ?? "";
    const isExternal = videoPath && (videoPath.startsWith("http") || videoPath.startsWith("https"));
    const isFree     = lesson.is_free_preview == 1 || lesson.is_free == 1 || lesson.isFree == 1;

    setForm(p => ({
      ...p,
      section:          sectionId,
      title:            lesson.title ?? "",
      order:            String(lesson.order_index ?? lesson.orderIndex ?? 1),
      duration:         String(lesson.duration_minutes ?? lesson.durationMinutes ?? 15),
      videoTab:         isExternal ? "external" : "direct",
      videoUrl:         isExternal ? videoPath : "",
      existingVideoUrl: isExternal ? "" : videoPath,
      visibility:       isFree ? "free" : "enrolled",
    }));

    // Also select section in the dropdown after sections load
    if (sectionId) {
      setSectionList(prev => {
        // If sections already loaded, select it
        const found = prev.find(s => String(s.id) === sectionId);
        if (found) set("section", sectionId);
        return prev;
      });
    }

    setLoadingLesson(false);
  };

  // ── 4. When sections load in edit mode, ensure section is selected ─────────
  useEffect(() => {
    if (!isEditMode || !form.section || sectionList.length === 0) return;
    const found = sectionList.find(s => String(s.id) === form.section);
    if (!found && sectionList.length > 0) {
      set("section", String(sectionList[0].id));
    }
  }, [sectionList]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Video file handler ────────────────────────────────────────────────────────
  const handleVideoFile = file => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setErrors(p => ({ ...p, video: "" }));
    } else {
      showToast("Please select a valid video file.", "error");
    }
  };

  // ── Validate ──────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.course)       e.course  = "Please select a course.";
    if (!form.section)      e.section = "Please select or create a section.";
    if (!form.title.trim()) e.title   = "Lesson title is required.";

    // In edit mode video is optional (already uploaded), in create mode required
    if (!isEditMode) {
      if (form.videoTab === "direct" && !videoFile)
        e.video = "Please upload a video file.";
      if (form.videoTab === "external" && !form.videoUrl.trim())
        e.video = "Please enter a video URL.";
    } else {
      // In edit mode, only require URL if external tab and field is empty AND no existing
      if (form.videoTab === "external" && !form.videoUrl.trim() && !form.existingVideoUrl)
        e.video = "Please enter a video URL.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save / Update lesson ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const isFree = form.visibility === "free";

      if (isEditMode) {
        // ── UPDATE existing lesson ──────────────────────────────────────────────
        const payload = {
          id:               Number(editLessonId),
          section_id:       Number(form.section),
          title:            form.title.trim(),
          duration_minutes: Number(form.duration) || 0,
          order_index:      Number(form.order)    || 1,
          is_free_preview:  isFree ? 1 : 0,
          status:           "published",
          ...(form.videoTab === "external" && form.videoUrl.trim()
            ? { video_path: form.videoUrl.trim() }
            : {}),
        };

        await api.post(ENDPOINTS.INSTRUCTOR.SAVE_LESSON, payload);

        // Upload new video if provided in edit mode
        if (form.videoTab === "direct" && videoFile) {
          setUploadPct(0);
          const formData = new FormData();
          formData.append("file",       videoFile);
          formData.append("type",       "video");
          formData.append("course_id",  form.course);
          formData.append("lesson_id",  String(editLessonId));

          await api.post(ENDPOINTS.INSTRUCTOR.UPLOAD_MEDIA, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: e =>
              setUploadPct(Math.round((e.loaded / e.total) * 100)),
          });
          setUploadPct(null);
        }

        showToast("Lesson updated successfully! ✅", "success");

      } else {
        // ── CREATE new lesson ───────────────────────────────────────────────────
        const payload = {
          section_id:       Number(form.section),
          title:            form.title.trim(),
          video_path:       form.videoTab === "external" ? form.videoUrl.trim() : null,
          duration_minutes: Number(form.duration) || 0,
          order_index:      Number(form.order)    || 1,
          is_free_preview:  isFree ? 1 : 0,
          status:           "published",
        };

        const { data: lessonRes } = await api.post(ENDPOINTS.INSTRUCTOR.SAVE_LESSON, payload);
        const lessonId = lessonRes.data?.id;

        // Upload video after lesson is created (needs lesson_id)
        if (form.videoTab === "direct" && videoFile && lessonId) {
          setUploadPct(0);
          const formData = new FormData();
          formData.append("file",       videoFile);
          formData.append("type",       "video");
          formData.append("course_id",  form.course);
          formData.append("lesson_id",  String(lessonId));

          await api.post(ENDPOINTS.INSTRUCTOR.UPLOAD_MEDIA, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: e =>
              setUploadPct(Math.round((e.loaded / e.total) * 100)),
          });
          setUploadPct(null);
        }

        showToast("Lesson saved successfully! ✅", "success");
      }

      setTimeout(() => {
        navigate(`${ROUTES.INSTRUCTOR_COURSES}/${form.course}`);
      }, 1200);

    } catch (err) {
      console.error("Save lesson error:", err);
      showToast(
        err.response?.data?.message ?? "Failed to save lesson. Please try again.",
        "error"
      );
      setUploadPct(null);
    } finally {
      setSaving(false);
    }
  };

  // ── After new section created ─────────────────────────────────────────────────
  const handleSectionCreated = (newSection) => {
    setSectionList(prev => [...prev, newSection]);
    set("section", String(newSection.id));
    setShowNewSection(false);
    showToast(`Section "${newSection.title}" created! ✅`, "success");
  };

  // ── Progress ──────────────────────────────────────────────────────────────────
  const progress = (() => {
    let n = 0;
    if (form.course)       n++;
    if (form.section)      n++;
    if (form.title.trim()) n++;
    if (form.videoTab === "direct"
      ? (videoFile || form.existingVideoUrl)
      : form.videoUrl.trim())           n++;
    if (form.thumbnail)    n++;
    return Math.round((n / 5) * 100);
  })();

  // ── Loading skeleton for edit mode ────────────────────────────────────────────
  if (loadingLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F3FF" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7C3AED" }} />
          <p className="text-sm text-gray-500">Loading lesson data…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "#F4F3FF", fontFamily: "'DM Sans','Inter',sans-serif" }}
    >
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {showNewSection && (
        <NewSectionModal
          courseId={form.course}
          onCreated={handleSectionCreated}
          onClose={() => setShowNewSection(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {isEditMode ? "Edit Lesson" : "Add New Lesson"}
            </h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              {isEditMode
                ? "Update lesson details, replace the video, or change visibility."
                : "Create an engaging learning experience with high-quality video content."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-6 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-2"
              style={{ background: "#6D28D9" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : isEditMode ? "Update Lesson" : "Save Lesson"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* ── Lesson Details card ────────────────────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <FileText className="w-4 h-4" style={{ color: "#7C3AED" }} />
                </div>
                <h2 className="text-base font-bold text-gray-900">Lesson Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                {/* Course selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Select Course <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    {loadingCourses ? (
                      <div className={fieldCls + " flex items-center gap-2 text-gray-400"}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading courses…</span>
                      </div>
                    ) : (
                      <select
                        value={form.course}
                        onChange={e => {
                          set("course", e.target.value);
                          setErrors(p => ({ ...p, course: "" }));
                        }}
                        disabled={isEditMode} // can't change course in edit mode
                        className={fieldCls + " appearance-none pr-9 cursor-pointer disabled:opacity-60" +
                          (errors.course ? " border-red-400" : "")}
                      >
                        <option value="">— Select a course —</option>
                        {courseList.map(c => (
                          <option key={c.id ?? c._id} value={String(c.id ?? c._id)}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.course && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.course}
                    </p>
                  )}
                </div>

                {/* Section selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-500">
                      Select Section <span className="text-red-400">*</span>
                    </label>
                    {form.course && (
                      <button
                        type="button"
                        onClick={() => setShowNewSection(true)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> New Section
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    {loadingSections ? (
                      <div className={fieldCls + " flex items-center gap-2 text-gray-400"}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading sections…</span>
                      </div>
                    ) : (
                      <select
                        value={form.section}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "__new__") { setShowNewSection(true); }
                          else { set("section", val); setErrors(p => ({ ...p, section: "" })); }
                        }}
                        disabled={!form.course}
                        className={fieldCls + " appearance-none pr-9 cursor-pointer disabled:opacity-50" +
                          (errors.section ? " border-red-400" : "")}
                      >
                        {form.course && (
                          <option value="__new__">➕ Create New Section…</option>
                        )}
                        {!form.course && (
                          <option value="">— Select a course first —</option>
                        )}
                        {form.course && sectionList.length === 0 && (
                          <option value="" disabled>No sections found</option>
                        )}
                        {sectionList.map(s => (
                          <option key={s.id} value={String(s.id)}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.section && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.section}
                    </p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Lesson Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Understanding Layer Blurring"
                  value={form.title}
                  onChange={e => { set("title", e.target.value); setErrors(p => ({ ...p, title: "" })); }}
                  className={fieldCls + (errors.title ? " border-red-400" : "")}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Order + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson Order</label>
                  <input
                    type="number" min="1"
                    value={form.order}
                    onChange={e => set("order", e.target.value)}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duration (min)</label>
                  <input
                    type="number" min="1" placeholder="15"
                    value={form.duration}
                    onChange={e => set("duration", e.target.value)}
                    className={fieldCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Video Content ───────────────────────────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                    <Video className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Video Content {!isEditMode && <span className="text-red-400">*</span>}
                    </h2>
                    {isEditMode && form.existingVideoUrl && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        ✅ Video already uploaded — upload a new file to replace it
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { key: "direct",   label: "Direct Upload" },
                    { key: "external", label: "External Link" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { set("videoTab", tab.key); setErrors(p => ({ ...p, video: "" })); }}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        form.videoTab === tab.key
                          ? { background: "#7C3AED", color: "white" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                      }
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.videoTab === "direct" ? (
                <>
                  {/* Upload progress */}
                  {uploadPct !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading video…</span>
                        <span className="font-bold text-violet-600">{uploadPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadPct}%`, background: "#7C3AED" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleVideoFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById("videoInput").click()}
                    className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
                    style={{
                      borderColor: errors.video ? "#EF4444" : dragOver ? "#7C3AED" : "#E5E7EB",
                      background:  dragOver ? "#F5F3FF" : "#FAFAFA",
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                      <CloudUpload className="w-7 h-7" style={{ color: "#7C3AED" }} />
                    </div>

                    {videoFile ? (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">✅ {videoFile.name}</p>
                        <p className="text-xs text-gray-400">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        <button
                          onClick={e => { e.stopPropagation(); setVideoFile(null); }}
                          className="mt-2 text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800 mb-1">
                          {isEditMode ? "Drop a new video to replace" : "Drag and drop video files"}
                        </p>
                        <p className="text-sm text-gray-400">Recommended: MP4, 1080p, Max 500MB</p>
                      </div>
                    )}

                    <button
                      className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                      style={{ background: "#7C3AED" }}
                    >
                      Select File
                    </button>
                    <input
                      id="videoInput"
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={e => handleVideoFile(e.target.files[0])}
                    />
                  </div>

                  {errors.video && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.video}
                    </p>
                  )}

                  <div
                    className="flex items-start gap-3 mt-4 px-4 py-3 rounded-xl"
                    style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}
                  >
                    <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#6366F1" }} />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Only MP4 and WEBM formats are supported. Max file size is 500 MB.
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={e => { set("videoUrl", e.target.value); setErrors(p => ({ ...p, video: "" })); }}
                    className={fieldCls + (errors.video ? " border-red-400" : "")}
                  />
                  {errors.video && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.video}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Supports YouTube, Vimeo, and direct MP4 links.</p>
                </div>
              )}
            </div>

            {/* ── Lesson Attachments ─────────────────────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <Paperclip className="w-4 h-4" style={{ color: "#7C3AED" }} />
                </div>
                <h2 className="text-base font-bold text-gray-900">Lesson Attachments</h2>
              </div>

              <div
                className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-300 transition-colors"
                style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
                onClick={() => document.getElementById("attachInput").click()}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <FileText className="w-6 h-6" style={{ color: "#7C3AED" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800 mb-0.5">Upload resources</p>
                  <p className="text-xs text-gray-400">PDF, PPTX, or ZIP (Max 50MB)</p>
                </div>
                <button
                  className="px-5 py-2 rounded-xl border text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#D1D5DB" }}
                >
                  Add Files
                </button>
                <input
                  id="attachInput"
                  type="file"
                  multiple
                  accept=".pdf,.pptx,.zip"
                  className="hidden"
                  onChange={e => setAttachments(prev => [...prev, ...Array.from(e.target.files)])}
                />
              </div>

              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
                    >
                      <span className="text-xs font-medium text-gray-700 truncate">{f.name}</span>
                      <button
                        onClick={() => setAttachments(p => p.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ────────────────────────────────── */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-6 space-y-6">

              {/* Thumbnail */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                    <ImageIcon className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Lesson Thumbnail</h3>
                </div>

                <div
                  className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => document.getElementById("thumbInput").click()}
                >
                  <img
                    src={
                      form.thumbnail
                        ? URL.createObjectURL(form.thumbnail)
                        : "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?w=400&q=80"
                    }
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  id="thumbInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => set("thumbnail", e.target.files[0])}
                />
                <button
                  className="w-full py-2 rounded-xl text-white text-xs font-semibold mb-3"
                  style={{ background: "#7C3AED" }}
                  onClick={() => document.getElementById("thumbInput").click()}
                >
                  {form.thumbnail ? "Change Image" : "Select Image"}
                </button>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Upload a 1280×720px image representing the lesson's key takeaway.
                </p>
              </div>

              {/* ── Visibility Status ─────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-3">
                  Lesson Visibility
                </label>

                {/* Free Preview */}
                <button
                  onClick={() => set("visibility", "free")}
                  className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all mb-2"
                  style={
                    form.visibility === "free"
                      ? { borderColor: "#10B981", background: "#F0FDF4" }
                      : { borderColor: "#E5E7EB", background: "white" }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: form.visibility === "free" ? "#D1FAE5" : "#F3F4F6" }}
                  >
                    <Eye className="w-4 h-4" style={{ color: form.visibility === "free" ? "#059669" : "#9CA3AF" }} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${form.visibility === "free" ? "text-emerald-700" : "text-gray-600"}`}>
                      Free Preview
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      Anyone can watch this lesson, even without enrolling.
                    </p>
                  </div>
                </button>

                {/* Enrolled Only */}
                <button
                  onClick={() => set("visibility", "enrolled")}
                  className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                  style={
                    form.visibility === "enrolled"
                      ? { borderColor: "#7C3AED", background: "#F5F3FF" }
                      : { borderColor: "#E5E7EB", background: "white" }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: form.visibility === "enrolled" ? "#EDE9FE" : "#F3F4F6" }}
                  >
                    <Lock className="w-4 h-4" style={{ color: form.visibility === "enrolled" ? "#7C3AED" : "#9CA3AF" }} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${form.visibility === "enrolled" ? "text-violet-700" : "text-gray-600"}`}>
                      Enrolled Only
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      Only students who paid and enrolled can watch this lesson.
                    </p>
                  </div>
                </button>
              </div>

              {/* Setup Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500">Setup Progress</label>
                  <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: "#7C3AED" }}
                  />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {[
                    { label: "Course selected",  done: !!form.course },
                    { label: "Section selected",  done: !!form.section },
                    { label: "Lesson title",       done: !!form.title.trim() },
                    { label: "Video added",
                      done: form.videoTab === "direct"
                        ? !!(videoFile || form.existingVideoUrl)
                        : !!form.videoUrl.trim()
                    },
                    { label: "Thumbnail added",   done: !!form.thumbnail },
                  ].map(item => (
                    <li key={item.label} className="flex items-center gap-2 text-xs text-gray-500">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          item.done ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      >
                        {item.done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className={item.done ? "text-gray-700 font-medium" : ""}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddNewLessonPage;