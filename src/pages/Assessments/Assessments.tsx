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
import { GraduationCap, PenLine, AlertCircle } from "lucide-react";

const Assessments = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");

  // Handles token exchange, saving user, navigation
  const googleAuthMutation = useGoogleAuth(code);

  // 1. Fetch the active period for this organization
  const {
    data: activePeriod,
    isLoading: isPeriodLoading,
    isError: isPeriodError,
  } = useQuery({
    queryKey: ["activePeriod"],
    queryFn: async () => {
      const res = await api.get("/periods/active");
      return res.data.data;
    },
    enabled: !code,
  });

  // 2. Fetch courses scoped to the active period
  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
    isError: courseIsError,
    error: courseError,
  } = useQuery({
    queryKey: ["courses", activePeriod?._id],
    queryFn: async () => {
      const res = await api.get(`/courses/users?periodId=${activePeriod._id}`);
      return res.data.data;
    },
    enabled: !code && !!activePeriod?._id,
  });

  if (code || googleAuthMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Authenticating securely...</p>
      </div>
    );
  }

  // No active period configured
  if (isPeriodError) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in mt-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-100 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-50 dark:border-amber-900/50">
          <AlertCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          No Active Period
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
          You need to create and activate a period (e.g. "First Term") before you can manage assessments. Head to Settings to set up your academic cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      {/* Period indicator */}
      {activePeriod && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Period:</span>
          <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{activePeriod.name}</span>
        </div>
      )}

      {(courseIsLoading || isPeriodLoading) && (
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
          <div className="w-24 h-24 bg-gradient-to-tr from-brand-100 to-brand-secondary-100 dark:from-brand-900/20 dark:to-brand-secondary-900/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-50 dark:border-brand-900/30">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Welcome to GradrAI!
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
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
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 gap-2 shadow-sm">
                <GraduationCap size={20} />
                Generate Exam
              </Button>
            </Link>
          </div>
        </div>
      )}

      {courseIsSuccess && Boolean(courseData?.length) && (
        <DataTable columns={columns} data={courseData} />
      )}
    </div>
  );
};

export default Assessments;
