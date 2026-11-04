import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AttemptStatusBadge from "@/components/AttemptStatusBadge";
import { formatReviewReason } from "@/lib/reviewReasons";
import { getExamSubmissions, regradeAttempt } from "@/requests/exam";
import type { ExamSubmission } from "@/types/Attempt";

/** An attempt still "submitted" after this long was never picked up by a grader. */
const STUCK_AFTER_MS = 10 * 60 * 1000;

const canRetryGrading = (submission: ExamSubmission, now: number) =>
  submission.status === "grading_failed" ||
  (submission.status === "submitted" &&
    submission.submittedAt !== null &&
    now - new Date(submission.submittedAt).getTime() > STUCK_AFTER_MS);

const Submissions = () => {
  const { examId = "" } = useParams();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading, isError } = useQuery({
    queryKey: ["examSubmissions", examId],
    queryFn: () => getExamSubmissions(examId),
    enabled: !!examId,
  });

  const regrade = useMutation({
    mutationFn: regradeAttempt,
    onSuccess: () => {
      toast.success("Grading restarted");
      queryClient.invalidateQueries({ queryKey: ["examSubmissions", examId] });
    },
    onError: (error: { response?: { data?: { error?: string; message?: string } } }) => {
      toast.error(
        error.response?.data?.error ?? error.response?.data?.message ?? "Could not restart grading"
      );
    },
  });

  const now = Date.now();

  return (
    <div className="p-4 sm:p-6 space-y-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <Button asChild variant="outline">
          <Link to="/app/exams">Back to exams</Link>
        </Button>
      </div>

      {isLoading && <Skeleton className="w-full h-[240px] rounded-xl" />}

      {isError && (
        <p className="text-destructive">Submissions could not be loaded.</p>
      )}

      {!isLoading && !isError && submissions.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      )}

      {submissions.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted at</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Review reasons</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.attemptId}>
                    <TableCell>
                      <div className="font-medium">{submission.student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {submission.student.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AttemptStatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell>{submission.score ?? "—"}</TableCell>
                    <TableCell>
                      {submission.validationErrors.length > 0 ? (
                        <ul className="list-disc pl-4 text-sm">
                          {submission.validationErrors.map((reason) => (
                            <li key={reason}>{formatReviewReason(reason)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canRetryGrading(submission, now) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={regrade.isPending}
                            onClick={() => regrade.mutate(submission.attemptId)}
                          >
                            {regrade.isPending &&
                              regrade.variables === submission.attemptId && (
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              )}
                            Retry grading
                          </Button>
                        )}
                        <Button asChild size="sm">
                          <Link to={submission.attemptId}>Review</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Submissions;
