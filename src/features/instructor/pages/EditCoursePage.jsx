import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, AlertCircle } from "lucide-react";
import { Button, Input, Spinner } from "@/components/ui";
import { ROUTES } from "@/constants";
import instructorService from "@/features/instructor/services/instructorService";

const EditCoursePage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [data,    setData]    = useState({ title:"", description:"", price:"", originalPrice:"" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await instructorService.getCourseDetail(id);
        const course = res.data?.course;
        if (course) {
          setData({
            title: course.title || "",
            description: course.description || "",
            price: course.price !== null ? String(course.price) : "",
            originalPrice: course.originalPrice !== null ? String(course.originalPrice) : "",
          });
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ??
            "Failed to load course details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!data.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await instructorService.updateCourse(id, {
        title: data.title.trim(),
        description: data.description,
        price: data.price === "" ? 0 : parseFloat(data.price),
        originalPrice: data.originalPrice === "" ? null : parseFloat(data.originalPrice),
      });
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Failed to save course changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  if (error && !data.title) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Error Loading Course</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <Button onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-sm text-gray-500">Changes are saved as draft until you republish.</p>
        </div>
        <Button size="sm" isLoading={saving} loadingText="Saving..." leftIcon={!saving && <Save className="w-4 h-4" />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-xs">
        <Input label="Course Title" value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))} required />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
          <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans" value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (USD)" type="number" value={data.price} onChange={e => setData(p => ({ ...p, price: e.target.value }))} />
          <Input label="Original Price (USD)" type="number" value={data.originalPrice} onChange={e => setData(p => ({ ...p, originalPrice: e.target.value }))} />
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;