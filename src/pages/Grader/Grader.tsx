import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
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
import { normalizeGradingPayload } from "@/lib/normalizeGradingPayload";

const postResults = async (data: any) =>
  await axios.post<Result[]>(`/results`, data);

const Grader = () => {
  const nav = useNavigate();
  const queryClient = new QueryClient();
  const { user, code, token } = useStore();

  const [selectedSubRows, setSelectedSubRows] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [clicked, setClicked] = useState(false);
  const [sheetsObject, setSheetsObject] = useState<string[][]>([[""]]);
  const [sheetsUri, setSheetsUri] = useState("");
  const [exportButtonText, setExportButtonText] = useState(
    "Export to Google Sheets"
  );
  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
    isError: courseIsError,
    error: courseError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => await api.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const { data, isLoading, isSuccess, isError, refetch } = useQuery({
    queryKey: ["singleCourse"],
    queryFn: async () =>
      await api.get<any>(`/courses/${selectedExam}/students-by-category`),
    enabled: Boolean(selectedExam),
  });

  const { isPending: gradeIsPending, mutate } = useMutation({
    mutationKey: ["results"],
    mutationFn: postResults,
  });

  const {
    isLoading: exportIsLoading,
    isError: exportIsError,
    error: exportError,
    data: exportData,
  } = useQuery({
    queryKey: ["exportData"],
    queryFn: async () =>
      await axios.post(`/oauth2callback`, {
        code,
        sheetsObject,
      }),
    enabled: Boolean(sheetsObject.length) && clicked && Boolean(token?.length),
    retry: false,
  });

  const handleSelect = (selection: string) => {
    setSelectedExam(selection);
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const handleExport = () => {
    setClicked(true);
  };

  console.log("selectedSubRows: ", selectedSubRows);

  useEffect(() => {
    if (exportData) {
      toast.success("Successfully exported data");
      setSheetsUri(exportData?.data?.data?.spreadsheetUrl);
    }
  }, [exportData]);

  useEffect(() => {
    if (exportIsLoading) setExportButtonText("Exporting...");
    if (exportIsError) {
      if ((exportError as AxiosError<ErrorResponse>)?.response?.data?.message) {
        const message = (exportError as AxiosError<ErrorResponse>)?.response
          ?.data?.message;

        toast.error(message || "An error occurred");
        if (message === "Unauthorized") nav("/app");
      } else {
        toast.error("An error occurred");
      }
      setExportButtonText("Retry");
    }
  }, [exportIsLoading, exportIsError, exportError]);

  useEffect(() => {
    refetch();
  }, [selectedExam]);

  useEffect(() => {
    console.log("data: ", data);
    // if (data?.data?.length) {
    // const _tableData = data.data.map(({ _id, createdAt, exams }) => {
    //   return {
    //     _id,
    //     createdAt,
    //     exam: exams[0],
    //   };
    // });
    // setTableData(_tableData);
    // const filteredExams = data.data.map(
    //   ({ exams }) => exams.filter(({ name }) => name === selectedExam)[0]
    // );
    // if (filteredExams?.length && filteredExams[0]?.result?.score) {
    //   const header = ["Student ID", "Grade"];
    //   const sheetsData = [header];
    //   console.log("filteredExams: ", filteredExams);
    //   filteredExams?.map(({ _id, result }) => {
    //     sheetsData.push([`${_id}`, `${result?.score}`]);
    //   });
    //   setSheetsObject(sheetsData);
    // }
    // }
  }, [isSuccess, data]);

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

    //! TO-DO: first check if user hasn't passed limit based on their payment plan

    mutate(
      { resultData: normalizedResultData, courseData: {} }, //! TO-DO: pass courseData: { maxScoreAttainable, guide, question } to reduce work done at the backend
      {
        onSuccess: (data: any, variables: any, context: any) => {
          console.log("data: ", data);
          toast.success(notifications.GRADE.SUCCESS);
          queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (error: any, variables: any, context: any) => {
          console.log("error", error);
          toast.error(notifications.GRADE.FAILURE);
        },
      }
    );
  };

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
      {Boolean(courseData?.data?.length) && (
        <>
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courseData?.data?.map(({ name, _id }: Course) => (
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
                  setClicked(false);
                  window.open(sheetsUri, "_blank", "noopener,noreferrer");
                }}
              >
                View Sheets
              </p>
            ) : (
              <Button
                onClick={handleExport}
                disabled={!Boolean(selectedExam?.length)}
              >
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

          {data && Boolean(Object.keys(data)?.length) && (
            <>
              <DataTable<Partial<any>, any>
                columns={columns}
                data={data?.data?.data?.categories}
                setSelectedRows={setSelectedRows}
                setSelectedSubRows={setSelectedSubRows}
                getSubRows={(row: Partial<Category>) => row?.students ?? []}
              />

              <Button
                className="w-[180px]"
                disabled={!Boolean(selectedSubRows.length) || gradeIsPending}
                onClick={handleGrade}
              >
                {gradeIsPending ? (
                  <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
                ) : (
                  "Grade"
                )}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Grader;
