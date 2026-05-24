import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Trash2, ChevronDown, BookOpen } from "lucide-react";
import { Badge, Pagination, Spinner } from "@/components/ui";
import { ConfirmDialog, EmptyState } from "@/components/common";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import adminService from "../services/adminService";

const STATUS_VARIANT = { published:"success", pending:"warning", draft:"default", archived:"default" };
const CATEGORIES = ["All", "Cloud", "Development", "AI & ML", "DevOps", "Security", "Data"];
const STATUSES   = ["All Status", "pending", "published", "draft", "archived"];

const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await adminService.getCourses({ per_page: 100 });
        // Response::paginated returns data directly as array (not nested in .courses)
        setCourses(Array.isArray(res.data) ? res.data : (res.data?.courses ?? []));
      } catch (err) {
        console.error("Failed to load courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [status,  setStatus]  = useState("All Status");
  const [confirm, setConfirm] = useState(null);
  const [page,    setPage]    = useState(1);
  const PER = 5;

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)) &&
      (cat    === "All"        || c.category === cat) &&
      (status === "All Status" || c.status   === status)
    );
  });

  const paginated  = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);

  const pendingCount = courses.filter(c => c.status === 'pending').length;

  const approve = async (id) => {
    try {
      await adminService.approveCourse(id);
      setCourses(p => p.map(c => c._id === id ? { ...c, status: 'published' } : c));
    } catch (err) { console.error(err); }
  };

  const reject = async (id) => {
    try {
      await adminService.rejectCourse(id);
      setCourses(p => p.map(c => c._id === id ? { ...c, status: 'archived' } : c));
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    try {
      await adminService.deleteCourse(id);
      setCourses(p => p.filter(c => c._id !== id));
    } catch (err) { console.error(err); } finally { setConfirm(null); }
  };

  const handleConfirm = async () => {
    if (confirm.type === "delete")  await remove(confirm.id);
    if (confirm.type === "approve") { await approve(confirm.id); setConfirm(null); }
    if (confirm.type === "reject")  { await reject(confirm.id);  setConfirm(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Course Management</h1>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} courses</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search courses or instructors..." className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {[{ val:cat, set:setCat, opts:CATEGORIES }, { val:status, set:setStatus, opts:STATUSES }].map(({ val, set, opts }, i) => (
          <div key={i} className="relative">
            <select value={val} onChange={e => { set(e.target.value); setPage(1); }} className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Students</th>
                <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">by {c.instructor}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{c.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_VARIANT[c.status]} size="sm" dot className="capitalize">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{(c.students ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{(c.revenue ?? 0) > 0 ? `$${(c.revenue ?? 0).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(ROUTES.adminCoursePreview(c._id))} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      {c.status === "pending" && (
                        <>
                          <button onClick={() => setConfirm({ type:"approve", id:c._id })} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirm({ type:"reject",  id:c._id })} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Reject"><XCircle className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      <button onClick={() => setConfirm({ type:"delete", id:c._id })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showInfo totalItems={filtered.length} itemsPerPage={PER} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.type === "delete" ? "Delete course?" : confirm?.type === "approve" ? "Approve course?" : "Reject course?"}
        message={confirm?.type === "delete" ? "This will permanently remove the course and all student progress." : confirm?.type === "approve" ? "The course will go live and be visible to all students." : "The course will be archived and removed from public listings."}
        confirmText={confirm?.type === "delete" ? "Delete" : confirm?.type === "approve" ? "Approve" : "Reject"}
        variant={confirm?.type === "approve" ? "info" : "danger"}
      />
    </div>
  );
};

export default AdminCoursesPage;