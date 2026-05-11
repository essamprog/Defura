import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button, Input, Modal, Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/common";
import adminService from "../services/adminService";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null); // category object or null (new)
  const [deleteId,   setDeleteId]   = useState(null);
  const [formName,   setFormName]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminService.getCategories();
      // data.data.categories matches response structure from backend
      setCategories(data.data.categories ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => { setEditing(null); setFormName(""); setError(null); setModalOpen(true); };
  const openEdit   = (cat) => { setEditing(cat); setFormName(cat.name); setError(null); setModalOpen(true); };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await adminService.updateCategory(editing._id, { name: formName });
      } else {
        await adminService.createCategory({ name: formName });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteCategory(deleteId);
      setCategories(p => p.filter(c => c._id !== deleteId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  // Helper for consistent colors
  const getColor = (index) => {
    const colors = [
      "bg-sky-100 text-sky-700",
      "bg-blue-100 text-blue-700",
      "bg-violet-100 text-violet-700",
      "bg-indigo-100 text-indigo-700",
      "bg-rose-100 text-rose-700",
      "bg-amber-100 text-amber-700",
      "bg-teal-100 text-teal-700",
      "bg-emerald-100 text-emerald-700"
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories available</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          New Category
        </Button>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => (
          <div key={cat._id} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color || getColor(idx)}`}>
                {cat.name}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteId(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{cat.courseCount ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5">courses</p>
            <p className="text-[10px] text-gray-300 mt-2 font-mono">/{cat.slug}</p>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            No categories found. Click "New Category" to create one.
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Create Category"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button isLoading={saving} loadingText="Saving..." onClick={handleSave}>
              {editing ? "Save Changes" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <Input
            label="Category Name"
            placeholder="e.g. Machine Learning"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            required
            autoFocus
          />
          {formName && (
            <p className="text-xs text-gray-400">
              Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">/{formName.toLowerCase().replace(/\s+/g, "-")}</code>
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        message="All courses in this category will become uncategorized. This action cannot be undone."
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
};

export default AdminCategoriesPage;