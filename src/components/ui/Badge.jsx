const variants = {
  default: "bg-gray-100 text-gray-600",
  primary: "bg-blue-50 text-blue-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
  purple: "bg-purple-50 text-purple-700",
  // Solid variants
  "solid-primary": "bg-blue-600 text-white",
  "solid-success": "bg-green-600 text-white",
  "solid-danger": "bg-red-600 text-white",
  "solid-warning": "bg-amber-500 text-white",
};

const sizes = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1",
  lg: "text-sm px-3 py-1 gap-1.5",
};

const Badge = ({
  children,
  variant = "default",
  size = "md",
  dot = false,
  rounded = "full",
  className = "",
  ...props
}) => {
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-md";

  return (
    <span
      className={[
        "inline-flex items-center font-medium",
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.md,
        roundedClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      )}
      {children}
    </span>
  );
};

export default Badge;