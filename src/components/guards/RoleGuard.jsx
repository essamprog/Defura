import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";

const RoleGuard = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default RoleGuard;