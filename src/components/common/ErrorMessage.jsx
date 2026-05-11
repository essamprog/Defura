import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      <p className="text-sm leading-snug">{message}</p>
    </div>
  );
};

export default ErrorMessage;