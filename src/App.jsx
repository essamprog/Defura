import { useEffect } from "react";
import AppRouter from "./router";
import { useAuthStore, useNotificationsStore } from "./store";
import useCartStore from "./store/slices/cartSlice";

const App = () => {
  const { isAuthenticated, fetchMe, fetchEnrollments } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { startPolling, stopPolling } = useNotificationsStore();

  // On every mount (and whenever login state changes), sync from the server.
  // This is what provides cart persistence across page refreshes.
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      fetchCart(); // ← rehydrate cart from DB; no-ops silently if API is unreachable
      fetchEnrollments(); // ← fetch enrolled courses for button status tracking
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isAuthenticated, startPolling, stopPolling]);

  return <AppRouter />;
};

export default App;