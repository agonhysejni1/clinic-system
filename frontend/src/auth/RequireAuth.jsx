import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";

export default function RequireAuth() {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
