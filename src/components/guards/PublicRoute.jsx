import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { ROUTES } from "../../constants";

/**
 * PublicRoute — allows everyone to view public pages.
 * Authenticated users are NOT redirected; they can still browse
 * the homepage, course listing, etc. while logged in.
 *
 * Only login/register pages redirect authenticated users away
 * (handled individually via their own guards if needed).
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  // Only redirect away from auth-specific pages (login, register, etc.)
  // Do NOT redirect from homepage or public browsing pages.
  if (isAuthenticated && false) {   // disabled — let logged-in users see homepage
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PublicRoute;