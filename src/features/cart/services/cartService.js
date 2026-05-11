import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const cartService = {
  getCart:      ()         => api.get(ENDPOINTS.CART.BASE),
  addItem:      (courseId) => api.post(ENDPOINTS.CART.ADD, { course_id: courseId }),
  removeItem:   (id)       => api.delete(ENDPOINTS.CART.REMOVE(id)),
  applyCoupon:  (code)     => api.post(ENDPOINTS.CART.APPLY_COUPON, { code }),
  checkout:     (payload)  => api.post(ENDPOINTS.ORDERS.CHECKOUT, payload),
};

export default cartService;