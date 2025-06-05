import useStore from "@/state";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const { user } = useStore();
  const location = useLocation();

  return (
    <>
      {user && Object.keys(user)?.length ? (
        <Outlet />
      ) : (
        <Navigate to="/" state={{ path: location.pathname }} replace />
      )}
    </>
  );
};

export default ProtectedRoutes;
