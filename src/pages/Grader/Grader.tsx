import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/Course";
import { Result } from "@/types/Result";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { ErrorResponse } from "@/types/ErrorResponse";
import useStore from "@/state";
import { useNavigate } from "react-router-dom";
import { Category } from "@/types/Category";
import { DataTable } from "./data-table";
import api from "@/lib/axios";
import { Loader2Icon } from "lucide-react";

const postResults = async (data: any) =>
  await api.post<Result[]>(`/results`, data);
//! TODO: replace LLM endpoint call with Agentic endpoint

const Grader = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { user, saveUser } = useStore();

  const [selectedSubRows, setSelectedSubRows] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sheetsObject, setSheetsObject] = useState<string[][]>([[""]]);
  const [sheetsUri, setSheetsUri] = useState("");
  const [exportButtonText, setExportButtonText] = useState(
    "Export to Google Sheets"
  );
  // Fetch active period
  const { data: activePeriodData } = useQuery({
    queryKey: ["activePeriod"],
    queryFn: async () => {
      const res = await api.get("/periods/active");
      return res.data.data;
    },
  });

  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
    isError: courseIsError,
    error: courseError,
  } = useQuery({
    queryKey: ["courses", activePeriodData?._id],
    queryFn: async () => {
      const res = await api.get(`/courses/users?periodId=${activePeriodData._id}`);
      return res.data.data;
    },
    enabled: Boolean(user?._id?.length) && !!activePeriodData?._id,
  });

  const { data, isLoading, isSuccess, isError, refetch } = useQuery({
    queryKey: ["singleCourse", selectedCourse],
    queryFn: async () =>
      await api.get<any>(`/courses/${selectedCourse}/students-by-category`),
    enabled: Boolean(selectedCourse?.length),
  });

  const { isPending: gradeIsPending, mutate } = useMutation({
    mutationKey: ["results"],
    mutationFn: postResults,
  });

  const { isPending: exportIsPending, mutate: exportMutate } = useMutation({
    mutationKey: ["exportData"],
    mutationFn: async (payload: string[][]) => {
      const res = await api.post(`/oauth2callback`, {
        sheetsObject: payload,
        metadata: {
          courseId: selectedCourse,
          categoryId: selectedRows[0]?._id,
        },
      });
      return res.data;
    },
    retry: false,
  });

  const handleSelect = (selection: string) => {
    setSelectedCourse(selection);
    queryClient.invalidateQueries({ queryKey: ["singleCourse", selectedCourse] });
  };

  const handleExport = () => {
    if (
      sheetsObject.length <= 1 ||
      !sheetsObject.slice(1).some((row) => row.length > 0)
    ) {
      toast.error("An error occurred while generating sheet data");
      return;
    }

    exportMutate(sheetsObject, {
      onSuccess: (data: any, variables: any, context: any) => {
        toast.success("Successfully exported data");
        setSheetsUri(data?.data?.spreadsheetUrl);
      },
      onError: (error: any, variables: any, context: any) => {
        toast.error("An error occurred");
        setExportButtonText("Retry");
      },
    });
  };

  // Removed manual refetch to prevent bypassing 'enabled' check

  useEffect(() => {
    if (!selectedRows?.length) return;

    const header = ["Student ID", "Grade"];
    const sheetsData: string[][] = [header];

    selectedRows.forEach((category: Category) => {
      category.students?.forEach((item: any) => {
        const studentId =
          item?.student?.studentId || item?.studentId || "N/A";
        const score = item?.result?.score || item?.score || "N/A";
        sheetsData.push([String(studentId), String(score)]);
      });
    });

    setSheetsObject(sheetsData);
  }, [selectedRows]);

  const handleGrade = () => {
    // if (!Boolean(selectedRows.length)) return;
    if (!Boolean(selectedSubRows.length)) return;

    // Normalize the payload to ensure consistent format
    const normalizedResultData = selectedSubRows.map((item) => ({
      student: {
        studentId:
          typeof item.student === "string"
            ? item.student
            : item.student?.studentId || item.student?._id,
        _id:
          typeof item.student === "string"
            ? item.student
            : item.student?._id || item.student?.studentId,
      },
      fileUrl: item.fileUrl,
      resourceId: item.resourceId,
      result: item.result || null,
    }));

    //! TODO: first check if user hasn't passed limit based on their payment plan

    mutate(
      { resultData: normalizedResultData },
      {
        onSuccess: (response: any) => {
          if (response.status === 202) {
            toast.success(notifications.GRADE.QUEUED);
          } else {
            toast.success(notifications.GRADE.SUCCESS);
          }
          queryClient.invalidateQueries({ queryKey: ["students"] });
          queryClient.invalidateQueries({ queryKey: ["singleCourse"] });
          
          // Optimistically deduct credits from local store
          if (user && user.organization && typeof user.organization === "object") {
             const planName = user.organization.paymentPlan?.name?.toLowerCase();
             if (planName !== "enterprise") {
               user.organization.creditsBalance = Math.max(0, (user.organization.creditsBalance || 0) - normalizedResultData.length);
             }
             saveUser({...user});
          }
        },
        onError: (error: any, variables: any, context: any) => {
          toast.error(error?.response?.data?.message || notifications.GRADE.FAILURE);
        },
      }
    );
  };

  const org = user?.organization;
  const isEnterprise = typeof org === "object" && org?.paymentPlan?.name?.toLowerCase() === "enterprise";
  const remainingCredits = typeof org === "object" ? (org?.creditsBalance || 0) : 0;
  const requiredCredits = selectedSubRows.length; // 1 credit per script

  const isOverLimit = !isEnterprise && requiredCredits > remainingCredits + 5;

  return (
    <div className="w-full p-4 flex flex-col justify-between gap-2">
      {courseIsLoading && (
        <div className="flex items-center justify-between">
          <Skeleton className="w-[200px] h-[35px] rounded-md" />
          <Skeleton className="w-[200px] h-[35px] rounded-md" />
        </div>
      )}
      {courseIsError && (
        <p className="text-2xl text-red-500">
          Unable to fetch courses for user
        </p>
      )}
      {Boolean(courseData?.length) && (
        <>
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courseData?.map(({ name, _id }: Course) => (
                  <div key={_id}>
                    <SelectItem value={_id}>{name}</SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>

            {sheetsUri?.length ? (
              <p
                className="text-blue-500 cursor-pointer"
                onClick={() => {
                  window.open(sheetsUri, "_blank", "noopener,noreferrer");
                }}
              >
                View Sheets
              </p>
            ) : (
              <Button
                onClick={handleExport}
                disabled={
                  !Boolean(selectedCourse?.length) ||
                  selectedRows?.length > 1 ||
                  exportIsPending
                }
                className={`${!Boolean(selectedCourse?.length) || selectedRows?.length > 1} ? 'cursor-not-allowed' : 'cursor-pointer'`}
              >
                {exportIsPending && <Loader2Icon className="animate-spin" />}
                {exportButtonText}
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col justify-between gap-8">
              <div className="flex items-center justify-between">
                <Skeleton className="w-[300px] h-[35px] rounded-md" />
                <Skeleton className="w-[200px] h-[35px] rounded-md" />
              </div>

              <Skeleton className="w-full h-[200px] rounded-md" />

              <div className="flex items-center justify-between self-end gap-6">
                <Skeleton className="w-[50px] h-[35px] rounded-md" />
                <Skeleton className="w-[50px] h-[35px] rounded-md" />
              </div>

              <Skeleton className="w-[200px] h-[40px] rounded-md self-start" />
            </div>
          )}

          {data && Boolean(Object.keys(data?.data?.data ?? {})?.length) && (
            <>
              <DataTable<Partial<any>, any>
                columns={columns}
                data={data?.data?.data?.categories}
                setSelectedRows={setSelectedRows}
                setSelectedSubRows={setSelectedSubRows}
                getSubRows={(row: Partial<Category>) => row?.students ?? []}
              />

              <div className="flex flex-col md:flex-row justify-between items-center bg-muted/50 dark:bg-zinc-900/50 p-4 rounded-lg border border-border">
                <div className="text-sm">
                  {isEnterprise ? (
                    <p className="text-muted-foreground">
                      Grading Quota: Unlimited (Enterprise)
                    </p>
                  ) : remainingCredits >= requiredCredits ? (
                    <p className="text-muted-foreground">
                      Credit Balance: {remainingCredits} credits available
                    </p>
                  ) : remainingCredits >= requiredCredits - 5 ? (
                    <div>
                      <p className="text-amber-600 dark:text-amber-500 font-semibold">
                        Credit Balance: {remainingCredits} credits available
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        You can use up to 5 grace credits; top up immediately after this batch if your balance goes negative.
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-500 font-semibold">
                      Your credit balance is exhausted. Please top up to grade scripts.
                    </p>
                  )}
                  {isOverLimit && (
                     <p className="text-xs text-red-500 mt-1">
                        You are trying to grade {requiredCredits} scripts, but only have {remainingCredits} credits.
                     </p>
                  )}
                </div>
                
                <Button
                  className="w-[180px] mt-4 md:mt-0"
                  disabled={!Boolean(selectedSubRows?.length) || gradeIsPending || isOverLimit}
                  onClick={handleGrade}
                >
                  {gradeIsPending ? (
                    <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
                  ) : (
                    "Grade"
                  )}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Grader;
