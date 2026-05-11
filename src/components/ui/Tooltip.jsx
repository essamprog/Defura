import { useState, useRef } from "react";

const positions = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrows = {
  top:    "top-full left-1/2 -translate-x-1/2 border-t-gray-800",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800",
  left:   "left-full top-1/2 -translate-y-1/2 border-l-gray-800",
  right:  "right-full top-1/2 -translate-y-1/2 border-r-gray-800",
};

const Tooltip = ({
  children,
  content,
  position  = "top",
  delay     = 300,
  className = "",
  disabled  = false,
}) => {
  const [visible,  setVisible]  = useState(false);
  const timerRef = useRef(null);

  if (disabled || !content) return children;

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={[
            "absolute z-50 pointer-events-none",
            positions[position] ?? positions.top,
            className,
          ].join(" ")}
        >
          {/* Bubble */}
          <div className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg max-w-xs text-center leading-snug">
            {content}
          </div>

          {/* Arrow */}
          <div
            className={[
              "absolute w-0 h-0 border-4 border-transparent",
              arrows[position] ?? arrows.top,
            ].join(" ")}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;