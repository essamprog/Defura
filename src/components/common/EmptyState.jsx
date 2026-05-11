import Button from "../ui/Button";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  className = "",
}) => {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 text-gray-300">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;