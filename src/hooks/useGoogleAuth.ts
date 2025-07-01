import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useStore from "@/state";
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
      const res = await axios.get<GoogleAuthResponse>(
        `/getGoogleUser?code=${code}`
      );
      return res.data;
    },
    onSuccess: ({ data: { token, user } }) => {
      localStorage.setItem("token", token);
      saveUser(user);
      if (code) setCode(code);

      // Navigation logic directly after storing user
      switch (accountType) {
        case "student":
          if (studentData?.courseId && studentData?.uniqueCode) {
            navigate(`/link/${studentData.courseId}/${studentData.uniqueCode}`);
          }
          break;
        case "organization":
          if (user.organization)
            navigate("/app/assessments", { replace: true });
          else navigate("/auth/kyc");
          break;
        case "individual":
          navigate("/app/assessments", { replace: true });
          break;
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
