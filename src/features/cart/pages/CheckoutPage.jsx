import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, Lock, CheckCircle, Loader2, ShoppingBag,
  Shield, Zap, RefreshCw, Wifi
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useCartStore, useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import api from "@/services/api";

const PAYMENT_METHODS = [
  { id: "card",   label: "Credit / Debit Card", icon: CreditCard },
  { id: "paypal", label: "PayPal",              icon: Zap },
];

const safeFixed = (value, decimals = 2) => Number(value ?? 0).toFixed(decimals);

// ── Animated processing steps ───────────────────────────────────────────────
const PROCESSING_STEPS = [
  { icon: Wifi,        text: "Connecting to payment gateway..." },
  { icon: Shield,      text: "Verifying card details..." },
  { icon: RefreshCw,   text: "Processing payment..." },
  { icon: CheckCircle, text: "Payment confirmed!" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    items, isLoading: cartLoading, discount, coupon,
    getSubtotal, getTotal, fetchCart, clearCart,
  } = useCartStore();
  const { user, isAuthenticated, fetchEnrollments } = useAuthStore();

  const subtotal = getSubtotal();
  const total    = getTotal();

  const [method,       setMethod]       = useState("card");
  const [paying,       setPaying]       = useState(false);
  const [processingStep, setStep]       = useState(0);
  const [fields,       setFields]       = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [errors,       setErrors]       = useState([]);
  const [hasFetched,   setHasFetched]   = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().finally(() => setHasFetched(true));
    } else {
      setHasFetched(true);
    }
  }, [isAuthenticated]);


  const handleChange = (e) => {
    let val = e.target.value;
    // Auto-format card number with spaces
    if (e.target.name === "cardNumber") {
      val = val.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
    }
    // Auto-format expiry
    if (e.target.name === "expiry") {
      val = val.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1 / $2").slice(0, 7);
    }
    setFields(p => ({ ...p, [e.target.name]: val }));
  };

  const handlePay = async () => {
    const userId = user?._id ?? user?.id;
    if (!userId)            { setErrors(["You must be logged in to purchase."]); return; }
    if (items.length === 0) { setErrors(["Your cart is empty."]); return; }


    setPaying(true);
    setErrors([]);
    setStep(0);

    // Simulate processing steps with delays
    const stepDelay = (step, delay) =>
      new Promise(resolve => setTimeout(() => { setStep(step); resolve(); }, delay));

    await stepDelay(1, 400);
    await stepDelay(2, 800);
    await stepDelay(3, 400);

    const failed = [];
    const succeededCourses = [];

    try {
      for (const course of items) {
        try {
          const res = await api.post("/student/checkout.php", {
            course_id: course.id ?? course._id,
            coupon_code: coupon?.code ?? null,
          });
          succeededCourses.push({
            ...course,
            orderId: res?.data?.data?.order_id,
          });
        } catch (err) {
          const msg = err.response?.data?.message ?? `Failed to enroll in "${course.title}".`;
          if (!msg.toLowerCase().includes("already enrolled")) failed.push(msg);
          else succeededCourses.push(course); // already enrolled = ok
        }
      }

      if (failed.length > 0) {
        setErrors(failed);
        setPaying(false);
        return;
      }

      await clearCart();
      try {
        await fetchEnrollments();
      } catch (_) {}

      // Navigate to the beautiful order success page with data
      navigate(ROUTES.ORDER_SUCCESS, {
        state: {
          orderId:     succeededCourses[0]?.orderId ?? null,
          courseCount: succeededCourses.length,
          totalAmount: total,
          coursesList: succeededCourses.map(c => ({
            title:         c.title,
            thumbnail_url: c.image ?? c.thumbnail_url ?? null,
          })),
        },
        replace: true,
      });

    } catch (err) {
      setErrors(["Payment failed. Please try again."]);
      setPaying(false);
    }
  };

  // ── Processing overlay ───────────────────────────────────────────────────
  if (paying) {
    const step = PROCESSING_STEPS[processingStep] ?? PROCESSING_STEPS[0];
    const StepIcon = step.icon;
    const isDone = processingStep >= 3;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 max-w-sm w-full text-center space-y-6 shadow-2xl">
          {/* Animated ring */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"
              style={{ animationDuration: isDone ? '0s' : '1s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {isDone
                ? <CheckCircle className="w-10 h-10 text-emerald-400" />
                : <StepIcon className="w-8 h-8 text-blue-300" />
              }
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isDone ? "Payment Successful! 🎉" : "Processing Payment"}
            </h2>
            <p className="text-sm text-blue-200">{step.text}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2">
            {PROCESSING_STEPS.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  i < processingStep ? "w-6 bg-blue-400" :
                  i === processingStep ? "w-8 bg-white" :
                  "w-1.5 bg-white/20",
                ].join(" ")}
              />
            ))}
          </div>

          <p className="text-xs text-white/40">🔒 Secured by 256-bit SSL encryption</p>
        </div>
      </div>
    );
  }

  // ── Loading cart ─────────────────────────────────────────────────────
  if (!hasFetched || cartLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading your cart...</p>
      </div>
    </div>
  );

  // ── Empty cart ───────────────────────────────────────────────────────
  if (hasFetched && !cartLoading && items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-sm w-full text-center space-y-4">
        <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Add some courses before checking out.</p>
        <Button fullWidth onClick={() => navigate(ROUTES.CART)}>Back to Cart</Button>
      </div>
    </div>
  );

  // ── Main checkout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <Shield className="w-3 h-3" /> SSL Secured
          </span>
        </div>

        {/* Sandbox badge */}
        <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3">
          <Zap className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">
            <strong>Sandbox Mode</strong> — Enter any card details to simulate a successful payment. No real transaction will occur.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Payment Form ──────────────────────────────────── */}
          <div className="flex-1 space-y-5">

            {/* Method selector */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={[
                        "flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-medium transition-all",
                        method === m.id
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <Icon className="w-4 h-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-600">{e}</p>)}
              </div>
            )}

            {/* Card form */}
            {method === "card" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="text-sm font-bold text-gray-900">Card Details</h2>

                {/* Card preview strip */}
                <div className="h-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 flex items-center px-4 gap-3">
                  <div className="flex gap-1">
                    <div className="w-6 h-4 rounded-sm bg-amber-400 opacity-90" />
                    <div className="w-6 h-4 rounded-sm bg-amber-600 opacity-60 -ml-3" />
                  </div>
                  <span className="text-xs text-slate-300 font-mono flex-1 tracking-widest">
                    {fields.cardNumber || "•••• •••• •••• ••••"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {fields.expiry || "MM/YY"}
                  </span>
                </div>

                <Input
                  label="Cardholder Name" name="cardName"
                  placeholder="Alex Johnson" value={fields.cardName}
                  onChange={handleChange}
                />
                <Input
                  label="Card Number" name="cardNumber"
                  placeholder="1234 5678 9012 3456" value={fields.cardNumber}
                  onChange={handleChange} maxLength={19}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date" name="expiry"
                    placeholder="MM / YY" value={fields.expiry}
                    onChange={handleChange} maxLength={7}
                  />
                  <Input
                    label="CVV" name="cvv"
                    placeholder="•••" value={fields.cvv}
                    onChange={handleChange} maxLength={4} type="password"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  Your payment information is encrypted and never stored.
                </div>
              </div>
            )}

            {method === "paypal" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-black text-blue-600">P</span>
                </div>
                <p className="text-sm text-gray-500">You'll be redirected to PayPal to complete your purchase.</p>
                <Button variant="outline" size="lg" onClick={handlePay} isLoading={paying} loadingText="Redirecting...">
                  Continue with PayPal
                </Button>
              </div>
            )}
          </div>

          {/* ── Order Summary ─────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Order Summary</h2>

              {/* Course list */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map(course => (
                  <div key={course._id ?? course.id} className="flex gap-3 items-center">
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={course.image ?? course.thumbnail_url ?? ""}
                        alt="" className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">${safeFixed(course.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {discount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span><span>${safeFixed(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Coupon {coupon?.code ? `(${coupon.code})` : "discount"}</span>
                      <span>−${safeFixed(discount)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Total</span><span>${safeFixed(total)}</span>
                </div>
              </div>

              {/* Pay CTA */}
              {method === "card" && (
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                >
                  <Lock className="w-4 h-4" />
                  Pay ${safeFixed(total)}
                </button>
              )}

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> SSL Secure
                </span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">30-Day Guarantee</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">Mock Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;