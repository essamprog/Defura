import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PublicRoute;