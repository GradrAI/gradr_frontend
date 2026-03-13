import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useStore from "@/state";
import api from "@/lib/axios";
import { User } from "@/types/User";

type GoogleAuthResponse = {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
};

export function useGoogleAuth(code: string | null) {
  const navigate = useNavigate();
  const { accountType, studentData, saveUser, setCode } = useStore();

  const mutation = useMutation<GoogleAuthResponse, Error, string>({
    mutationKey: ["profileData"],
    mutationFn: async (code: string) => {
      const res = await api.get<GoogleAuthResponse>(
        `getGoogleUser?code=${code}&accountType=${accountType}`
      );
      return res.data;
    },
    onSuccess: (response) => {
      const { data: { token, user, needsPassword, needsKYC, needsPayment } } = response as any;

      localStorage.setItem("token", token);
      saveUser(user);
      if (code) setCode(code);
      
      if (user?.role === "student") {
        if (studentData?.courseId && studentData?.uniqueCode) {
          navigate(`/student/quiz`, {
            state: {
              courseId: studentData.courseId,
              uniqueCode: studentData.uniqueCode
            }
          });
        } else {
          navigate("/student/dashboard");
        }
        return;
      }

      // Handle Admin/Lecturer onboarding
      if (needsPassword) {
        navigate("/auth/set-password");
      } else if (needsKYC) {
        navigate("/auth/kyc");
      } else if (needsPayment) {
        navigate("/auth/pricing");
      } else {
        navigate("/app/assessments", { replace: true });
      }
    },
    onError: (err: any) => {
      console.error("Google auth mutation failed:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
      }
    },
  });

  // Trigger mutation only when code is present
  useEffect(() => {
    if (code) mutation.mutate(code);
  }, [code]);

  return mutation;
}
