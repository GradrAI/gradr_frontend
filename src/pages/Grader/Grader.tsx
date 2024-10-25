import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import initialUserState from "@/data/initialUserState";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Exam } from "@/types/Exam";
import { Student } from "@/types/Student";
import { Result } from "@/types/Result";

const Grader = () => {
  const queryClient = new QueryClient();

  const [currentUser, setCurrentUser] = useState(initialUserState);
  const [selectedExam, setSelectedExam] = useState("");
  const [tableData, setTableData] = useState<Student[] | []>([]);
  const [selectedRows, setSelectedRows] = useState<Exam[] | []>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    let parsedUser = initialUserState;
    if (user) parsedUser = JSON.parse(user);
    if (parsedUser) setCurrentUser(parsedUser);
  }, []);

  const {
    data: examData,
    isLoading: examIsLoading,
    isSuccess: examIsSuccess,
    isError: examIsError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () =>
      await axios.get(`/exams/users/${currentUser._id}/exams`),
    enabled: Boolean(currentUser?._id?.length),
  });

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["students"],
    queryFn: async () =>
      await axios.get<Student[]>(`/students?exam=${selectedExam}`),
    enabled: Boolean(selectedExam.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["results"],
    mutationFn: async (data) => await axios.post<Result[]>(`/results`, data),
  });

  const handleSelect = (selection: string) => {
    setSelectedExam(selection);
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  useEffect(() => {
    if (data?.data?.length) {
      setTableData(data.data);
    }
  }, [isSuccess, data]);

  const handleGrade = () => {
    if (!Boolean(selectedRows.length)) return;
    mutate(selectedRows);
  };

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      <h1 className="text-3xl">Grader</h1>

      {examIsLoading && <p>Fetching exams...</p>}

      {examIsError && <p>An error occurred.</p>}

      {Boolean(examData?.data?.length) && (
        <>
          <div className="w-full flex flex-wrap items-center justify-between">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {examData?.data?.map(({ examName }: { examName: string }) => (
                  <SelectItem value={examName}>{examName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button disabled>Export marks</Button>
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
                disabled={!Boolean(selectedRows.length)}
                onClick={handleGrade}
              >
                Grade
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Grader;
