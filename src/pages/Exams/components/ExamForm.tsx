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
import { AxiosResponse } from "axios";
import useStore from "@/state";
import { useNavigate } from "react-router-dom";

import ExamUploadForm from "./ExamUploadForm";

export interface ExamData {
  id: string;
  question: string;
  description: string;
  type: "multiple-choice" | "essay";
  options: { id: string | number; text: string }[];
  maxMarks: number;
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
    <div className="p-4 rounded-xl border bg-slate-50 space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-slate-700">Score Budget</span>
        <span
          className={
            isOver
              ? "text-red-600 font-bold"
              : isExact
              ? "text-emerald-600 font-bold"
              : "text-slate-600"
          }
        >
          {allocated} / {max} marks
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
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
        <p className="text-xs text-slate-500">
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
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [addNew, setAddNew] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);
  const [open, setOpen] = useState(false);

  // Local editable marks state: { [questionId]: number }
  const [localMarks, setLocalMarks] = useState<Record<string, number>>({});
  const [marksDirty, setMarksDirty] = useState(false);

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
  const fetchedQuestions: ExamData[] = exam?.questions ?? [];

  // Initialise / sync local marks from fetched exam
  useEffect(() => {
    if (fetchedQuestions.length > 0) {
      const initial: Record<string, number> = {};
      fetchedQuestions.forEach((q) => {
        initial[q.id] = q.maxMarks ?? 0;
      });
      setLocalMarks(initial);
      setMarksDirty(false);
    }
  }, [exam]);

  // ── Computed budget values ──
  const totalAllocated = Math.round(
    Object.values(localMarks).reduce((sum, v) => sum + v, 0) * 100
  ) / 100;
  const isOverBudget = totalAllocated > maxScoreAttainable;

  // ── Save marks mutation ──
  const { mutate: saveMarks, isPending: savingMarks } = useMutation({
    mutationFn: async () => {
      const questionMarks = Object.entries(localMarks).map(([id, maxMarks]) => ({
        id,
        maxMarks,
      }));
      return api.patch(`/exam/${examId}/question-marks`, { questionMarks });
    },
    onSuccess: () => {
      toast.success("Marks saved successfully.");
      setMarksDirty(false);
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to save marks"),
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
    onSuccess: () => setOpen(true),
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message || err?.message || "Unable to publish exam"
      ),
  });

  // ── Course mutation ──
  const { mutate: courseMutate } = useMutation({
    mutationKey: ["courses"],
    mutationFn: async (data: any) => await api.post(`/courses`, data),
  });

  const handleAddCourse = () => {
    if (!user?._id?.length) {
      toast.error(notifications.EXAM.FAILURE);
      return;
    }
    courseMutate(
      { lecturerId: user?._id, name: courseName },
      {
        onSuccess: (data: AxiosResponse<CourseData>) => {
          if (data?.status === 201) {
            toast.success("Added course successfully");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setAddNew(false);
            setCourseName("");
          }
        },
        onError: (error: any) => console.log("error", error),
      }
    );
  };

  const handleMarkChange = (questionId: string, value: number) => {
    setLocalMarks((prev) => ({ ...prev, [questionId]: value }));
    setMarksDirty(true);
  };

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      {isGenerating ? (
        /* ── Loading state ── */
        <div className="flex flex-col items-center justify-center py-20 w-full bg-white rounded-xl shadow-sm border border-slate-100">
          <Loader2Icon className="w-12 h-12 animate-spin text-primary mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Generating your quiz...
          </h2>
          <p className="text-slate-500 text-center max-w-md px-6">
            Our AI is analyzing your resources to craft high-quality questions.
            This usually takes 30–60 seconds.
          </p>
        </div>
      ) : latestData ? (
        /* ── Generated quiz review ── */
        <div>
          {/* Header */}
          <div className="flex flex-col flex-wrap md:flex-row w-full gap-4 justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold m-0 text-slate-900">
                Review Generated Quiz
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Set marks for each question. Total must not exceed{" "}
                <strong>{maxScoreAttainable}</strong> marks.
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {fetchedQuestions.length} Questions
            </div>
          </div>

          {/* Score budget bar */}
          {examLoading ? (
            <div className="h-16 rounded-xl bg-slate-100 animate-pulse mb-6" />
          ) : (
            <div className="mb-6">
              <ScoreBudgetBar allocated={totalAllocated} max={maxScoreAttainable} />
            </div>
          )}

          {/* Question list */}
          <div className="space-y-4">
            {examLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl bg-slate-100 animate-pulse"
                  />
                ))
              : fetchedQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-colors"
                  >
                    <div className="flex justify-start items-start gap-3">
                      {/* Question number badge */}
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm shrink-0 mt-0.5">
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2 ${
                            q.type === "essay"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {q.type === "essay" ? "Essay" : "MCQ"}
                        </span>

                        <h3 className="text-base font-semibold text-slate-900 mb-1">
                          {q.question}
                        </h3>
                        {q.description && (
                          <p className="text-slate-500 text-sm mb-3">
                            {q.description}
                          </p>
                        )}

                        {/* MCQ options */}
                        {q.options?.length > 0 && (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {q.options.map(({ id: optionId, text }) => (
                              <li
                                key={optionId}
                                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-sm"
                              >
                                <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                                {text}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Marks input */}
                        <div className="flex items-center gap-2 mt-2">
                          <label
                            htmlFor={`marks-${q.id}`}
                            className="text-xs font-medium text-slate-600 shrink-0"
                          >
                            Marks for this question:
                          </label>
                          <Input
                            id={`marks-${q.id}`}
                            type="number"
                            min={0}
                            step={0.5}
                            value={localMarks[q.id] ?? 0}
                            onChange={(e) =>
                              handleMarkChange(
                                q.id,
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            className="h-8 w-24 text-sm bg-white"
                          />
                          <span className="text-xs text-slate-400">
                            / {maxScoreAttainable} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Action bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Save marks */}
            <Button
              variant="outline"
              className="h-11 px-5 gap-2"
              onClick={() => saveMarks()}
              disabled={savingMarks || !marksDirty || examLoading}
            >
              {savingMarks ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingMarks ? "Saving..." : "Save Marks"}
            </Button>

            {/* Publish */}
            <Button
              className="h-11 px-8 text-base font-semibold"
              onClick={() => {
                if (marksDirty) {
                  toast.error(
                    "You have unsaved mark changes. Please save first."
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

            {!isOverBudget && !isGenerating && !examLoading && (
              <p className="text-sm text-slate-500">
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
