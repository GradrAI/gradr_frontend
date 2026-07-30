import { CheckCircle, Loader2Icon, Paperclip, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { CourseData } from "@/types/CourseData";
import { AxiosResponse, isAxiosError } from "axios";
import useStore from "@/state";
import { useNavigate } from "react-router-dom";
import { usePostHog } from '@posthog/react'

import ExamUploadForm from "./ExamUploadForm";
import QuestionEditor from "./QuestionEditor";
import { updateQuestions } from "@/requests/exam";
import type { EditableQuestion, Question } from "@/types/Exam";

export interface ExamData {
  id: string;
  question: string;
  description: string;
  type: "multiple-choice" | "essay";
  options: { id: string | number; text: string }[];
  maxMarks: number;
}

interface NewCoursePayload {
  lecturerId: string;
  name: string;
  periodId?: string;
}

/** The question endpoints return precise, user-facing failure reasons. */
function extractMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const data: unknown = error.response?.data;
  if (data && typeof data === "object" && "message" in data) {
    const { message } = data;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return undefined;
}

// ─────────────────────────────────────────────
//  Score Budget Bar
// ─────────────────────────────────────────────
function ScoreBudgetBar({
  allocated,
  max,
}: {
  allocated: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min((allocated / max) * 100, 100) : 0;
  const isOver = allocated > max;
  const isExact = Math.abs(allocated - max) < 0.01;

  return (
    <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-foreground/90">Score Budget</span>
        <span
          className={
            isOver
              ? "text-red-600 font-bold"
              : isExact
              ? "text-emerald-600 font-bold"
              : "text-muted-foreground"
          }
        >
          {allocated} / {max} marks
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver
              ? "bg-red-500"
              : isExact
              ? "bg-emerald-500"
              : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isOver && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Total exceeds the maximum score by{" "}
          <strong>{Math.round((allocated - max) * 100) / 100}</strong>. Reduce
          marks before publishing.
        </p>
      )}
      {isExact && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          All marks perfectly allocated.
        </p>
      )}
      {!isOver && !isExact && allocated > 0 && (
        <p className="text-xs text-muted-foreground">
          {Math.round((max - allocated) * 100) / 100} marks remaining unallocated.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main ExamForm
// ─────────────────────────────────────────────
export default function ExamForm() {
  const nav = useNavigate();
  const posthog = usePostHog()
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [addNew, setAddNew] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);
  const [open, setOpen] = useState(false);

  // Editable copy of the generated questions. The client always sends this
  // whole array, in display order — that is how reorder / add / delete persist.
  const [localQuestions, setLocalQuestions] = useState<EditableQuestion[]>([]);
  const [questionsDirty, setQuestionsDirty] = useState(false);

  // Fetch active period for course creation
  const { data: activePeriodData } = useQuery({
    queryKey: ["activePeriod"],
    queryFn: async () => {
      const res = await api.get("/periods/active");
      return res.data.data;
    },
  });

  const mutationKey = ["generateQuiz"];
  const mutations = useMutationState({ filters: { mutationKey } });
  const isGenerating = mutations.some((m) => m.status === "pending");
  const latestMutation = mutations.find((m) => m.status === "success");
  const latestData = latestMutation?.data as AxiosResponse | undefined;
  const examId: string | undefined = latestData?.data?.data?.examId;

  // ── Fetch full exam (with per-question maxMarks) after generation ──
  const { data: examQueryData, isLoading: examLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      const res = await api.get(`/exam/${examId}`);
      return res.data;
    },
    enabled: Boolean(examId),
    staleTime: 0,
  });

  const exam = examQueryData?.data;
  const maxScoreAttainable: number = exam?.maxScoreAttainable ?? 0;
  const fetchedQuestions: Question[] = exam?.questions ?? [];

  // Initialise / sync the editable questions from the fetched exam
  useEffect(() => {
    if (fetchedQuestions.length > 0) {
      setLocalQuestions(
        fetchedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          description: q.description ?? "",
          type: q.type,
          difficulty: q.difficulty ?? "moderate",
          explanation: q.explanation ?? "",
          maxMarks: q.maxMarks ?? 0,
          options: q.options?.map((option) => ({ ...option })),
          correctOptionId: q.correctOptionId ?? null,
        }))
      );
      setQuestionsDirty(false);
    }
  }, [exam]);

  // ── Computed budget values ──
  const totalAllocated = Math.round(
    localQuestions.reduce((sum, q) => sum + (q.maxMarks || 0), 0) * 100
  ) / 100;
  const isOverBudget = totalAllocated > maxScoreAttainable;

  const handleQuestionsChange = (next: EditableQuestion[]) => {
    setLocalQuestions(next);
    setQuestionsDirty(true);
  };

  // ── Save question edits mutation ──
  const { mutate: saveQuestions, isPending: savingQuestions } = useMutation({
    mutationFn: async () => {
      if (!examId) throw new Error("Missing exam id");
      return updateQuestions(examId, localQuestions);
    },
    onSuccess: () => {
      posthog.capture("exam_questions_saved", {
        exam_id: examId,
        question_count: localQuestions.length,
        total_allocated: totalAllocated,
        max_score: maxScoreAttainable,
      });
      toast.success("Questions saved.");
      setQuestionsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
    onError: (error: unknown) =>
      toast.error(extractMessage(error) || "Failed to save questions"),
  });

  // ── Publish mutation ──
  const {
    data: publishExamData,
    mutate: publishExam,
    isPending: publishExamIsPending,
  } = useMutation({
    mutationKey: ["publishExam"],
    mutationFn: async () =>
      await api.post("/exam/publish", { examId }),
    onMutate: () => toast.success("Publishing exam..."),
    onSuccess: (data: AxiosResponse) => {
      posthog.capture("exam_published", { 
        exam_id: examId, 
        question_count: localQuestions.length,
        max_score: maxScoreAttainable, 
        share_link: data?.data?.data?.uploadLink 
      });
      setOpen(true);
    },
    onError: (error: unknown) => {
      const message = extractMessage(error);
      posthog.capture("exam_publish_failed", { error: message });
      toast.error(message || "Unable to publish exam");
    },
  });

  // ── Course mutation ──
  const { mutate: courseMutate } = useMutation({
    mutationKey: ["courses"],
    mutationFn: async (data: NewCoursePayload) =>
      await api.post(`/courses`, data),
  });

  const handleAddCourse = () => {
    if (!user?._id?.length) {
      toast.error(notifications.EXAM.FAILURE);
      return;
    }
    courseMutate(
      { lecturerId: user?._id, name: courseName, periodId: activePeriodData?._id },
      {
        onSuccess: (data: AxiosResponse<CourseData>) => {
          if (data?.status === 201) {
            toast.success("Added course successfully");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setAddNew(false);
            setCourseName("");
          }
        },
        onError: () => toast.error("Failed to create course"),
      }
    );
  };

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      {isGenerating ? (
        /* ── Loading state ── */
        <div className="flex flex-col items-center justify-center py-20 w-full bg-card rounded-xl shadow-sm border border-border">
          <Loader2Icon className="w-12 h-12 animate-spin text-primary mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Generating your quiz...
          </h2>
          <p className="text-muted-foreground text-center max-w-md px-6">
            Analyzing your resources to craft high-quality questions.
            This usually takes 30-60 seconds.
          </p>
        </div>
      ) : latestData ? (
        /* ── Generated quiz review ── */
        <div>
          {/* Header */}
          <div className="flex flex-col flex-wrap md:flex-row w-full gap-4 justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold m-0 text-foreground">
                Review Generated Quiz
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Edit any question, then set marks. The total must not exceed{" "}
                <strong>{maxScoreAttainable}</strong> marks.
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {localQuestions.length} Questions
            </div>
          </div>

          {/* Score budget bar */}
          {examLoading ? (
            <div className="h-16 rounded-xl bg-muted animate-pulse mb-6" />
          ) : (
            <div className="mb-6">
              <ScoreBudgetBar allocated={totalAllocated} max={maxScoreAttainable} />
            </div>
          )}

          {/* Question editor */}
          {examLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <QuestionEditor
              questions={localQuestions}
              onChange={handleQuestionsChange}
              maxScoreAttainable={maxScoreAttainable}
              disabled={savingQuestions}
            />
          )}

          {/* Action bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Save question edits */}
            <Button
              variant="outline"
              className="h-11 px-5 gap-2"
              onClick={() => saveQuestions()}
              disabled={savingQuestions || !questionsDirty || examLoading}
            >
              {savingQuestions ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingQuestions ? "Saving..." : "Save changes"}
            </Button>

            {/* Publish */}
            <Button
              className="h-11 px-8 text-base font-semibold"
              onClick={() => {
                if (questionsDirty) {
                  toast.error(
                    "You have unsaved question changes. Please save first."
                  );
                  return;
                }
                if (examId) publishExam();
              }}
              disabled={
                publishExamIsPending ||
                !examId ||
                !!publishExamData?.data?.data?.success ||
                isOverBudget ||
                questionsDirty ||
                examLoading
              }
            >
              {publishExamIsPending ? (
                <>
                  <Loader2Icon className="animate-spin mr-2 w-4 h-4" />
                  Publishing...
                </>
              ) : (
                "Publish Quiz"
              )}
            </Button>

            {isOverBudget && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Fix marks before publishing.
              </p>
            )}

            {questionsDirty && !isOverBudget && (
              <p className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                You have unsaved changes. Save them before publishing.
              </p>
            )}

            {!isOverBudget &&
              !questionsDirty &&
              !isGenerating &&
              !examLoading && (
                <p className="text-sm text-muted-foreground">
                  Only published quizzes can be shared with students.
                </p>
              )}
          </div>

          {/* Share link dialog */}
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
        /* ── Upload form (initial state) ── */
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
