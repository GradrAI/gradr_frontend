import { Outlet } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="w-full h-dvh flex items-center justify-center bg-gray-500">
      <div className="container p-8 rounded-md">
        <Outlet />
      </div>
    </div>
  );
};

export default SignUp;
