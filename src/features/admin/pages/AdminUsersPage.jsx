import { useState, useEffect } from "react";
import { Search, UserX, UserCheck, Trash2, ChevronDown } from "lucide-react";
import { Badge, Button, Pagination, Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/common";
import useAdmin from "../hooks/useAdmin";

const ROLES   = ["All Roles", "student", "instructor", "admin"];
const STATUSES = ["All Status", "active", "banned"];

const AdminUsersPage = () => {
  const { users, fetchUsers, banUser, unbanUser, deleteUser, isLoading } = useAdmin();
  const [search,   setSearch]   = useState("");
  const [role,     setRole]     = useState("All Roles");
  const [status,   setStatus]   = useState("All Status");
  const [confirm,  setConfirm]  = useState(null); // { type, id }
  const [page,     setPage]     = useState(1);
  const PER = 10;

  // Fetch full users list on mount
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => {
    const name   = (u.full_name ?? "").toLowerCase();
    const email  = (u.email    ?? "").toLowerCase();
    const q      = search.toLowerCase();
    const matchSearch = name.includes(q) || email.includes(q);
    const matchRole   = role   === "All Roles"   || u.role   === role;
    const matchStatus = status === "All Status"  || u.status === status;
    return matchSearch && matchRole && matchStatus;
  });

  const paginated  = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);

  const handleConfirm = () => {
    if (confirm.type === "ban")    banUser(confirm.id);
    if (confirm.type === "unban")  unbanUser(confirm.id);
    if (confirm.type === "delete") deleteUser(confirm.id);
    setConfirm(null);
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <span className="text-sm text-gray-500">{filtered.length} users found</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {[{ val:role, set:setRole, opts:ROLES }, { val:status, set:setStatus, opts:STATUSES }].map(({ val, set, opts }, i) => (
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
            <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Joined</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 overflow-hidden">
                        {u.avatar
                          ? <img src={u.avatar} alt={u.full_name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          : null}
                        <span style={{display: u.avatar ? 'none' : 'flex'}} className="w-full h-full items-center justify-center">
                          {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.full_name ?? u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={u.role === "admin" ? "danger" : u.role === "instructor" ? "purple" : "default"} size="sm" className="capitalize">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={u.status === "active" ? "success" : "danger"} size="sm" dot className="capitalize">{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{u.joined}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {u.status === "active"
                        ? <button onClick={() => setConfirm({ type:"ban", id:u._id })} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Ban"><UserX className="w-3.5 h-3.5" /></button>
                        : <button onClick={() => setConfirm({ type:"unban", id:u._id })} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Unban"><UserCheck className="w-3.5 h-3.5" /></button>}
                      {u.role !== "admin" && (
                        <button onClick={() => setConfirm({ type:"delete", id:u._id })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
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
        title={confirm?.type === "delete" ? "Delete user?" : confirm?.type === "ban" ? "Ban this user?" : "Unban this user?"}
        message={confirm?.type === "delete" ? "This will permanently remove the user and all their data." : confirm?.type === "ban" ? "The user will lose access to the platform immediately." : "The user will regain access to the platform."}
        confirmText={confirm?.type === "delete" ? "Delete" : confirm?.type === "ban" ? "Ban User" : "Unban User"}
        variant={confirm?.type === "unban" ? "info" : "danger"}
      />
    </div>
  );
};

export default AdminUsersPage;