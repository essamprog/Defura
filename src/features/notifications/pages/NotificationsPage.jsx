import { useState, useEffect, useCallback } from "react";
import {
  Bell, CheckCheck, BookOpen, Award, Tag, Info,
  Trash2, Clock, CheckCircle, XCircle, Eye,
} from "lucide-react";
import { Button, Badge, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { formatRelativeTime } from "@/utils";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { useAuthStore } from "@/store";

const TYPE_META = {
  course:         { icon: BookOpen, bg: "bg-blue-50",   color: "text-blue-500",   label: "Course",         variant: "primary" },
  cert:           { icon: Award,    bg: "bg-emerald-50", color: "text-emerald-500", label: "Certificate",    variant: "success" },
  promo:          { icon: Tag,      bg: "bg-amber-50",   color: "text-amber-500",   label: "Promo",          variant: "warning" },
  system:         { icon: Info,     bg: "bg-gray-100",   color: "text-gray-500",    label: "System",         variant: "default" },
  course_pending: { icon: Clock,    bg: "bg-orange-50",  color: "text-orange-500",  label: "Pending Review", variant: "warning" },
};

const FILTERS = ["All", "Unread", "Courses", "Pending Review", "Certificates", "Promos"];

// Avatar with initials fallback
const InstructorAvatar = ({ name, avatar }) => {
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return avatar ? (
    <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of notification being actioned
  const [activeFilter, setFilter] = useState("All");
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(ENDPOINTS.NOTIFICATIONS?.LIST ?? "/notifications/index.php");
      setNotifications(res.data?.notifications ?? res.data ?? []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    try { await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), { id }); } catch {}
  };

  const markAllRead = async () => {
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    try { await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { all: true }); } catch {}
  };

  const deleteNote = (id) =>
    setNotifications(p => p.filter(n => n._id !== id));

  // Approve or Reject a course from notification
  const handleCourseAction = async (notifId, courseId, action) => {
    setActionLoading(notifId);
    try {
      await api.patch(`${ENDPOINTS.ADMIN.COURSES}?id=${courseId}`, { action });
      setNotifications(p => p.map(n =>
        n._id === notifId
          ? { ...n, isRead: true, resolved: true, resolvedAction: action }
          : n
      ));
      // Re-fetch after a short delay so any new instructor notifications are reflected
      setTimeout(() => load(), 500);
    } catch (err) {
      console.error(`Failed to ${action} course:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === "All")            return true;
    if (activeFilter === "Unread")         return !n.isRead;
    if (activeFilter === "Courses")        return n.type === "course";
    if (activeFilter === "Pending Review") return n.type === "course_pending";
    if (activeFilter === "Certificates")   return n.type === "cert";
    if (activeFilter === "Promos")         return n.type === "promo";
    return true;
  });

  const unreadCount  = notifications.filter(n => !n.isRead).length;
  const pendingCount = notifications.filter(n => n.type === "course_pending" && !n.resolved).length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            {pendingCount > 0 && isAdmin && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full animate-pulse">
                {pendingCount} pending review
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
              activeFilter === f
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
            ].join(" ")}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/30 text-current rounded-full px-1.5">{unreadCount}</span>
            )}
            {f === "Pending Review" && pendingCount > 0 && isAdmin && (
              <span className="ml-1.5 bg-orange-500 text-white rounded-full px-1.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications here"
            description="When something happens, we'll let you know right here."
          />
        ) : filtered.map(n => {
          const meta = TYPE_META[n.type] ?? TYPE_META.system;
          const Icon = meta.icon;
          const isPending = n.type === "course_pending";
          const isResolved = n.resolved;
          // Extract courseId from notification fields or link patterns:
          // link formats: "/admin/courses?preview=1"  or  "/courses/1"  or  "/instructor/courses/1"
          const courseId =
            n.relatedCourseId ??
            n.related_course_id ??
            (n.link?.match(/[?&]preview=(\d+)/)?.[1]) ??
            (n.link?.match(/\/courses\/(\d+)/)?.[1]) ??
            (n.body?.match(/course #(\d+)/i)?.[1]);

          return (
            <div
              key={n._id}
              onClick={() => {
                if (n.link) {
                  markRead(n._id);
                  navigate(n.link);
                }
              }}
              className={[
                "flex gap-4 p-4 group transition-colors",
                n.link ? "cursor-pointer hover:bg-gray-50/85" : "",
                !n.isRead && !isPending ? "bg-blue-50/30" : "",
                isPending && !isResolved ? "bg-orange-50/40" : "",
                isPending && isResolved ? "opacity-60" : "",
              ].join(" ")}
            >
              {/* Left: instructor avatar for course_pending, icon otherwise */}
              <div className="shrink-0 mt-0.5">
                {isPending && n.instructorAvatar !== undefined ? (
                  <InstructorAvatar name={n.instructorName} avatar={n.instructorAvatar} />
                ) : (
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isResolved && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        n.resolvedAction === "approve"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {n.resolvedAction === "approve" ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    )}
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-1.5">{n.body}</p>
                <p className="text-[11px] text-gray-400 mb-2">{formatRelativeTime(n.createdAt)}</p>

                {/* Action buttons for course_pending — admin only */}
                {isPending && isAdmin && !isResolved && courseId && (
                  <div className="flex items-center gap-2 mt-2">
                    {/* Preview — opens admin-only preview page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/courses/preview/${courseId}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    {/* Approve */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseAction(n._id, courseId, "approve");
                      }}
                      disabled={actionLoading === n._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === n._id ? (
                        <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>

                    {/* Reject */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseAction(n._id, courseId, "reject");
                      }}
                      disabled={actionLoading === n._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Right actions */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(n._id);
                    }}
                    title="Mark as read"
                    className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;