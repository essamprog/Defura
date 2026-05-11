import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({
  value = 0,
  max = 5,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  className = "",
}) => {
  const [hovered, setHovered] = useState(null);

  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const display = hovered ?? value;

  return (
    <div className={["inline-flex items-center gap-1", className].filter(Boolean).join(" ")}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < display;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(i + 1)}
            onMouseEnter={() => !readonly && setHovered(i + 1)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={[
              "transition-transform duration-100",
              !readonly ? "hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded" : "cursor-default",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`${i + 1} stars`}
          >
            <Star
              className={[
                sizes[size] ?? sizes.md,
                "transition-colors duration-100",
                filled ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300",
              ].join(" ")}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="text-sm font-medium text-gray-600 mr-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;