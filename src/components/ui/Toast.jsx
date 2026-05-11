import { X, CheckCircle, XCircle, Info } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
};

const Toast = ({ toast, onClose }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-72 max-w-sm animate-in slide-in-from-right-5 ${
        colors[toast.type] || colors.info
      }`}
    >
      {icons[toast.type] || icons.info}
      <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;