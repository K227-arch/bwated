import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authState";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return user.id ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
