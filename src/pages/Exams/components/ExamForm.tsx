import { CheckCircle, Loader2Icon, Paperclip } from "lucide-react";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { useEffect, useState } from "react";
import { CourseData } from "@/types/CourseData";
import { AxiosResponse } from "axios";
import useStore from "@/state";
import { useNavigate } from "react-router-dom";

import ExamUploadForm from "./ExamUploadForm";

export interface ExamData {
  id: string;
  question: string;
  description: string;
  options: { id: string; text: string }[];
}

export default function ExamForm() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [addNew, setAddNew] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  // modal states
  const [open, setOpen] = useState(false);

  const mutationKey = ["generateQuiz"];

  const examData = useMutationState({
    filters: { mutationKey },
    select: (mutation) => mutation.state.data,
  });

  console.log("examData: ", examData);

  const { mutate: courseMutate } = useMutation({
    mutationKey: ["courses"],
    mutationFn: async (data: any) => await api.post(`/courses`, data),
  });

  const {
    data: publishExamData,
    mutate: publishExam,
    isPending: publishExamIsPending,
  } = useMutation({
    mutationKey: ["publishExam"],
    mutationFn: async () =>
      await api.post("/exam/publish", {
        examId: examData?.data?.data?.examId,
      }),
    onMutate: () => toast.success(`Publishing exam...`),
    onSuccess: () => setOpen(true),
    onError: (err: any) =>
      toast.error(err?.message || "Unable to publish exam"),
  });

  // useEffect(() => {
  //   if (coursesIsSuccess && coursesData) setCourses(coursesData.data);
  //   if (!coursesData) console.log("No exam record for current user");
  // }, [coursesIsSuccess, coursesData]);

  const handleAddCourse = () => {
    if (!user?._id?.length) {
      toast.error(notifications.EXAM.FAILURE);
      return;
    }
    courseMutate(
      {
        lecturerId: user?._id,
        name: courseName,
      },
      {
        onSuccess: (
          data: AxiosResponse<CourseData>,
          variables: any,
          context: any
        ) => {
          if (data?.status === 201) {
            toast.success("Added course successfully");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setAddNew(false);
            setCourseName("");
          }
        },
        onError: (error: any, variables: any, context: any) => {
          console.log("error", error);
        },
      }
    );
  };

  return (
    <>
      {examData?.length ? (
        <div>
          <div className="flex flex-col flex-wrap md:flex-row w-full gap-4 justify-between items-start md:items-center mb-4">
            <h2 className="text-2xl font-bold m-0">Generated Quiz Questions</h2>
          </div>
          {examData?.data?.question?.map(
            (
              { id, question, description, options }: ExamData,
              index: number
            ) => (
              <div key={id} className="mb-6">
                <div className="flex justify-start items-start gap-2">
                  <span className="font-bold">Q{index + 1}.</span>
                  <h3 className="m-0">{question}</h3>
                </div>
                <p>{description}</p>
                <ol className="list-disc list-inside">
                  {options.map(({ id, text }) => (
                    <li key={id}>{text}</li>
                  ))}
                </ol>
              </div>
            )
          )}

          <Button
            className="w-[250px]"
            onClick={() => {
              if (examData?.data?.data?.examId) {
                publishExam();
              }
            }}
            disabled={publishExamIsPending}
          >
            {publishExamIsPending && <Loader2Icon className="animate-spin" />}
            Publish
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-start">Quiz Link</DialogTitle>
                <DialogDescription className="text-start">
                  Copy the link and share with your students.
                </DialogDescription>
              </DialogHeader>
              {publishExamData && (
                <div className="flex flex-col items-center justify-between gap-4">
                  <p className="break-all max-w-full text-sm text-start">
                    {publishExamData?.data?.data?.uploadLink}
                  </p>
                  <div
                    className="self-end"
                    key={changeClipboardIcon ? "checked" : "copy"}
                  >
                    {!changeClipboardIcon ? (
                      <Paperclip
                        onClick={() => {
                          navigator.clipboard.writeText(
                            publishExamData?.data?.data?.uploadLink
                          );
                          setChangeClipboardIcon(true);
                          toast.success("Copied");
                        }}
                        className="cursor-pointer hover:text-slate-400 border rounded-full"
                      />
                    ) : (
                      <CheckCircle className="pointer-events-none" />
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex w-full max-w-lg flex-col gap-6">
          <Button className="w-[100px] self-end" onClick={() => nav(-1)}>
            Back
          </Button>

          <ExamUploadForm setAddNew={setAddNew} />

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
                  required
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddCourse} type="button">
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
