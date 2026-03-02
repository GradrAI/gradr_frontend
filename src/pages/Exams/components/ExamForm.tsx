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

  const mutations = useMutationState({
    filters: { mutationKey },
  });

  const isGenerating = mutations.some((m) => m.status === "pending");
  const latestMutation = mutations.find((m) => m.status === "success");
  const latestData = latestMutation?.data as AxiosResponse | undefined;

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
        examId: latestData?.data?.data?.examId,
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
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20 w-full bg-white rounded-xl shadow-sm border border-slate-100">
          <Loader2Icon className="w-12 h-12 animate-spin text-primary mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating your quiz...</h2>
          <p className="text-slate-500 text-center max-w-md px-6">
            Our AI is analyzing your resources to craft high-quality questions. This usually takes 30-60 seconds.
          </p>
        </div>
      ) : latestData ? (
        <div>
          <div className="flex flex-col flex-wrap md:flex-row w-full gap-4 justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold m-0 text-slate-900">Generated Quiz Questions</h2>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {latestData?.data?.data?.question?.length || 0} Questions
            </div>
          </div>
          <div className="space-y-6">
            {latestData?.data?.data?.question?.map(
              (
                { id, question, description, options }: ExamData,
                index: number
              ) => (
                <div key={id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex justify-start items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{question}</h3>
                      {description && <p className="text-slate-600 mb-4">{description}</p>}
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options?.map(({ id: optionId, text }) => (
                          <li key={optionId} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-sm">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button
              className="px-8 h-12 text-base font-semibold"
              onClick={() => {
                if (latestData?.data?.data?.examId) {
                  publishExam();
                }
              }}
              disabled={publishExamIsPending || !latestData?.data?.data?.examId || publishExamData?.data?.data?.success}
            >
              {publishExamIsPending ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish Quiz"
              )}
            </Button>
            <p className="text-sm text-slate-500">
              Only published quizzes can be shared with students.
            </p>
          </div>

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
