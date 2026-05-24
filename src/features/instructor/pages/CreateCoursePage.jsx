import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, DollarSign, Upload, CheckCircle, ChevronRight, Plus, Trash2, Video } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/constants";
import instructorService from "../services/instructorService";
import api from "@/services/api"; // Added for direct FormData upload if needed, but we can use instructorService

const STEPS = [
  { id: 1, label: "Basic Info",  icon: FileText    },
  { id: 2, label: "Curriculum",  icon: BookOpen    },
  { id: 3, label: "Media",       icon: Upload      },
  { id: 4, label: "Pricing",     icon: DollarSign  },
  { id: 5, label: "Publish",     icon: CheckCircle },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
// Categories are loaded from the database — see useEffect in CreateCoursePage

// ─── Step Components ──────────────────────────────────────────────────────────
const BasicInfoStep = ({ data, onChange, errors, categories, categoriesLoading }) => (
  <div className="space-y-5">
    <h2 className="text-base font-bold text-gray-900">Course Details</h2>
    <Input label="Course Title" placeholder="e.g. Complete AWS Solutions Architect Guide" value={data.title} onChange={e => onChange("title", e.target.value)} required hint="Be specific and clear. A good title can double enrollments." error={errors.title} />
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Short Description <span className="text-red-500">*</span></label>
      <textarea rows={3} className={`w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`} placeholder="Briefly describe what students will learn..." value={data.description} onChange={e => onChange("description", e.target.value)} />
      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Category <span className="text-red-500">*</span></label>
        <select className={`w-full h-10 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`} value={data.category_id} onChange={e => onChange("category_id", e.target.value)}>
          <option value="">{categoriesLoading ? "Loading categories..." : "Select category"}</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Level <span className="text-red-500">*</span></label>
        <select className={`w-full h-10 rounded-lg border ${errors.level ? 'border-red-500' : 'border-gray-300'} px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`} value={data.level} onChange={e => onChange("level", e.target.value)}>
          <option value="">Select level</option>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
      </div>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">What students will learn (Outcomes) <span className="text-red-500">*</span></label>
      <textarea rows={4} className={`w-full rounded-lg border ${errors.outcomes ? 'border-red-500' : 'border-gray-300'} px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`} placeholder="List key learning outcomes, one per line..." value={data.outcomes} onChange={e => onChange("outcomes", e.target.value)} />
      {errors.outcomes && <p className="text-red-500 text-xs mt-1">{errors.outcomes}</p>}
    </div>
  </div>
);

const CurriculumStep = ({ data, onChange, errors }) => {
  const addSection = () => {
    const newSections = [...data.sections, { title: "", lessons: [] }];
    onChange("sections", newSections);
  };

  const updateSectionTitle = (index, val) => {
    const newSections = [...data.sections];
    newSections[index].title = val;
    onChange("sections", newSections);
  };

  const removeSection = (index) => {
    const newSections = [...data.sections];
    newSections.splice(index, 1);
    onChange("sections", newSections);
  };

  const addLesson = (sectionIndex) => {
    const newSections = [...data.sections];
    newSections[sectionIndex].lessons.push({ title: "", videoFile: null, duration: "", isFreePreview: false });
    onChange("sections", newSections);
  };

  const updateLessonField = (sIndex, lIndex, field, val) => {
    const newSections = [...data.sections];
    newSections[sIndex].lessons[lIndex][field] = val;
    onChange("sections", newSections);
  };

  const removeLesson = (sIndex, lIndex) => {
    const newSections = [...data.sections];
    newSections[sIndex].lessons.splice(lIndex, 1);
    onChange("sections", newSections);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-900">Course Curriculum</h2>
      <p className="text-sm text-gray-500">Structure your course into sections and lessons. Add video files, duration, and mark free previews.</p>
      
      {errors.sections && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{errors.sections}</div>}

      <div className="space-y-6">
        {data.sections.map((section, sIndex) => (
          <div key={sIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
            <button onClick={() => removeSection(sIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="mb-4 pr-8">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Section {sIndex + 1}</label>
              <input
                type="text"
                placeholder="e.g. Introduction to the Course"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={section.title}
                onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
              />
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-2">
              {section.lessons.map((lesson, lIndex) => (
                <div key={lIndex} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-4 relative shadow-sm">
                  <button onClick={() => removeLesson(sIndex, lIndex)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                     <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Lesson {lIndex + 1} Title</label>
                    <input
                      type="text"
                      placeholder="e.g. What is Cloud Computing?"
                      className="w-full border-b border-gray-200 pb-1 text-sm focus:border-blue-500 focus:outline-none"
                      value={lesson.title}
                      onChange={(e) => updateLessonField(sIndex, lIndex, "title", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Lesson Video</label>
                      <label className="flex items-center justify-center w-full px-3 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-xs">
                        <Video className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 truncate">{lesson.videoFile ? lesson.videoFile.name : "Upload Video File"}</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => updateLessonField(sIndex, lIndex, "videoFile", e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 15"
                        className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        value={lesson.duration}
                        onChange={(e) => updateLessonField(sIndex, lIndex, "duration", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id={`free-${sIndex}-${lIndex}`}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={lesson.isFreePreview}
                      onChange={(e) => updateLessonField(sIndex, lIndex, "isFreePreview", e.target.checked)}
                    />
                    <label htmlFor={`free-${sIndex}-${lIndex}`} className="text-sm text-gray-700 cursor-pointer">
                      Make this lesson a Free Preview
                    </label>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addLesson(sIndex)} className="text-blue-600 hover:text-blue-700 text-xs h-8 mt-2">
                <Plus className="w-3 h-3 mr-1" /> Add Lesson
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-300" onClick={addSection}>
          <Plus className="w-5 h-5 mr-2" /> Add Section
        </Button>
      </div>
    </div>
  );
};

const MediaStep = ({ data, onChange, errors }) => (
  <div className="space-y-5">
    <h2 className="text-base font-bold text-gray-900">Course Media</h2>
    
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">Course Thumbnail <span className="text-red-500">*</span></label>
      <div className={`border-2 border-dashed ${errors.thumbnail ? 'border-red-400' : 'border-gray-200'} rounded-xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer`}>
        {data.thumbnail ? (
          <img src={URL.createObjectURL(data.thumbnail)} alt="" className="w-full h-40 object-cover rounded-lg" />
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">Upload thumbnail</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 2MB · Recommended: 1280×720px</p>
            <input type="file" accept="image/*" className="hidden" id="thumb" onChange={e => onChange("thumbnail", e.target.files[0])} />
            <label htmlFor="thumb" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">Choose File</label>
          </>
        )}
      </div>
      {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>}
      {data.thumbnail && (
        <div className="mt-2 text-right">
            <label htmlFor="thumb_change" className="text-xs text-blue-600 cursor-pointer hover:underline">Change Thumbnail</label>
            <input type="file" accept="image/*" className="hidden" id="thumb_change" onChange={e => onChange("thumbnail", e.target.files[0])} />
        </div>
      )}
    </div>
  </div>
);

const PricingStep = ({ data, onChange, errors }) => (
  <div className="space-y-5">
    <h2 className="text-base font-bold text-gray-900">Pricing</h2>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Price (USD)" type="number" min="0" placeholder="79" value={data.price} onChange={e => onChange("price", e.target.value)} required hint="Set to 0 for a free course." error={errors.price} />
      <Input label="Original Price (USD)" type="number" min="0" placeholder="199" value={data.originalPrice} onChange={e => onChange("originalPrice", e.target.value)} hint="Shown as strikethrough to indicate discount." />
    </div>
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <p className="text-xs text-blue-700 font-semibold mb-1">💡 Pricing Tips</p>
      <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
        <li>Courses priced $60–$100 tend to sell best on this platform.</li>
        <li>Setting a higher original price increases perceived value.</li>
        <li>Free courses grow your student base faster.</li>
      </ul>
    </div>
  </div>
);

const PublishStep = ({ data, categories }) => {
  const categoryName = categories.find(c => String(c._id) === String(data.category_id))?.name || "—";
  return (
  <div className="space-y-5 text-center">
    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-green-500" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to publish!</h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">Your course <strong>"{data.title || "Untitled"}"</strong> is ready for review. Large videos may take time to upload.</p>
    </div>
    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
      {[
        { label: "Title",    value: data.title || "—" },
        { label: "Category", value: categoryName },
        { label: "Level",    value: data.level  || "—" },
        { label: "Price",    value: data.price ? `$${data.price}` : "Free" },
        { label: "Sections", value: `${data.sections.length} Sections` },
      ].map(item => (
        <div key={item.label} className="flex justify-between text-sm">
          <span className="text-gray-400 font-medium">{item.label}</span>
          <span className="text-gray-700 font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors,  setErrors]  = useState({});

  // ── Real categories from DB ────────────────────────────────────────────────
  const [categories,        setCategories]        = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    instructorService.getCategories()
      .then(({ data: res }) => {
        if (!cancelled) setCategories(res.data?.categories ?? []);
      })
      .catch(err => console.error('Failed to load categories:', err))
      .finally(() => { if (!cancelled) setCategoriesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const [data, setData] = useState({
    title:"", description:"", category_id:"", level:"", outcomes:"",
    thumbnail:null, price:"", originalPrice:"",
    sections: [],
  });

  const updateField = (key, val) => {
    setData(p => ({ ...p, [key]: val }));
    // Clear error for field on change
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!data.title.trim())       newErrors.title       = "Course title is required.";
      if (!data.description.trim()) newErrors.description = "Short description is required.";
      if (!data.category_id)        newErrors.category    = "Category is required.";
      if (!data.level)              newErrors.level       = "Level is required.";
      if (!data.outcomes.trim())    newErrors.outcomes    = "Learning outcomes are required.";
    }

    if (currentStep === 2) {
      if (data.sections.length === 0) {
        newErrors.sections = "You must add at least one section.";
      } else {
        for (let i = 0; i < data.sections.length; i++) {
          const s = data.sections[i];
          if (!s.title.trim()) {
            newErrors.sections = `Section ${i + 1} must have a title.`;
            break;
          }
          if (s.lessons.length === 0) {
            newErrors.sections = `Section ${i + 1} must have at least one lesson.`;
            break;
          }
          for (let j = 0; j < s.lessons.length; j++) {
            const l = s.lessons[j];
            if (!l.title.trim()) {
              newErrors.sections = `Lesson ${j + 1} in Section ${i + 1} must have a title.`;
              break;
            }
            if (!l.videoFile) {
              newErrors.sections = `Lesson ${j + 1} in Section ${i + 1} must have a video file.`;
              break;
            }
          }
          if (newErrors.sections) break; // Stop checking if we already found an error
        }
      }
    }

    if (currentStep === 3) {
      if (!data.thumbnail) newErrors.thumbnail = "Course thumbnail is required.";
    }

    if (currentStep === 4) {
      if (data.price === "") newErrors.price = "Price is required. (Enter 0 for free)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      // Use the real DB category_id selected by the instructor
      formData.append("category_id", data.category_id);
      formData.append("level", data.level.toLowerCase());
      formData.append("price", Number(data.price));
      if (data.originalPrice) formData.append("original_price", Number(data.originalPrice));
      formData.append("subtitle", data.outcomes);

      // Append files
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

      // Append structured curriculum data
      const sectionsPayload = data.sections.map(s => ({
        title: s.title,
        lessons: s.lessons.map(l => ({
          title: l.title,
          duration_minutes: l.duration ? Number(l.duration) : 0,
          is_free_preview: l.isFreePreview ? 1 : 0
        }))
      }));
      formData.append("sections_data", JSON.stringify(sectionsPayload));

      // Append lesson video files directly mapped by indices
      data.sections.forEach((section, sIndex) => {
        section.lessons.forEach((lesson, lIndex) => {
          if (lesson.videoFile) {
            formData.append(`lesson_video_${sIndex}_${lIndex}`, lesson.videoFile);
          }
        });
      });

      // Submit — no timeout for large video uploads, track progress via onUploadProgress
      await api.post('/instructor/create_course.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0, // disable timeout for video uploads
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(pct);
          }
        },
      });

      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      console.error("Failed to create course:", err);
      const msg = err.response?.data?.message
        ?? (err.code === 'ECONNABORTED' ? 'Upload timed out. Please try with smaller files or check your connection.' : null)
        ?? "Failed to upload course. Check file sizes and server settings.";
      alert(msg);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const stepContent = () => {
    switch (step) {
      case 1: return <BasicInfoStep  data={data} onChange={updateField} errors={errors} categories={categories} categoriesLoading={categoriesLoading} />;
      case 2: return <CurriculumStep data={data} onChange={updateField} errors={errors} />;
      case 3: return <MediaStep      data={data} onChange={updateField} errors={errors} />;
      case 4: return <PricingStep    data={data} onChange={updateField} errors={errors} />;
      case 5: return <PublishStep    data={data} categories={categories} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-sm text-gray-500">Complete all steps to publish your course.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={["w-9 h-9 rounded-xl flex items-center justify-center transition-all", done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"].join(" ")}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={["text-[10px] mt-1 font-medium", active ? "text-blue-600" : "text-gray-400"].join(" ")}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={["flex-1 h-px mx-2 mb-5 transition-colors", step > s.id ? "bg-blue-400" : "bg-gray-200"].join(" ")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-[360px]">
        {stepContent()}
      </div>

      {/* Upload progress overlay — shown while saving */}
      {saving && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center space-y-5">
            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"
                style={{ animationDuration: uploadProgress >= 100 ? '0.3s' : '1s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {uploadProgress >= 100
                  ? <CheckCircle className="w-8 h-8 text-emerald-500" />
                  : <Upload className="w-7 h-7 text-blue-500" />
                }
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {uploadProgress >= 100 ? 'Processing on server...' : 'Uploading your course'}
              </h3>
              <p className="text-sm text-gray-500">
                {uploadProgress >= 100
                  ? 'Almost done! The server is saving your content.'
                  : 'Please keep this tab open while videos are uploading.'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">Upload progress</span>
                <span className="text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${uploadProgress}%`,
                    background: uploadProgress >= 100
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              🔒 Secure upload — do not close or refresh this page
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : navigate(ROUTES.INSTRUCTOR_COURSES)} disabled={saving}>
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 5 ? (
          <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button isLoading={saving} loadingText="Uploading..." onClick={handleSubmit}>
            Submit for Review
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateCoursePage;