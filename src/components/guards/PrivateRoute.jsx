import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

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