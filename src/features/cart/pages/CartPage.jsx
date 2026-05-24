import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Tag, ShoppingBag, ArrowRight, Lock, Clock, Users } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { useCartStore, useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { formatDuration, resolveMediaUrl } from "@/utils";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, getSubtotal, getTotal, discount, applyCoupon, removeCoupon, coupon, fetchCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Derived — recalculate on every render so they stay in sync with items/discount
  const subtotal = getSubtotal();
  const total    = getTotal();

  // Sync with the server whenever the cart page is opened directly
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const result = await applyCoupon(couponInput.trim());
    if (!result.success) {
      setCouponError(result.error ?? "Invalid coupon code.");
    } else {
      setCouponInput("");
    }
    setCouponLoading(false);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.CHECKOUT } } }); return; }
    navigate(ROUTES.CHECKOUT);
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your cart is empty"
          description="Looks like you haven't added any courses yet. Browse our catalog and find something you'll love."
          action={() => navigate(ROUTES.COURSES)}
          actionLabel="Browse Courses"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mb-8">{items.length} course{items.length > 1 ? "s" : ""} in your cart</p>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Cart Items ────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            {items.map((course, idx) => {
              const courseId = course?._id ?? course?.id ?? course?.course_id ?? idx;
              const thumb = resolveMediaUrl(course?.thumbnail ?? course?.thumbnail_url ?? course?.image);
              return (
              <div key={courseId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                {/* Thumbnail */}
                <Link to={ROUTES.courseDetail(courseId)} className="shrink-0">
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={thumb ?? ""}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "";
                      }}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={ROUTES.courseDetail(courseId)}>
                    <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors mb-1">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-2">By {course.instructor?.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration > 0 ? formatDuration(course.duration) : "—"}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {Number(course.students) > 0 ? Number(course.students).toLocaleString() : "—"}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">{course.level}</span>
                  </div>
                </div>

                {/* Price + Remove */}
                <div className="shrink-0 flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">${course.price}</p>
                    {course.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">${course.originalPrice}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(courseId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )})}
          </div>

          {/* ── Order Summary ─────────────────────────────────── */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20 space-y-5">
              <h2 className="text-base font-bold text-gray-900">Order Summary</h2>

              {/* Price breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.length} course{items.length > 1 ? "s" : ""})</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Coupon ({coupon?.code})
                    </span>
                    <span className="font-medium text-emerald-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 mt-1">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              {!coupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponError(""); }}
                      leftIcon={<Tag className="w-4 h-4" />}
                      error={couponError}
                      containerClassName="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleApplyCoupon}
                      isLoading={couponLoading}
                      className="shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">Try <code className="bg-gray-100 px-1 rounded">SAVE20</code> for 20% off</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">{coupon.code} applied!</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-gray-600 underline">Remove</button>
                </div>
              )}

              {/* Checkout */}
              <Button fullWidth size="lg" onClick={handleCheckout} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Checkout
              </Button>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                Secure checkout — 30-Day Money-Back Guarantee
              </div>

              {/* Continue shopping */}
              <Link to={ROUTES.COURSES} className="block text-center text-xs text-blue-600 hover:text-blue-700 font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;