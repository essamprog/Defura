import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";
import LoadingScreen from "../common/LoadingScreen";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for Zustand persist rehydration before making auth decisions.
  // Without this, isAuthenticated is always false on page refresh
  // for a brief moment, causing an incorrect redirect to /login.
  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;