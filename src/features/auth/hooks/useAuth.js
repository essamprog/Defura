import { useAuthStore } from "@/store";

/**
 * Thin convenience hook so feature components import from one place.
 * Exposes the full auth store state + actions.
 */
const useAuth = () => useAuthStore();

export default useAuth;