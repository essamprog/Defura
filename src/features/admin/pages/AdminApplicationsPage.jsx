import { useState, useEffect } from "react";
import { Search, UserCheck, UserX, ExternalLink, Calendar, Mail, Award, Check, X, Filter } from "lucide-react";
import { Badge, Button, Spinner, Table } from "@/components/ui";
import { ConfirmDialog } from "@/components/common";
import api from "@/services/api";

const AdminApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all"); // all, pending, approved, rejected
  const [confirm, setConfirm] = useState(null); // { type: 'approve'|'reject', id: number }
  const [toast, setToast] = useState(null); // { message, type }

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status !== "all") params.status = status;
      if (search.trim() !== "") params.search = search.trim();

      const { data: res } = await api.get("/admin/applications.php", { params });
      if (res.success) {
        setApps(res.data ?? []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      showToast("Failed to load applications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status, search]);

  const handleAction = async () => {
    if (!confirm) return;
    const { type, id } = confirm;
    setConfirm(null);
    setSubmitting(true);

    try {
      const { data: res } = await api.patch(`/admin/applications.php?id=${id}`, {
        action: type
      });

      if (res.success) {
        showToast(`Application ${type}d successfully.`, "success");
        // Reload list
        fetchApplications();
      } else {
        showToast(res.message ?? "Action failed.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? "An error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div 
          className={[
            "fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border transition-all animate-bounce",
            toast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600" 
              : "bg-rose-500/10 border-rose-500/35 text-rose-600"
          ].join(" ")}
        >
          {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instructor Applications</h1>
          <p className="text-xs text-gray-500 mt-1">Review credentials and approve student upgrades to verified educators.</p>
        </div>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
          {apps.length} applications found
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name or email..."
            className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={[
                "h-10 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border",
                status === s
                  ? "bg-red-50 text-red-700 border-red-200 font-bold shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-32">
          <Spinner size="lg" className="text-red-600" />
        </div>
      ) : apps.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-gray-200 rounded-3xl bg-white shadow-sm">
          <Award className="w-12 h-12 text-gray-350 mx-auto mb-4" />
          <h3 className="font-bold text-gray-800 text-base">No Applications Found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            There are no instructor onboarding applications matching the current filter parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {apps.map((app) => (
            <div 
              key={app._id} 
              className={[
                "p-6 rounded-3xl bg-white border shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
                app.status === 'pending' ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100 hover:border-gray-200'
              ].join(" ")}
            >
              {/* User Bio */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-sm shrink-0 overflow-hidden border border-red-200">
                  {app.avatar ? (
                    <img src={app.avatar} alt={app.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{app.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-base">{app.fullName}</h3>
                    <Badge 
                      variant={
                        app.status === "approved" 
                          ? "success" 
                          : app.status === "rejected" 
                          ? "danger" 
                          : "warning"
                      }
                      size="sm" 
                      className="capitalize"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> {app.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 
                      Taught: <span className="font-semibold text-gray-700">{app.expertise}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Experience: <span className="font-semibold text-gray-700">{app.experience}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action and links */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                {app.resume_url && (
                  <a 
                    href={app.resume_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer shadow-sm border border-blue-100"
                  >
                    View Resume/CV
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {app.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirm({ type: "reject", id: app._id })}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 inline-flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "approve", id: app._id })}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all inline-flex items-center gap-1.5 shadow-md hover:shadow-emerald-600/10"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={confirm?.type === "approve" ? "Approve Instructor Application?" : "Reject Instructor Application?"}
        message={
          confirm?.type === "approve" 
            ? "This will elevate the student to Instructor rank, granting full rights to create and manage courses. Their wallet balance sheet will be initialized."
            : "This will reject the request. The student will be notified and can view re-apply instructions from their application panel."
        }
        confirmText={confirm?.type === "approve" ? "Approve Upgrade" : "Reject Application"}
        variant={confirm?.type === "approve" ? "success" : "danger"}
      />

    </div>
  );
};

export default AdminApplicationsPage;
