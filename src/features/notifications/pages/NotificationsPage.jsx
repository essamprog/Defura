import { useState, useEffect } from "react";
import { Bell, CheckCheck, BookOpen, Award, Tag, Info, Trash2 } from "lucide-react";
import { Button, Badge, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { formatRelativeTime } from "@/utils";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const TYPE_META = {
  course:  { icon: BookOpen, bg: "bg-blue-50",   color: "text-blue-500",   label: "Course",  variant: "primary" },
  cert:    { icon: Award,    bg: "bg-emerald-50", color: "text-emerald-500",label: "Certificate", variant: "success" },
  promo:   { icon: Tag,      bg: "bg-amber-50",   color: "text-amber-500",  label: "Promo",   variant: "warning" },
  system:  { icon: Info,     bg: "bg-gray-100",   color: "text-gray-500",   label: "System",  variant: "default" },
};

const FILTERS = ["All", "Unread", "Courses", "Certificates", "Promos"];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.NOTIFICATIONS?.LIST ?? "/notifications");
        setNotifications(res.data?.notifications ?? res.data ?? []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [activeFilter,  setFilter]        = useState("All");

  const markRead = (id) =>
    setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));

  const markAllRead = () =>
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));

  const deleteNote = (id) =>
    setNotifications(p => p.filter(n => n._id !== id));

  const filtered = notifications.filter(n => {
    if (activeFilter === "All")          return true;
    if (activeFilter === "Unread")       return !n.isRead;
    if (activeFilter === "Courses")      return n.type === "course";
    if (activeFilter === "Certificates") return n.type === "cert";
    if (activeFilter === "Promos")       return n.type === "promo";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
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
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications here"
            description="When something happens, we'll let you know right here."
          />
        ) : filtered.map(n => {
          const meta = TYPE_META[n.type] ?? TYPE_META.system;
          const Icon = meta.icon;
          return (
            <div
              key={n._id}
              className={["flex gap-4 p-4 group transition-colors", !n.isRead ? "bg-blue-50/30" : "hover:bg-gray-50"].join(" ")}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-5 h-5 ${meta.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                    {n.title}
                  </p>
                  <Badge variant={meta.variant} size="sm" className="shrink-0">{meta.label}</Badge>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-1.5">{n.body}</p>
                <p className="text-[11px] text-gray-400">{formatRelativeTime(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n._id)}
                    title="Mark as read"
                    className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </button>
                )}
                <button
                  onClick={() => deleteNote(n._id)}
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