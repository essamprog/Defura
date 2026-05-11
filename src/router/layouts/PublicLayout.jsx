import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "../../components/layout";
import { Toast } from "../../components/ui";
import { useUIStore } from "../../store";

const PublicLayout = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="ltr">
      {/* ── Top Navigation ─────────────────────────────────────── */}
      <Navbar />

      {/* ── Page Content ───────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Footer />

      {/* ── Global Toast Notifications ─────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 left-5 z-50 flex flex-col-reverse gap-2 w-80 max-w-[calc(100vw-2.5rem)]"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicLayout;