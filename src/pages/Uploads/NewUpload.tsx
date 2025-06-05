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
import axios, { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import useStore from "@/state";

type CourseData = {
  name: string;
  students: [];
  maxScoreAttainable: number;
  lecturerId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Category = {
  id: number;
  name: string;
  value: string;
};

const categories = [
  { id: 0, name: "Test", value: "test" },
  { id: 1, name: "Assignment", value: "assignment" },
  { id: 2, name: "Exam", value: "exam" },
];

const NewUpload = () => {
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [courses, setCourses] = useState<CourseData[]>([]);

  const [uploadData, setUploadData] = useState<Partial<UploadData>>({
    lecturerId: "",
    name: "",
    fileType: undefined,
    studentId: null,
    categoryName: undefined,
    categoryType: undefined,
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
    setUploadData({ ...uploadData, name: selection });
  };

  const handleSelectCategoryType = (selection: string) => {
    console.log("selection: ", selection);
    // Ensure selection is one of the allowed values
    const allowedCategories = ["test", "assignment", "exam"] as const;
    if (allowedCategories.includes(selection as any)) {
      setUploadData({
        ...uploadData,
        categoryType: selection as "test" | "assignment" | "exam",
      });
    }
  };

  const handleSelectFile = (selection: "guide" | "question" | "answers") => {
    setUploadData({ ...uploadData, fileType: selection });
  };

  useEffect(() => {
    //! TO-DO: reset file input to empty state when fileType changes
  }, [uploadData.fileType]);

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["courses", user?._id],
    queryFn: async () => await axios.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["courses"],
    mutationFn: async (data: any) => await axios.post(`/courses`, data),
  });

  useEffect(() => {
    if (isSuccess && data) setCourses(data.data);
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
        name: uploadData.name,
      },
      {
        onSuccess: (
          data: AxiosResponse<CourseData>,
          variables: any,
          context: any
        ) => {
          if (data?.status === 201) {
            toast.success("Added exam successfully");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setCourses((prev) => [...prev, data.data]);
            setAddNew(false);
            handleSelectExam(data.data.name);
          }
        },
        onError: (error: any, variables: any, context: any) => {
          console.log("error", error);
        },
      }
    );
  };

  return (
    <div className="p-8 flex flex-col gap-8 justify-between items-start w-full md:w-2/4">
      <h1>Upload resources.</h1>

      <Select
        onValueChange={handleSelectExam}
        name="exam"
        required
        value={uploadData.name}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select course" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {courses?.map(({ name, _id }: CourseData) => (
              <SelectItem key={_id} value={name}>
                {name}
              </SelectItem>
            ))}
            <SelectItem value="addNew">Add new</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
        <Input
          name="categoryName"
          placeholder="Category Name e.g. Assignment II"
          className="inline-block bg-white"
          value={uploadData.categoryName}
          onChange={handleChange}
          required
        />

        <Select
          onValueChange={handleSelectCategoryType}
          name="categoryType"
          required
          value={uploadData.categoryType}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories?.map(({ name, id, value }: Category) => (
                <SelectItem key={id} value={value}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Input
        name="maxScoreAttainable"
        placeholder="Maximum score attainable (e.g 60)"
        className="inline-block bg-white"
        value={uploadData.maxScoreAttainable}
        onChange={handleChange}
        required
      />

      <Select
        onValueChange={handleSelectFile}
        name="fileType"
        required
        disabled={isError || !data}
      >
        <SelectTrigger className="bg-white">
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
            <DialogTitle>Add course</DialogTitle>
            <DialogDescription>
              Input the name of the course you would like to create.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-wrap gap-2 items-center justify-between">
            <Input
              name="name"
              placeholder="Course name (e.g. CSC 101)"
              className="w-3/4 self-center mx-auto md:mx-0 inline-block"
              value={uploadData.name}
              onChange={handleChange}
              required
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddExam} disabled={isPending}>
              {isPending ? (
                <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewUpload;
