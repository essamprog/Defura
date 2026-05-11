const sizes = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
  xl: "w-12 h-12 border-4",
};

const colors = {
  blue: "border-blue-200 border-t-blue-600",
  white: "border-white/30 border-t-white",
  gray: "border-gray-200 border-t-gray-500",
  green: "border-green-200 border-t-green-600",
  red: "border-red-200 border-t-red-600",
};

const Spinner = ({
  size = "md",
  color = "blue",
  className = "",
  label = "Loading...",
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={[
        "inline-block rounded-full animate-spin shrink-0",
        sizes[size] ?? sizes.md,
        colors[color] ?? colors.blue,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
};

export default Spinner;