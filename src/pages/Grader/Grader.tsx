import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Exam } from "@/types/Exam";
import { Student } from "@/types/Student";
import { Result } from "@/types/Result";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { ErrorResponse } from "@/types/ErrorResponse";
import useStore from "@/state";

const postResults = async (data: Exam[]) =>
  await axios.post<Result[]>(`/results`, data);

const Grader = () => {
  const queryClient = new QueryClient();
  const { user, code } = useStore();

  const [selectedExam, setSelectedExam] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<Exam[]>([]);
  const [clicked, setClicked] = useState(false);
  const [sheetsObject, setSheetsObject] = useState<string[][]>([[""]]);
  const [sheetsUri, setSheetsUri] = useState("");
  const [exportButtonText, setExportButtonText] = useState(
    "Export to Google Sheets"
  );

  const createSheets = async () =>
    await axios.post(`/oauth2callback`, {
      code,
      sheetsObject,
    });

  const {
    data: examData,
    isLoading: examIsLoading,
    isSuccess: examIsSuccess,
    isError: examIsError,
    error: examError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const { data, isLoading, isSuccess, isError, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: async () =>
      await axios.get<Student[]>(`/students?exam=${selectedExam}`),
    enabled: Boolean(selectedExam.length),
  });

  const { isPending, mutate } = useMutation({
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
    queryFn: createSheets,
    enabled: Boolean(
      Boolean(code?.length) && Boolean(sheetsObject.length) && clicked
    ),
  });

  const handleSelect = (selection: string) => {
    setSelectedExam(selection);
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const handleExport = () => {
    setClicked(true);
  };

  useEffect(() => {
    if (exportData) {
      toast.success("Successfully exported data");
      setSheetsUri(exportData?.data?.data?.spreadsheetUrl);
    }
  }, [data]);

  useEffect(() => {
    if (exportIsLoading) setExportButtonText("Exporting...");
    if (exportIsError) {
      console.log("error: ", exportError);
      toast.error("An error occurred");
      setExportButtonText("Retry");
    }
  }, [exportIsLoading, exportIsError, exportError]);

  useEffect(() => {
    refetch();
  }, [selectedExam]);

  useEffect(() => {
    if (data?.data?.length) {
      const _tableData = data.data.map(({ _id, createdAt, exams }) => {
        return {
          _id,
          createdAt,
          exam: exams[0],
        };
      });
      setTableData(_tableData);

      const filteredExams = data.data.map(
        ({ exams }) => exams.filter(({ name }) => name === selectedExam)[0]
      );
      if (filteredExams?.length && filteredExams[0]?.result?.score) {
        const header = ["Student ID", "Grade"];
        const sheetsData = [header];
        console.log("filteredExams: ", filteredExams);
        filteredExams?.map(({ _id, result }) => {
          sheetsData.push([`${_id}`, `${result?.score}`]);
        });
        setSheetsObject(sheetsData);
      }
    }
  }, [isSuccess, data]);

  const handleGrade = () => {
    if (!Boolean(selectedRows.length)) return;
    mutate(selectedRows, {
      onSuccess: (data, variables, context) => {
        console.log("data: ", data);
        toast.success(notifications.GRADE.SUCCESS);
        queryClient.invalidateQueries({ queryKey: ["students"] });
      },
      onError: (error, variables, context) => {
        console.log("error", error);
        toast.error(notifications.GRADE.FAILURE);
      },
    });
  };

  return (
    <div className="w-full p-4 flex flex-col justify-between gap-2">
      {examIsLoading && <p className="text-2xl">Fetching uploads...</p>}
      {examIsError && (
        <p className="text-2xl text-red-500">
          {(examError as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}
      {Boolean(examData?.data?.length) && (
        <>
          <div className="w-full flex flex-wrap items-center justify-between">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {examData?.data?.map(
                  ({ examName, _id }: { examName: string; _id: string }) => (
                    <div key={_id}>
                      <SelectItem value={examName}>{examName}</SelectItem>
                    </div>
                  )
                )}
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
              <Button onClick={handleExport}>{exportButtonText}</Button>
            )}
          </div>

          {Boolean(tableData?.length) && (
            <>
              <DataTable<any, any>
                columns={columns}
                data={tableData}
                setSelectedRows={setSelectedRows}
              />

              <Button
                className="w-[180px]"
                disabled={!Boolean(selectedRows.length) || isPending}
                onClick={handleGrade}
              >
                {`Grad${isPending ? "ing..." : "e"}`}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Grader;
