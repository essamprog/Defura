import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Video, Paperclip,
  ChevronDown, CloudUpload, Info, X, ImageIcon,
} from "lucide-react";
import { ROUTES } from "@/constants";
import instructorService from "../services/instructorService";


const fieldCls =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all";

const AddNewLessonPage = () => {
  const navigate = useNavigate();

  const [courseList, setCourseList] = useState([]);
  const [sectionList, setSectionList] = useState([]);

  // Fetch instructor's courses on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await instructorService.getCourses();
        const courses = res.data?.courses ?? res.data ?? [];
        setCourseList(courses);
        // Auto-select first course
        if (courses.length > 0) {
          set("course", courses[0]._id ?? courses[0].title);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };
    load();
  }, []);

  const [form, setForm] = useState({
    course:     "",
    section:    "",
    title:      "",
    order:      "1",
    duration:   "15",
    videoTab:   "direct",
    visibility: "public",
    thumbnail:  null,
  });

  const [dragOver,     setDragOver]     = useState(false);
  const [videoFile,    setVideoFile]    = useState(null);
  const [attachments,  setAttachments]  = useState([]);
  const [saving,       setSaving]       = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleVideoFile = file => {
    if (file && file.type.startsWith("video/")) setVideoFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1400));
    setSaving(false);
    navigate(ROUTES.INSTRUCTOR_COURSES);
  };

  const progress = (() => {
    let n = 0;
    if (form.course)    n++;
    if (form.section)   n++;
    if (form.title)     n++;
    if (videoFile)      n++;
    if (form.thumbnail) n++;
    return Math.round((n / 5) * 100);
  })();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F4F3FF", fontFamily: "'DM Sans','Inter',sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page title + CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Add New Lesson</h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Create an engaging learning experience by adding high-quality
              video content and structured metadata to your course.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
              className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-6 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
              style={{ background: "#6D28D9" }}
            >
              {saving ? "Saving…" : "Save and Publish Lesson"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Lesson Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <FileText className="w-4 h-4" style={{ color: "#7C3AED" }} />
                </div>
                <h2 className="text-base font-bold text-gray-900">Lesson Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Course */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Select Course</label>
                  <div className="relative">
                    <select
                      value={form.course}
                      onChange={e => set("course", e.target.value)}
                      className={fieldCls + " appearance-none pr-9 cursor-pointer"}
                    >
                      {courseList.length === 0 && <option>No courses available</option>}
                      {courseList.map(c => <option key={c._id ?? c.title} value={c._id ?? c.title}>{c.title}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Select Section</label>
                  <div className="relative">
                    <select
                      value={form.section}
                      onChange={e => set("section", e.target.value)}
                      className={fieldCls + " appearance-none pr-9 cursor-pointer"}
                    >
                      {sectionList.length === 0 && <option>No sections</option>}
                      {sectionList.map((s, i) => <option key={s._id ?? i} value={s._id ?? s.title}>{s.title ?? s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Understanding Layer Blurring"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  className={fieldCls}
                />
              </div>

              {/* Order + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson Order</label>
                  <input
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={e => set("order", e.target.value)}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Estimated Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={form.duration}
                    onChange={e => set("duration", e.target.value)}
                    className={fieldCls}
                  />
                </div>
              </div>
            </div>

            {/* Video Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                    <Video className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Video Content</h2>
                </div>
                <div className="flex gap-2">
                  {[
                    { key: "direct",   label: "Direct Upload" },
                    { key: "external", label: "External Link" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => set("videoTab", tab.key)}
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
                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleVideoFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById("videoInput").click()}
                    className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
                    style={{
                      borderColor: dragOver ? "#7C3AED" : "#E5E7EB",
                      background:  dragOver ? "#F5F3FF" : "#FAFAFA",
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "#EDE9FE" }}
                    >
                      <CloudUpload className="w-7 h-7" style={{ color: "#7C3AED" }} />
                    </div>

                    {videoFile ? (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">✅ {videoFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800 mb-1">Drag and drop video files</p>
                        <p className="text-sm text-gray-400">Recommended: MP4, 1080p, Max size 2GB</p>
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
                      accept="video/*"
                      className="hidden"
                      onChange={e => handleVideoFile(e.target.files[0])}
                    />
                  </div>

                  {/* Info banner */}
                  <div
                    className="flex items-start gap-3 mt-4 px-4 py-3 rounded-xl"
                    style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}
                  >
                    <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#6366F1" }} />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Videos are automatically optimized for multi-device playback after upload.
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className={fieldCls}
                  />
                  <p className="text-xs text-gray-400 mt-2">Supports YouTube, Vimeo, and direct MP4 links.</p>
                </div>
              )}
            </div>

            {/* Lesson Attachments */}
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
                  <p className="text-xs text-gray-400">Support for PDF, Slides (PPTX), or Zip files (Max 50MB)</p>
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
                  onChange={e =>
                    setAttachments(prev => [...prev, ...Array.from(e.target.files)])
                  }
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
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-6">

              {/* Thumbnail header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                  <ImageIcon className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Lesson Thumbnail</h3>
              </div>

              {/* Preview */}
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
                Select img
              </button>

              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Upload a high-resolution image (1280×720px) that represents the lesson's key takeaway.
              </p>

              {/* Visibility */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 mb-3">
                  Visibility Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["public", "draft"].map(v => (
                    <button
                      key={v}
                      onClick={() => set("visibility", v)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all"
                      style={
                        form.visibility === v
                          ? { borderColor: "#7C3AED", background: "#F5F3FF", color: "#6D28D9" }
                          : { borderColor: "#E5E7EB", background: "white",   color: "#9CA3AF" }
                      }
                    >
                      {v === "public" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setup Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500">Setup Progress</label>
                  <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: "#7C3AED" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewLessonPage;