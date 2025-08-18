import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import useStore from "@/state";
import toast from "react-hot-toast";
import callback from "@/data/callback";

export function useGoogleAuth(code: string | null) {
  const navigate = useNavigate();
  const { accountType, studentData, setCode } = useStore();

  const mutation = useMutation({
    mutationKey: ["profileData"],
    mutationFn: callback,
    onSuccess: (data) => {
      if (data.status === "error" || !data.data) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      const {
        data: { access_token, user },
      } = data;

      localStorage.setItem("token", access_token);

      if (code) setCode(code);
      // Navigation logic directly after storing user
      switch (accountType) {
        case "student":
          if (studentData?.courseId && studentData?.uniqueCode) {
            navigate(`/link/${studentData.courseId}/${studentData.uniqueCode}`);
          }
          break;
        case "organization":
          if (user.organisation) {
            console.log("navigating to assessment dashboard....");
            navigate("/app/assessments", { replace: true });
          } else {
            console.log("navigating to kyc form....");
            navigate("/auth/kyc");
          }
          break;
        case "individual":
          if (user.organisation) {
            console.log("navigating to dashboard...");
            navigate("/app/assessments", { replace: true });
          } else {
            console.log("no organization. navigating to pricing page...");

            navigate("/auth/pricing");
          }
          break;
      }
    },
    onError: (error) => {
      let message = error?.message || "An error occurred";
      let code = 500;

      if (error instanceof AxiosError) {
        message = error.response?.data.message || "Server Unavailable";
        code = error.response?.status || 503;
      }

      toast.error(message);
      if (code === 401) {
        navigate(`/auth/sign-up`);
      }
    },
  });

  // Trigger mutation only when code is present
  useEffect(() => {
    if (code) mutation.mutate(code);
  }, [code]);

  return mutation;
}
