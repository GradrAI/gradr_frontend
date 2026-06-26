import useStore from "@/state";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const { user } = useStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");

  // If there's a Google OAuth code, redirect to the dedicated callback route
  if (code) {
    return <Navigate to={`/auth/google/callback?code=${code}`} replace />;
  }

  return user && Object.keys(user)?.length ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ path: location.pathname }} replace />
  );
};

export default ProtectedRoutes;
