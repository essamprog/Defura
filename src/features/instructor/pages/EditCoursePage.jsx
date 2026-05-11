import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { Button, Input, Spinner } from "@/components/ui";
import { ROUTES } from "@/constants";

const EditCoursePage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [data,    setData]    = useState({ title:"", description:"", price:"", originalPrice:"" });

  useEffect(() => {
    const load = async () => {
      await new Promise(r => setTimeout(r, 500));
      // Simulate fetching existing course
      setData({ title:"Full-Stack Development with React & Node.js", description:"Build production-ready web apps from front to back.", price:"79", originalPrice:"179" });
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    navigate(ROUTES.INSTRUCTOR_COURSES);
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <Input label="Course Title" value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))} required />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
          <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))} />
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