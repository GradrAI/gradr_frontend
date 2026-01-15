import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useStore from "@/state";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Please sign in to proceed with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            {courseIsLoading ? (
              <Skeleton className="w-32 h-6 mx-auto" />
            ) : (
              courseData && (
                <p className="text-lg font-semibold text-green-600">
                  {courseData?.category?.name}
                </p>
              )
            )}
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPrompt;
