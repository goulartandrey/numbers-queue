import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
