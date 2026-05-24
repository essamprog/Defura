import { useState, useEffect } from "react";
import { getInitials } from "../../utils";

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const colors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-red-100 text-red-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
];

// Deterministic color from name
const getColor = (name = "") => {
  const code = name.charCodeAt(0) || 0;
  return colors[code % colors.length];
};

const Avatar = ({
  src,
  name = "",
  size = "md",
  shape = "circle",
  online,
  className = "",
  ...props
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset imgError state when src changes to allow new previews/uploads to show instantly
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div className={["relative inline-flex shrink-0", className].filter(Boolean).join(" ")} {...props}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={[
            "object-cover",
            sizes[size] ?? sizes.md,
            shapeClass,
          ].join(" ")}
        />
      ) : (
        <div
          className={[
            "flex items-center justify-center font-semibold select-none",
            sizes[size] ?? sizes.md,
            shapeClass,
            colorClass,
          ].join(" ")}
          aria-label={name}
        >
          {initials || "?"}
        </div>
      )}

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={[
            "absolute bottom-0 left-0 block rounded-full ring-2 ring-white",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5",
            online ? "bg-green-500" : "bg-gray-400",
          ].join(" ")}
        />
      )}
    </div>
  );
};

export default Avatar;