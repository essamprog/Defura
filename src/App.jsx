import { useEffect } from "react";
import AppRouter from "./router";
import { useAuthStore } from "./store";

const App = () => {
  const { isAuthenticated, fetchMe } = useAuthStore();

  // Sync user data on app load if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, []);

  return <AppRouter />;
};

export default App;