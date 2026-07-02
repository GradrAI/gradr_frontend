import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/User";
import { Result } from "@/types/Result";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Resource } from "@/types/Resource";
import notifications from "@/requests/notifications";
import { Loader2Icon } from "lucide-react";
import api from "@/lib/axios";

interface StudentGradeProps {
  courseInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  resourceInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  userInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  user: User | null;
  matricNo: string;
  uniqueCode?: string;
}

const StudentGrade: React.FC<StudentGradeProps> = ({
  courseInfo,
  resourceInfo,
  user,
  userInfo,
  matricNo,
  uniqueCode,
}) => {
  const queryClient = useQueryClient();
  const { data: courseData, isSuccess: courseIsSuccess } = courseInfo;

  // for grading
  const {
    isPending: postResultsIsPending,
    isError: postResultsIsError,
    error: postResultsError,
    mutate: postResultsMutate,
  } = useMutation({
    mutationKey: ["postResults"],
    mutationFn: async (data: any) => await api.post<Result[]>(`/results`, data),
  });

  useEffect(() => {
    if (postResultsIsError) {
      toast.error("An error occurred while grading");
    }
  }, [postResultsIsError, postResultsError]);

  const handleGrade = () => {
    if (resourceInfo?.data && user?._id) {
      // Normalize the student data format to match the standardized structure
      const normalizedResultData = [
        {
          student: {
            studentId: userInfo?.data?.studentId || matricNo,
            _id: user._id,
          },
          fileUrl: resourceInfo?.data?.fileUrl,
          resourceId: resourceInfo?.data?._id,
          result: null,
        },
      ];

      postResultsMutate(
        {
          resultData: normalizedResultData,
        },
        {
          onSuccess: (data: any, variables: any, context: any) => {
            toast.success(notifications.GRADE.SUCCESS);
            queryClient.invalidateQueries({
              queryKey: ["results", courseData?.course._id, uniqueCode],
            });
            window.location.reload();
          },
          onError: (error: any, variables: any, context: any) => {
            toast.error(notifications.GRADE.FAILURE);
          },
        }
      );
    }
  };

  return (
    <Button
      onClick={handleGrade}
      type="button"
      // disabled={postResultsIsPending} //disables while fetching previous student record for this exam and while grading
      className="w-[250px]"
    >
      {postResultsIsPending && <Loader2Icon className="animate-spin" />}
      Grade
    </Button>
  );
};

export default StudentGrade;
