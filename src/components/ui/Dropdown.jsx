import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// ─── Dropdown Root ───────────────────────────────────────────────────────────
const Dropdown = ({ children, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={["relative inline-block", className].filter(Boolean).join(" ")}>
      {typeof children === "function"
        ? children({ open, setOpen })
        : children}
    </div>
  );
};

// ─── Trigger ─────────────────────────────────────────────────────────────────
const DropdownTrigger = ({ children, open, setOpen, className = "" }) => (
  <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className={[
      "inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2 py-1 transition-colors",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
    <ChevronDown
      className={["w-4 h-4 text-gray-400 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
    />
  </button>
);

// ─── Menu ─────────────────────────────────────────────────────────────────────
const DropdownMenu = ({
  children,
  open,
  align = "right",
  className = "",
}) => {
  const alignClass = align === "right" ? "left-0" : "right-0";

  if (!open) return null;

  return (
    <div
      className={[
        "absolute top-full mt-1.5 z-50 min-w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden",
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};

// ─── Item ─────────────────────────────────────────────────────────────────────
const DropdownItem = ({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={[
      "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-right",
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {icon && <span className="shrink-0 text-current opacity-70">{icon}</span>}
    {children}
  </button>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
const DropdownDivider = () => <div className="my-1 border-t border-gray-100" />;

// ─── Label ───────────────────────────────────────────────────────────────────
const DropdownLabel = ({ children }) => (
  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
    {children}
  </p>
);

// ─── Exports ─────────────────────────────────────────────────────────────────
Dropdown.Trigger = DropdownTrigger;
Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Label = DropdownLabel;

export default Dropdown;