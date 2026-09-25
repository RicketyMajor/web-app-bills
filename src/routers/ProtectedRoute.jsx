import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session);
  if (session === undefined) return null;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const session = useAuthStore((s) => s.session);
  if (session === undefined) return null;
  return session ? <Navigate to="/" replace /> : <Outlet />;
}
