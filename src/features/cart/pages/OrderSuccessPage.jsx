// src/features/cart/pages/OrderSuccessPage.jsx

import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  BookOpen,
  ArrowRight,
  Download,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";

// ─── Confetti animation (pure CSS/JS — no external lib) ──────────────────────
const CONFETTI_COLORS = [
  "#7C3AED", "#6D28D9", "#4F46E5",
  "#059669", "#D97706", "#DC2626",
  "#0891B2", "#EC4899",
];

const ConfettiPiece = ({ style }) => (
  <div
    className="absolute w-2 h-2 rounded-sm opacity-0"
    style={style}
  />
);

// ─── What happens next step card ──────────────────────────────────────────────
const NextStep = ({ icon: Icon, color, bg, title, description }) => (
  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const OrderSuccessPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const canvasRef = useRef(null);

  // Pull order data passed via router state (from CheckoutPage)
  // Falls back gracefully if navigated to directly
  const orderData = location.state ?? {};
  const {
    orderId      = null,
    courseCount  = 1,
    totalAmount  = null,
    coursesList  = [],    // array of { title, thumbnail_url }
  } = orderData;

  // ── Canvas confetti ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current;
    if (!canvas) return;

    const ctx     = canvas.getContext("2d");
    const W       = canvas.width  = window.innerWidth;
    const H       = canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H - H,
      r:    Math.random() * 6 + 4,
      d:    Math.random() * 80 + 20,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleSpeed: Math.random() * 0.1 + 0.05,
    }));

    let angle = 0;
    let frame;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      angle += 0.01;

      pieces.forEach((p) => {
        p.tiltAngle += p.tiltAngleSpeed;
        p.y         += Math.cos(angle + p.d) + 2;
        p.x         += Math.sin(angle) * 1.5;
        p.tilt       = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth   = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();

        // Reset piece when it falls off-screen
        if (p.y > H + 10) {
          p.x = Math.random() * W;
          p.y = -10;
        }
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    // Stop after 4 seconds to save resources
    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
    }, 4000);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stopTimer);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F0EFFF 0%, #EEF2FF 50%, #F0FDF4 100%)" }}
    >
      {/* Confetti canvas — sits behind content */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

          {/* ── Top gradient band ─────────────────────────────────────────── */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, #7C3AED, #4F46E5, #059669)",
            }}
          />

          <div className="p-8">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer pulse ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: "#7C3AED", transform: "scale(1.4)" }}
                />
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
                >
                  <CheckCircle className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful! 🎉
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your purchase is confirmed. You now have full lifetime access
                to{" "}
                <strong className="text-gray-700">
                  {courseCount} {courseCount === 1 ? "course" : "courses"}
                </strong>
                .
              </p>

              {/* Order meta */}
              {(orderId || totalAmount) && (
                <div className="mt-4 inline-flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  {orderId && (
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                        Order ID
                      </p>
                      <p className="text-xs font-mono font-bold text-gray-700">
                        #{String(orderId).padStart(6, "0")}
                      </p>
                    </div>
                  )}
                  {orderId && totalAmount && (
                    <div className="w-px h-6 bg-gray-200" />
                  )}
                  {totalAmount && (
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                        Amount Paid
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        ${Number(totalAmount).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Purchased courses preview */}
            {coursesList.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Your New Courses
                </p>
                {coursesList.slice(0, 3).map((course, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {course.title}
                      </p>
                      {course.full_name && (
                        <p className="text-[10px] text-gray-400">
                          {course.full_name}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
                {coursesList.length > 3 && (
                  <p className="text-center text-xs text-gray-400">
                    +{coursesList.length - 3} more course
                    {coursesList.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {/* What happens next */}
            <div className="space-y-2.5 mb-7">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                What Happens Next
              </p>
              <NextStep
                icon={BookOpen}
                color="#7C3AED"
                bg="#EDE9FE"
                title="Start learning immediately"
                description="All enrolled courses are ready — jump into your first lesson right now."
              />
              <NextStep
                icon={Star}
                color="#D97706"
                bg="#FEF3C7"
                title="Earn your certificate"
                description="Complete all lessons to receive a verified certificate of completion."
              />
              <NextStep
                icon={Download}
                color="#059669"
                bg="#D1FAE5"
                title="Receipt sent to your email"
                description="A detailed payment receipt has been sent to your registered email address."
              />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(ROUTES.MY_COURSES)}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
              >
                <BookOpen className="w-4 h-4" />
                Go to My Courses
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(ROUTES.COURSES)}
                className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Browse More
              </button>
            </div>

            {/* Support note */}
            <p className="text-center text-xs text-gray-400 mt-5">
              Issues with your purchase?{" "}
              <a
                href="mailto:support@defura.com"
                className="text-violet-600 hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;