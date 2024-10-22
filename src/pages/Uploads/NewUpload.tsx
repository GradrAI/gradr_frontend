import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadForm from "@/components/UploadForm";
import { useEffect, useState } from "react";
import { UploadData } from "@/types/UploadData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import initialUserState from "@/data/initialUserState";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const NewUpload = () => {
  const queryClient = useQueryClient();

  const [uploadData, setUploadData] = useState<Partial<UploadData>>({
    user: "",
    examName: "",
    fileType: undefined,
  });
  const [addNew, setAddNew] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let parsedUser = initialUserState;
    const user = localStorage.getItem("user");
    if (user) parsedUser = JSON.parse(user);
    if (parsedUser && parsedUser._id) {
      setUserId(parsedUser._id);
      setUploadData({ ...uploadData, user: parsedUser._id });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUploadData({ ...uploadData, examName: value });
  };

  const handleSelectExam = (selection: string) => {
    if (selection === "addNew") {
      setAddNew(true);
      return;
    }
    setUploadData({ ...uploadData, examName: selection });
  };

  const handleSelectFile = (selection: "guide" | "question" | "answers") => {
    setUploadData({ ...uploadData, fileType: selection });
  };

  useEffect(() => {
    //! TO-DO: reset file input to empty state when fileType changes
  }, [uploadData.fileType]);

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users/${userId}/exams`),
    enabled: Boolean(userId.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["exams"],
    mutationFn: async (data: any) => await axios.post(`/exams`, data),
  });

  useEffect(() => {
    if (!data) console.log("No exam record for current user");
  }, [data]);

  const handleAddExam = () => {
    if (!userId?.length) {
      toast.error("Unable to add exam");
      return;
    }
    mutate(
      { user: userId, examName: uploadData.examName },
      {
        onSuccess: (data, variables, context) => {
          const { status, statusText } = data;
          if (status === 201) {
            toast.success("Added exam successfully");
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            setAddNew(false);
          }
        },
        onError: (error, variables, context) => {
          console.log("error", error);
        },
      }
    );
  };

  return (
    <div className="p-8 flex flex-col gap-8 justify-between items-start w-full md:w-2/4">
      <h1>Upload resources.</h1>
      {addNew ? (
        <div className="w-full flex flex-wrap gap-2 items-center justify-between">
          <Input
            name="examName"
            placeholder="Exam name (e.g. CSC 101)"
            className="w-3/4 inline-block"
            value={uploadData.examName}
            onChange={handleChange}
          />
          <Button
            variant="outline"
            onClick={handleAddExam}
            disabled={isPending}
          >
            {`Add${isPending ? "ing..." : ""}`}
          </Button>
        </div>
      ) : (
        <Select onValueChange={handleSelectExam} name="exam" required>
          <SelectTrigger className="">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {data?.data?.map(({ examName }: { examName: string }) => (
                <SelectItem value={examName}>{examName}</SelectItem>
              ))}
              <SelectItem value="addNew">Add new</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      <Select
        onValueChange={handleSelectFile}
        name="fileType"
        required
        disabled={isError || !data}
      >
        <SelectTrigger className="">
          <SelectValue placeholder="Select file type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="guide">Marking Guide</SelectItem>
            <SelectItem value="question">Exam question</SelectItem>
            <SelectItem value="answers">Student Answers</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <UploadForm uploadData={uploadData} />
    </div>
  );
};

export default NewUpload;
