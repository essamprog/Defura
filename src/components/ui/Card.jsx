// ─── Card Root ──────────────────────────────────────────────────────────────
const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  hover = false,
  onClick,
  ...props
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      onClick={onClick}
      className={[
        "bg-white rounded-2xl border border-gray-100",
        paddings[padding] ?? paddings.md,
        shadows[shadow] ?? shadows.sm,
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : "",
        onClick ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

// ─── Card Header ────────────────────────────────────────────────────────────
const CardHeader = ({ children, className = "", divider = true }) => (
  <div
    className={[
      "flex items-center justify-between pb-4",
      divider ? "border-b border-gray-100 mb-4" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </div>
);

// ─── Card Title ─────────────────────────────────────────────────────────────
const CardTitle = ({ children, className = "" }) => (
  <h3 className={["text-base font-semibold text-gray-800", className].filter(Boolean).join(" ")}>
    {children}
  </h3>
);

// ─── Card Body ───────────────────────────────────────────────────────────────
const CardBody = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

// ─── Card Footer ────────────────────────────────────────────────────────────
const CardFooter = ({ children, className = "", divider = true }) => (
  <div
    className={[
      "pt-4 mt-4",
      divider ? "border-t border-gray-100" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </div>
);

// ─── Exports ─────────────────────────────────────────────────────────────────
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;