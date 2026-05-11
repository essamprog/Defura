const colors = {
  blue: "bg-blue-600",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const heights = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
  xl: "h-4",
};

const ProgressBar = ({
  value = 0,
  max = 100,
  color = "blue",
  height = "md",
  showLabel = false,
  label,
  animated = true,
  rounded = true,
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={["w-full flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      {/* Label row */}
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{label || "Progress"}</span>
          <span className="font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}

      {/* Track */}
      <div
        className={[
          "w-full bg-gray-100 overflow-hidden",
          heights[height] ?? heights.md,
          rounded ? "rounded-full" : "rounded-none",
        ].join(" ")}
      >
        {/* Fill */}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={[
            "h-full transition-all duration-500",
            colors[color] ?? colors.blue,
            rounded ? "rounded-full" : "",
            animated && percentage < 100 ? "animate-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;