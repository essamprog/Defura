import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Trash2, BookOpen, Award, Tag, Info } from "lucide-react";
import { useNotificationsStore } from "@/store";
import { formatRelativeTime } from "@/utils";

// ─── Icon map by notification type ───────────────────────────────────────────
const TYPE_META = {
  course:  { icon: BookOpen, bg: "bg-blue-50",    icon_color: "text-blue-500" },
  cert:    { icon: Award,    bg: "bg-emerald-50",  icon_color: "text-emerald-500" },
  promo:   { icon: Tag,      bg: "bg-amber-50",    icon_color: "text-amber-500" },
  system:  { icon: Info,     bg: "bg-gray-100",    icon_color: "text-gray-500" },
};

// ─── Mock notifications ───────────────────────────────────────────────────────
const MOCK = [
  { _id:"n1", type:"cert",   title:"Certificate Earned! 🎉",     body:"You completed Full-Stack Development. Download your certificate.",     isRead:false, createdAt: new Date(Date.now()-7200000).toISOString() },
  { _id:"n2", type:"course", title:"New lesson available",        body:"Your instructor added 3 new lessons to React Advanced Patterns.",      isRead:false, createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id:"n3", type:"promo",  title:"Flash Sale — 48 hrs left",    body:"Get 30% off any course with code FLASH30. Offer ends soon.",           isRead:true,  createdAt: new Date(Date.now()-172800000).toISOString() },
  { _id:"n4", type:"system", title:"Platform maintenance",        body:"Scheduled maintenance on Saturday 2–4 AM UTC. Save your progress.",    isRead:true,  createdAt: new Date(Date.now()-259200000).toISOString() },
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Seed mock data once
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();
  const items = notifications.length ? notifications : MOCK;
  const unread = notifications.length ? unreadCount : MOCK.filter(n => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No notifications yet</div>
            ) : items.map(n => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={[
                    "flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                    !n.isRead ? "bg-blue-50/40" : "",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${meta.icon_color}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;