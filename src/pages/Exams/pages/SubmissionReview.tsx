import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2Icon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AttemptStatusBadge from "@/components/AttemptStatusBadge";
import { formatReviewReason } from "@/lib/reviewReasons";
import { VIVA_LANGUAGE_LABELS } from "@/lib/vivaLanguages";
import { getAttemptReview } from "@/requests/exam";
import { approveQuestionScores } from "@/requests/results";
import type { Question } from "@/types/Exam";
import type { VivaResponse } from "@/types/Attempt";
import type { QuestionResult } from "@/types/Result";

type ScoreDraft = { score: string; feedback: string };

const optionText = (question: Question, optionId: unknown) =>
  question.options?.find((o) => String(o.id) === String(optionId))?.text;

const VivaPanel = ({ viva }: { viva: VivaResponse }) => (
  <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-sm">
    <div className="flex flex-wrap items-center gap-2 font-medium">
      <Mic className="h-4 w-4" aria-hidden="true" /> Spoken explanation
      {viva.chosenLanguage && (
        <Badge variant="outline">{VIVA_LANGUAGE_LABELS[viva.chosenLanguage]}</Badge>
      )}
      {viva.transcriptSource && (
        <Badge variant="secondary">
          {viva.transcriptSource === "sahara" ? "Sahara" : "Gemini audio"}
        </Badge>
      )}
    </div>
    {viva.status === "processed" ? (
      <>
        <p className="italic">“{viva.transcript}”</p>
        {viva.grade && (
          <p>
            <span className="font-medium">Viva score:</span> {viva.grade.score} /{" "}
            {viva.grade.maxScore}
            {viva.grade.explanation && ` — ${viva.grade.explanation}`}
          </p>
        )}
        {viva.followUp?.question && (
          <p>
            <span className="font-medium">Follow-up question:</span>{" "}
            {viva.followUp.question}
          </p>
        )}
      </>
    ) : (
      <p className="text-muted-foreground">
        {viva.status === "no_speech"
          ? "No speech was detected in the recording."
          : "The recording could not be processed."}
      </p>
    )}
  </div>
);

const SubmissionReview = () => {
  const { examId = "", attemptId = "" } = useParams();
  const queryClient = useQueryClient();

  const { data: review, isLoading, isError } = useQuery({
    queryKey: ["attemptReview", attemptId],
    queryFn: () => getAttemptReview(attemptId),
    enabled: !!attemptId,
  });

  const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
  const [lecturerComment, setLecturerComment] = useState("");

  useEffect(() => {
    if (!review) return;
    const items = new Map(
      (review.result?.results ?? []).map((item) => [item.questionId, item])
    );
    setDrafts(
      Object.fromEntries(
        review.exam.questions.map((q) => {
          const item = items.get(q.id);
          return [
            q.id,
            { score: item ? String(item.score) : "", feedback: item?.feedback ?? "" },
          ];
        })
      )
    );
    setLecturerComment(review.result?.lecturerComment ?? "");
  }, [review]);

  const approve = useMutation({
    mutationFn: () =>
      approveQuestionScores(
        String(review?.result?._id),
        (review?.exam.questions ?? []).map((q) => ({
          questionId: q.id,
          score: Number(drafts[q.id]?.score),
          feedback: drafts[q.id]?.feedback ?? "",
        })),
        lecturerComment
      ),
    onSuccess: () => {
      toast.success("Scores approved");
      queryClient.invalidateQueries({ queryKey: ["attemptReview", attemptId] });
      queryClient.invalidateQueries({ queryKey: ["examSubmissions", examId] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? "Could not save the scores");
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="w-full max-w-xs h-[40px] rounded-md" />
        <Skeleton className="w-full h-[320px] rounded-xl" />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-destructive">This submission could not be loaded.</p>
      </div>
    );
  }

  const { attempt, exam, result, viva } = review;
  const resultItems = new Map<string, QuestionResult>(
    (result?.results ?? []).map((item) => [item.questionId, item])
  );
  const reasons = result?.gradingMeta?.validationErrors ?? [];
  const maxFor = (q: Question) =>
    resultItems.get(q.id)?.maxScore ?? q.maxMarks ?? 0;
  const scoreError = (q: Question) => {
    const raw = drafts[q.id]?.score ?? "";
    const value = Number(raw);
    return raw.trim() === "" || !(value >= 0 && value <= maxFor(q))
      ? `Enter a score between 0 and ${maxFor(q)}.`
      : null;
  };
  const hasInvalidScore = exam.questions.some((q) => scoreError(q) !== null);

  return (
    <div className="p-4 sm:p-6 space-y-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Review submission</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AttemptStatusBadge status={attempt.status} />
            {attempt.submittedAt && (
              <span>Submitted {new Date(attempt.submittedAt).toLocaleString()}</span>
            )}
            {result && <span>• Score {result.score}</span>}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/app/exams/${examId}/submissions`}>Back to submissions</Link>
        </Button>
      </div>

      {reasons.length > 0 && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Why this needs your review</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {reasons.map((reason) => (
                <li key={reason}>{formatReviewReason(reason)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!result && (
        <p className="text-muted-foreground">
          This attempt has not been graded yet, so there are no scores to approve.
        </p>
      )}

      {exam.questions.map((q, index) => {
        const item = resultItems.get(q.id);
        const answer = attempt.answers[q.id];
        const error = scoreError(q);
        const vivaRow = viva.find((v) => v.questionId === q.id);
        return (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base leading-relaxed">
                {index + 1}. {q.question}
              </CardTitle>
              {q.description && (
                <p className="text-sm text-muted-foreground">{q.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">Student answer</p>
                {q.type === "multiple-choice" ? (
                  <>
                    <p>Chosen: {optionText(q, answer) ?? "No answer selected"}</p>
                    <p>Correct: {optionText(q, q.correctOptionId) ?? "—"}</p>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {answer?.trim() ? answer : "No answer submitted"}
                  </p>
                )}
              </div>

              {item && (
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">AI score:</span> {item.score} /{" "}
                    {item.maxScore}
                  </p>
                  {item.explanation && <p>{item.explanation}</p>}
                </div>
              )}

              {vivaRow && <VivaPanel viva={vivaRow} />}

              {result && (
                <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <div className="space-y-1">
                    <Label htmlFor={`score-${q.id}`}>Score for {q.id}</Label>
                    <Input
                      id={`score-${q.id}`}
                      type="number"
                      min={0}
                      max={maxFor(q)}
                      step="any"
                      value={drafts[q.id]?.score ?? ""}
                      aria-invalid={error !== null}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [q.id]: { ...prev[q.id], score: e.target.value },
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">out of {maxFor(q)}</p>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`feedback-${q.id}`}>Feedback for {q.id}</Label>
                    <Textarea
                      id={`feedback-${q.id}`}
                      rows={2}
                      value={drafts[q.id]?.feedback ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [q.id]: { ...prev[q.id], feedback: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="lecturer-comment">Comment for the student (optional)</Label>
              <Textarea
                id="lecturer-comment"
                rows={3}
                value={lecturerComment}
                onChange={(e) => setLecturerComment(e.target.value)}
              />
            </div>
            <Button
              onClick={() => approve.mutate()}
              disabled={hasInvalidScore || approve.isPending}
            >
              {approve.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Approve scores
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubmissionReview;
