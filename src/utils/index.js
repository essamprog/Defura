// ─── Date Formatting ─────────────────────────────────────────────────────────
export const formatDate = (date, locale = "en-US") => {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(date);
};

// ─── Price Formatting ─────────────────────────────────────────────────────────
export const formatPrice = (price, currency = "EGP") => {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

// ─── Duration Formatting ──────────────────────────────────────────────────────
export const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return "0 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr${hours === 1 ? "" : "s"}`;
  return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} min`;
};

export const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ─── Validators ───────────────────────────────────────────────────────────────
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^(\+20|0)?1[0125]\d{8}$/.test(phone);

export const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

// ─── String Helpers ───────────────────────────────────────────────────────────
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

// ─── Misc Helpers ─────────────────────────────────────────────────────────────
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const calcDiscount = (original, discounted) => {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  return query.toString();
};

// ─── Media URL Helpers ────────────────────────────────────────────────────────
const DEFAULT_API_BASE_URL = "http://localhost/LMS-React/backend/api";

export const COURSE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eff6ff"/>
          <stop offset="1" stop-color="#e0e7ff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <g fill="#93c5fd">
        <path d="M260 152c0-18 14-32 32-32h240c18 0 32 14 32 32v176c0 18-14 32-32 32H292c-18 0-32-14-32-32V152zm40 24h200a16 16 0 0 1 16 16v136a16 16 0 0 1-16 16H300a16 16 0 0 1-16-16V192a16 16 0 0 1 16-16z"/>
        <path d="M320 220h160v24H320zM320 268h120v24H320z"/>
      </g>
    </svg>
  `);

/** True when a lesson is marked as a free preview (handles string "1" from API). */
export const isFreePreviewLesson = (lesson) =>
  lesson != null && Number(lesson?.is_free_preview ?? lesson?.isFreePreview) === 1;

export const getSiteBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
  try {
    const u = new URL(apiBase);
    const appPath = u.pathname.replace(/\/backend\/api\/?$/i, "").replace(/\/$/, "");
    return `${u.origin}${appPath}`;
  } catch {
    // If API base is not an absolute URL, just return it as-is
    return apiBase.replace(/\/backend\/api\/?$/i, "").replace(/\/$/, "");
  }
};

export const resolveMediaUrl = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  // Protocol-relative
  if (raw.startsWith("//")) {
    return `${window.location.protocol}${raw}`;
  }

  // Absolute path on same host
  if (raw.startsWith("/")) {
    const siteBase = getSiteBaseUrl();
    try {
      const u = new URL(siteBase);
      return `${u.origin}${raw}`;
    } catch {
      return raw;
    }
  }

  // Relative path under site base (e.g. "backend/uploads/..", "uploads/..")
  const siteBase = getSiteBaseUrl();
  return `${siteBase}/${raw.replace(/^\.?\//, "")}`;
};