import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/hooks";

export function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRole && role !== allowedRole) {
    // Authenticated but wrong role — redirect to their home
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}
