import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircleCheckBigIcon } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/state";

const Content = () => {
  const nav = useNavigate();
  const [clicked, setClicked] = useState(false);
  const { accountType } = useStore();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["Data"],
    queryFn: () => axios.get(`/auth/google`),
    enabled: clicked,
  });

  useEffect(() => {
    if (isLoading) toast.success("Signing you in...");
    if (isError) toast.error(error);
    if (data) window.location.href = data?.data?.authorizationUrl;
  }, [isLoading, isError, error, data]);

  const handleLogin = () => {
    setClicked(true);
  };

  return (
    <div className="w-2/4 h-full flex flex-col items-start justify-evenly gap-6 p-8">
      {accountType?.toLocaleLowerCase() === "organization" && (
        <div className="flex flex-col gap-4">
          <h1 className="font-2xl">Welcome to Gradr for Organizations!</h1>
          <p className="text-gray-800 text-xl">
            Gradr has a number of benefits for your organization:
          </p>

          <div className="flex flex-col justify-between gap-4 text-slate-800">
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Add up to 50 teachers to your organization</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Get report across all grading activities</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Manage all assessment data in one place</p>
            </div>
          </div>
        </div>
      )}
      {accountType?.toLocaleLowerCase() === "individual" && (
        <div className="flex flex-col gap-4">
          <h1 className="font-2xl">Welcome to Gradr for Individuals!</h1>
          <p className="text-gray-800 text-xl">
            Gradr has a number of benefits for you:
          </p>

          <div className="flex flex-col justify-between gap-4 text-slate-800">
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Grade up to 500 students</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Get report across all grading activities</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <CircleCheckBigIcon className="text-blue-800" />
              <p>Manage all assessment data in one place</p>
            </div>
          </div>
        </div>
      )}
      <Button
        variant=""
        onClick={handleLogin}
        className="self-start bg-pink-500 hover:bg-pink-600 py-6 px-10 text-xl"
      >
        Get Started
      </Button>
    </div>
  );
};

export default Content;
