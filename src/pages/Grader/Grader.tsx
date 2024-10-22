import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import initialUserState from "@/data/initialUserState";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

const Grader = () => {
  const [currentUser, setCurrentUser] = useState(initialUserState);
  const [selectedExam, setSelectedExam] = useState("");
  const [tableData, setTableData] = useState([]);

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
    queryFn: async () => await axios.get(`/students?exam=${selectedExam}`),
    enabled: Boolean(selectedExam.length),
  });

  const handleSelect = (selection: string) => {
    setSelectedExam(selection);
  };

  useEffect(() => {
    if (data?.data?.length) {
      setTableData(data.data);
    }
  }, [isSuccess, data]);

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      <h1 className="text-3xl">Grader</h1>

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
            <DataTable columns={columns} data={tableData} />
          )}
        </>
      )}
    </div>
  );
};

export default Grader;
