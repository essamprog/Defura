import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { AlertTriangle, Trash2, Info } from "lucide-react";

const icons = {
  danger: <Trash2 className="w-6 h-6 text-red-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  const btnVariant = variant === "danger" ? "danger" : variant === "warning" ? "primary" : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={btnVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
          {icons[variant] ?? icons.info}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
          {message && <p className="text-sm text-gray-500 leading-relaxed">{message}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;