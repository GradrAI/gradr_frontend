import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadForm from "@/components/UploadForm";
import { useEffect, useState } from "react";
import { UploadData } from "@/types/UploadData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import initialUserState from "@/data/initialUserState";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import useStore from "@/state";

const NewUpload = () => {
  const queryClient = useQueryClient();
  const { user } = useStore();

  const [uploadData, setUploadData] = useState<Partial<UploadData>>({
    lecturerId: "",
    examName: "",
    fileType: undefined,
  });
  const [addNew, setAddNew] = useState(false);

  useEffect(() => {
    if (user?._id) {
      setUploadData({ ...uploadData, lecturerId: user._id });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUploadData({ ...uploadData, [name]: value });
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
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["exams"],
    mutationFn: async (data: any) => await axios.post(`/exams`, data),
  });

  useEffect(() => {
    if (!data) console.log("No exam record for current user");
  }, [data]);

  const handleAddExam = () => {
    if (!user?._id?.length) {
      toast.error(notifications.EXAM.FAILURE);
      return;
    }
    mutate(
      {
        lecturerId: user?._id,
        examName: uploadData.examName,
        maxScoreAttainable: uploadData.maxScoreAttainable,
      },
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

      <Dialog open={addNew} onOpenChange={setAddNew}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add exam</DialogTitle>
            <DialogDescription>
              Input the name of the exam and the maximum attaintable score for
              that exam.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-wrap gap-2 items-center justify-between">
            <Input
              name="examName"
              placeholder="Exam name (e.g. CSC 101)"
              className="w-3/4 inline-block"
              value={uploadData.examName}
              onChange={handleChange}
              required
            />
            <Input
              name="maxScoreAttainable"
              placeholder="Maximum score attainable (e.g 60)"
              className="w-3/4 inline-block"
              value={uploadData.maxScoreAttainable}
              onChange={handleChange}
              required
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddExam} disabled={isPending}>
              {`Add${isPending ? "ing..." : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewUpload;
