import { Outlet } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="w-full h-dvh overflow-y-scroll flex items-center justify-center bg-white">
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};

export default SignUp;
