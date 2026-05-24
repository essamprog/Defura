import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";
import LoadingScreen from "../common/LoadingScreen";

const RoleGuard = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default RoleGuard;