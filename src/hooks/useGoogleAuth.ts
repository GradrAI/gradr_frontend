import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useStore from "@/state";
import { type User } from "@/types/User";
import { type Response } from "@/types/Response";
import { type ICallback } from "@/types/ICallback";

export function useGoogleAuth(code: string | null) {
  const navigate = useNavigate();
  const { accountType, studentData, saveUser, setCode } = useStore();

  const mutation = useMutation({
    mutationKey: ["profileData"],
    mutationFn: async (code: string) => {
      const res = await axios.post<Response<ICallback>>(`/auth/callback`, {
        code,
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log("data: ", data);
      if (data.data?.access_token && data.data?.user) {
        const {
          data: { access_token, user },
        } = data;

        localStorage.setItem("token", access_token);
        saveUser(user);

        if (code) setCode(code);
        // Navigation logic directly after storing user
        switch (accountType) {
          case "student":
            if (studentData?.courseId && studentData?.uniqueCode) {
              navigate(
                `/link/${studentData.courseId}/${studentData.uniqueCode}`
              );
            }
            break;
          case "organization":
            if (user.organization) {
              console.log("navigating to assessment dashboard....");
              navigate("/app/assessments", { replace: true });
            } else {
              console.log("navigating to kyc form....");
              navigate("/auth/kyc");
            }
            break;
          case "individual":
            if (user.organization) {
              console.log("navigating to dashboard...");
              navigate("/app/assessments", { replace: true });
            } else {
              console.log("no organization. navigating to pricing page...");

              navigate("/auth/pricing");
            }
            break;
        }
      }
    },
    onError: (err: any) => {
      console.error("Google auth failed:", err);
    },
  });

  // Trigger mutation only when code is present
  useEffect(() => {
    if (code) mutation.mutate(code);
  }, [code]);

  return mutation;
}
