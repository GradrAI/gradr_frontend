import { ErrorResponse } from "@/types/ErrorResponse";
import { useSearchParams, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, PenLine } from "lucide-react";

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

      {courseIsError && ((courseError as AxiosError<ErrorResponse>)?.response?.data?.error) !== "No course for user" && (
        <p className="text-2xl text-brand-danger-500">
          {(courseError as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {courseIsError && ((courseError as AxiosError<ErrorResponse>)?.response?.data?.error) === "No course for user" && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in mt-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-brand-100 to-brand-secondary-100 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-50">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Welcome to GradrAI!
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
            You don't have any assessments yet. Get started by grading your test papers or generating a brand new exam with AI!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/app/uploads">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md">
                <PenLine size={20} />
                Grade Papers
              </Button>
            </Link>
            <Link to="/app/exams">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-brand-200 text-brand-700 hover:bg-brand-50 gap-2 shadow-sm">
                <GraduationCap size={20} />
                Generate Exam
              </Button>
            </Link>
          </div>
        </div>
      )}

      {courseIsSuccess && Boolean(courseData?.data?.length) && (
        <DataTable columns={columns} data={courseData.data} />
      )}
    </div>
  );
};

export default Assessments;
