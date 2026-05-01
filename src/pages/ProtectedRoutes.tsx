import useStore from "@/state";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const { user } = useStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");

  return (
    <>
      {(user && Object.keys(user)?.length) || code ? (
        <Outlet />
      ) : (
        <Navigate to="/" state={{ path: location.pathname }} replace />
      )}
    </>
  );
};

export default ProtectedRoutes;
