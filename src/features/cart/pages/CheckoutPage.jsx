import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useCartStore, useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import api from "@/services/api";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "paypal", label: "PayPal" },
];

const CheckoutPage = () => {
  const navigate   = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [method,   setMethod]  = useState("card");
  const [loading,  setLoading] = useState(false);
  const [fields,   setFields]  = useState({ cardName:"", cardNumber:"", expiry:"", cvv:"" });
  const [success,  setSuccess] = useState(false);
  const [errors,   setErrors]  = useState([]);

  const handleChange = (e) => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePay = async () => {
    if (!user?.id) { setErrors(['You must be logged in to purchase.']); return; }
    if (items.length === 0) { setErrors(['Your cart is empty.']); return; }
    setLoading(true);
    setErrors([]);
    const failedCourses = [];
    try {
      // Enroll in each cart item via checkout.php
      for (const course of items) {
        try {
          await api.post(`/student/checkout.php`, {
            course_id: course.id ?? course._id,
            // Dummy card fields intentionally ignored by backend (mock checkout)
            // cardName: fields.cardName, cardNumber: fields.cardNumber, expiry: fields.expiry, cvv: fields.cvv,
          });
        } catch (err) {
          const msg = err.response?.data?.message ?? `Failed to enroll in "${course.title}"."`;
          // Already enrolled is acceptable — skip it silently
          if (!msg.includes('already enrolled')) failedCourses.push(msg);
        }
      }
      if (failedCourses.length > 0) {
        setErrors(failedCourses);
      } else {
        clearCart();
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-10 max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-sm text-gray-500">Your courses are ready. Start learning right now — your journey begins today.</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button fullWidth onClick={() => navigate(ROUTES.MY_COURSES)}>Start Learning</Button>
          <Button fullWidth variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Payment Form ─────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Method selector */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={[
                      "flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium transition-all",
                      method === m.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300",
                    ].join(" ")}
                  >
                    <CreditCard className="w-4 h-4" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error list */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-600">{e}</p>)}
              </div>
            )}

            {/* Card fields */}
            {method === "card" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="text-sm font-bold text-gray-900 mb-1">Card Details</h2>
                <Input label="Cardholder Name" name="cardName" placeholder="Alex Johnson" value={fields.cardName} onChange={handleChange} leftIcon={<CreditCard className="w-4 h-4" />} />
                <Input label="Card Number" name="cardNumber" placeholder="1234 5678 9012 3456" value={fields.cardNumber} onChange={handleChange} maxLength={19} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry Date" name="expiry" placeholder="MM / YY" value={fields.expiry} onChange={handleChange} maxLength={7} />
                  <Input label="CVV" name="cvv" placeholder="•••" value={fields.cvv} onChange={handleChange} maxLength={4} type="password" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  Your payment info is encrypted and secure.
                </div>
              </div>
            )}

            {method === "paypal" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-500 mb-4">You'll be redirected to PayPal to complete your purchase.</p>
                <Button variant="outline" size="lg" onClick={handlePay} isLoading={loading} loadingText="Redirecting...">
                  Continue with PayPal
                </Button>
              </div>
            )}
          </div>

          {/* ── Order Summary ─────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map(course => (
                  <div key={course._id} className="flex gap-3">
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={course.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-400">${course.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay button */}
              {method === "card" && (
                <Button
                  fullWidth size="lg"
                  isLoading={loading}
                  loadingText="Processing payment..."
                  leftIcon={!loading && <Lock className="w-4 h-4" />}
                  onClick={handlePay}
                >
                  Pay ${total.toFixed(2)}
                </Button>
              )}

              <p className="text-center text-xs text-gray-400">30-Day Money-Back Guarantee</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;