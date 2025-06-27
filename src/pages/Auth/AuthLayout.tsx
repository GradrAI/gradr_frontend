import { Outlet, Link, useLocation } from "react-router-dom";
import useStore from "@/state";

const AuthLayout = () => {
  const { user } = useStore();
  const location = useLocation();

  return (
    <div className="w-dvw h-dvh flex flex-col justify-between bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="w-full p-4 shadow-md bg-white flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          GradrAI
        </Link>

        {!user ? (
          <div className="space-x-4 text-sm text-gray-600 px-6">
            {location.pathname !== "/auth/sign-in" && (
              <Link to="/auth/sign-in" className="hover:underline">
                Sign In
              </Link>
            )}
            {location.pathname !== "/auth/sign-up" && (
              <Link to="/auth/sign-up" className="hover:underline">
                Sign Up
              </Link>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600 italic">You're signed in</div>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center py-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Outlet />
      </main>

      <footer className="w-full bg-white p-3 text-center text-xs text-gray-500 shadow-inner">
        &copy; {new Date().getFullYear()} GradrAI. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
