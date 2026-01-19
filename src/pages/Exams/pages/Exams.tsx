import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExamData } from "../components/ExamForm";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { Exam, Option, Question } from "@/types/Exam";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Exams = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const { data: examData, isLoading } = useQuery({
    queryKey: ["exam"],
    queryFn: async () => await api.get(`/exam`),
  });

  const { data: deleteExamData, mutate: deleteExamMutate } = useMutation({
    mutationFn: async (examId: string) => await api.delete(`/exam/${examId}`),
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["exam"] });
    },
    onError: () => {
      toast.error("Failed to delete exam");
    },
  });

  const exams = examData?.data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);
  const [copiedExams, setCopiedExams] = useState<Record<string, boolean>>({});

  const openExam = (exam: Exam) => {
    setActiveExam(exam);
    setOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Exams</h1>
        <Button onClick={() => nav("create")}>Create</Button>
      </div>

      {isLoading && <Skeleton className="w-[400px] h-[150px] rounded-md" />}
      {!isLoading && exams.length === 0 && <p>No exams found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam: Exam) => (
          <Card key={exam._id} className="p-4">
            <CardHeader>
              <CardTitle>
                <div className="flex flex-row items-start justify-between">
                  <h1 className="text-lg m-0">{exam.topic}</h1>

                  <Badge
                    variant={
                      exam.status === "draft"
                        ? "destructive"
                        : exam.status === "archived"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {exam?.status}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                <div className="flex flex-row justify-between">
                  <div>
                    Difficulty:{" "}
                    <span className="font-semibold">{exam.difficulty}</span> •
                    Questions:{" "}
                    <span className="font-semibold">{exam.totalQuestions}</span>
                  </div>

                  {exam?.uniqueExamLink && (
                    <div
                      className="self-end"
                      key={copiedExams[exam._id] ? "checked" : "copy"}
                    >
                      {!copiedExams[exam._id] ? (
                        <Paperclip
                          onClick={() => {
                            navigator.clipboard.writeText(exam.uniqueExamLink!);
                            setCopiedExams((prev) => ({
                              ...prev,
                              [exam._id]: true,
                            }));
                            toast.success("Copied");
                            setTimeout(() => {
                              setCopiedExams((prev) => ({
                                ...prev,
                                [exam._id]: false,
                              }));
                            }, 2000);
                          }}
                          className="cursor-pointer hover:text-slate-400 border rounded-full"
                        />
                      ) : (
                        <CheckCircle className="pointer-events-none" />
                      )}
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {exam.createdAt
                    ? new Date(exam.createdAt).toLocaleDateString()
                    : "-"}
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="link" className="text-red-500">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteExamMutate(exam._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {exam.fileUri && (
                    <a
                      href={exam.fileUri}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline text-sm px-4"
                    >
                      PDF
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExam(exam)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{activeExam?.topic}</DialogTitle>
            <DialogDescription>
              Difficulty:{" "}
              <span className="font-semibold">{activeExam?.difficulty}</span> •
              Questions:{" "}
              <span className="font-semibold">
                {activeExam?.totalQuestions}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 overflow-y-scroll max-h-[70vh] md:max-h-[400px] p-2">
            <h3 className="font-medium">Questions</h3>
            <ol className="list-none space-y-4 mt-2">
              {activeExam?.questions?.map((q: Question, qIdx: number) => (
                <li key={q.id} className="flex gap-2">
                  <span className="font-medium">{qIdx + 1}.</span>
                  <div>
                    <div className="font-semibold">{q.question}</div>
                    {q?.description && (
                      <div className="text-sm text-slate-500">
                        {q.description}
                      </div>
                    )}

                    <ul className="md:pl-4 mt-2 text-sm">
                      {q?.options?.map((opt: Option, idx: number) => (
                        <li
                          key={`${q.id}-${opt.id}`}
                          className="flex gap-1 md:gap-2 items-start"
                        >
                          <span className="w-6 font-medium">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{opt.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              {activeExam?.fileUri ? (
                <a
                  href={activeExam.fileUri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  Download PDF
                </a>
              ) : (
                <div />
              )}
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exams;
