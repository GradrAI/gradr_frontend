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
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Copy, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { ExamSummary, Option, Question } from "@/types/Exam";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getExam, listExams } from "@/requests/exam";

const Exams = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const { data: examData, isLoading } = useQuery({
    queryKey: ["exam"],
    queryFn: listExams,
  });

  const { mutate: deleteExamMutate } = useMutation({
    mutationFn: async (examId: string) => await api.delete(`/exam/${examId}`),
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["exam"] });
    },
    onError: () => {
      toast.error("Failed to delete exam");
    },
  });

  const exams = examData?.data ?? [];

  const [open, setOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<ExamSummary | null>(null);
  const [copiedExams, setCopiedExams] = useState<Record<string, boolean>>({});

  const {
    data: activeExamDetail,
    isLoading: isExamDetailLoading,
    isError: isExamDetailError,
  } = useQuery({
    queryKey: ["exam", activeExam?._id],
    queryFn: () => getExam(activeExam!._id),
    enabled: open && Boolean(activeExam?._id),
  });

  const openExam = (exam: ExamSummary) => {
    setActiveExam(exam);
    setOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Exams</h1>
        <Button onClick={() => nav("create")}>Create</Button>
      </div>

      {isLoading && <Skeleton className="w-full max-w-sm h-[150px] rounded-md" />}
      {!isLoading && exams.length === 0 && <p>No exams found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam: ExamSummary) => (
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
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-200">
                      <span className="font-mono uppercase">ID: {exam._id}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copy exam cloud ID"
                            className="h-5 w-5 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(exam._id);
                              toast.success("Cloud ID Copied");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy exam cloud ID</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {exam?.uniqueExamLink && (
                    <div
                      className="self-end"
                      key={copiedExams[exam._id] ? "checked" : "copy"}
                    >
                      {!copiedExams[exam._id] ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Copy exam link"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  exam.uniqueExamLink!
                                );
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
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy exam link</TooltipContent>
                        </Tooltip>
                      ) : (
                        <CheckCircle
                          aria-hidden="true"
                          className="pointer-events-none"
                        />
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
                          Delete "{exam.topic}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-3 text-sm">
                            <p>
                              This is a <strong>permanent, irreversible</strong> action.
                              The following data will be deleted immediately:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-destructive font-medium">
                              <li>All student exam attempts</li>
                              <li>All graded results &amp; scores</li>
                              <li>The marking guide PDF</li>
                            </ul>
                            <p className="text-muted-foreground">
                              The uploaded exam resource (question paper) will <strong>not</strong> be deleted.
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteExamMutate(exam._id)}
                        >
                          Yes, delete exam
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
            <DialogDescription asChild>
              <div className="space-y-1">
                <p>
                  Difficulty:{" "}
                  <span className="font-semibold">{activeExam?.difficulty}</span> •
                  Questions:{" "}
                  <span className="font-semibold">
                    {activeExam?.totalQuestions}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Cloud ID: {activeExam?._id}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => {
                      if (activeExam?._id) {
                        navigator.clipboard.writeText(activeExam._id);
                        toast.success("ID Copied");
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 overflow-y-scroll max-h-[70vh] md:max-h-[400px] p-2">
            <h3 className="font-medium">Questions</h3>
            <ol className="list-none space-y-4 mt-2">
              {isExamDetailLoading && (
                <li className="text-sm text-slate-500">
                  Loading exam questions…
                </li>
              )}
              {isExamDetailError && (
                <li className="text-sm text-red-600">
                  Failed to load exam questions.
                </li>
              )}
              {!isExamDetailLoading &&
                !isExamDetailError &&
                (activeExamDetail?.questions ?? []).map(
                  (q: Question, qIdx: number) => (
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
                  )
                )}
            </ol>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              {activeExamDetail?.fileUri ?? activeExam?.fileUri ? (
                <a
                  href={activeExamDetail?.fileUri ?? activeExam?.fileUri}
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
