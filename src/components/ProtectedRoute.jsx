
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role || "student";

  if (requiredRole && role !== requiredRole) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
