import { Outlet } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="w-full h-dvh flex items-center justify-center bg-gray-500">
      <div className="m-w-2/5 w-3/5 p-8 bg-white shadow border rounded-md">
        <Outlet />
      </div>
    </div>
  );
};

export default SignUp;
