import { Skeleton } from "@/components/ui/skeleton";
import useStore from "@/state";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "semantic-ui-react";

interface SignInPromptProps {
  courseInfo: {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  uniqueCode: string | undefined;
  courseId: string | undefined;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({
  courseInfo,
  uniqueCode,
  courseId,
}) => {
  const [clicked, setClicked] = useState(false);
  const { setAccountType, setStudentData } = useStore();
  const { data: courseData, isLoading: courseIsLoading } = courseInfo;

  const { isLoading, isError, isSuccess, error, data, refetch } = useQuery({
    queryKey: ["Data"],
    queryFn: () => axios.get(`/auth/google`),
    enabled: clicked,
  });

  const handleSignIn = () => {
    setClicked(true);

    if (!uniqueCode || !courseId) {
      toast.error("Missing required info. Confirm link is correct");
      return;
    }

    // used in Assessments.tsx to know where to redirect to after google authentication is complete
    setAccountType("student");
    setStudentData({ uniqueCode, courseId });
  };

  useEffect(() => {
    if (isSuccess && data?.data?.success) {
      window.location.href = data.data.authorizationUrl;
    }
    if (isError) {
      toast.error(error?.message || "An error occurred. Please retry");
    }
  }, [data, isLoading, isSuccess, isError, error]);

  return (
    <>
      <div className="flex flex-row items-baseline justify-betwween gap-0.5">
        <p>Sign in to get started and get your grade</p>
        <span>
          {courseIsLoading && (
            <Skeleton className="w-[60px] h-[10px] rounded-sm" />
          )}
        </span>
        {courseData && (
          <>
            <p>for</p>
            <p className="text-green-500">{`${courseData?.category?.name}`}</p>
          </>
        )}
      </div>

      <Button
        className="w-[250px]"
        variant="primary"
        onClick={handleSignIn}
        disabled={isLoading}
      >
        {isLoading && <Loader2Icon className="animate-spin" />}
        Sign in
      </Button>
    </>
  );
};

export default SignInPrompt;
