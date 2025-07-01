import { ErrorResponse } from "@/types/ErrorResponse";
import { useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Assessments = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");

  // Handles token exchange, saving user, navigation
  useGoogleAuth(code);

  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
    isError: courseIsError,
    error: courseError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => await api.get(`/courses/users`),
  });

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      {courseIsLoading && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Skeleton className="w-[200px] h-[50px] rounded-md" />
            <Skeleton className="w-[100px] h-[50px] rounded-md" />
          </div>
          <Skeleton className="w-full h-[300px] rounded-md" />
        </div>
      )}

      {courseIsError && (
        <p className="text-2xl text-red-500">
          {(courseError as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {courseIsSuccess && Boolean(courseData?.data?.length) && (
        <DataTable columns={columns} data={courseData.data} />
      )}
    </div>
  );
};

export default Assessments;
