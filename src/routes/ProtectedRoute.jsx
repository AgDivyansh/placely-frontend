import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/hooks";

// Where each persona lands when it hits a page it isn't allowed on. Kept in
// one place so redirects always target a page that persona CAN reach (else
// the guard would bounce them back and loop).
const HOME = { admin: "/admin", alumni: "/mentor", student: "/dashboard" };

/**
 * Gates a route to a persona ("student" | "alumni" | "admin"). Persona is the
 * effective experience — alumni is computed from isAlumni, not a stored role —
 * so `allowedRole` is matched against persona, not the raw role.
 */
export function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, persona } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRole && persona !== allowedRole) {
    return <Navigate to={HOME[persona] || "/dashboard"} replace />;
  }
  return children;
}
