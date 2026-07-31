import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCourseInfo } from "../hooks/useCourseInfo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Exam } from "@/types/Exam";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { autoSaveAttempt } from "@/requests/exam";
import { usePostHog } from '@posthog/react'

/** Ascending, so the first match is the tightest threshold still in play. */
const ANNOUNCE_THRESHOLDS = [60, 300, 600];

const ExamComponent = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const {
    state: { courseId, uniqueCode },
  } = useLocation();
  const [state, setState] = useState<"preview" | "in-progress" | "submitted">(
    "preview"
  );
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [fullExam, setFullExam] = useState<Exam | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timeAnnouncement, setTimeAnnouncement] = useState("");
  /** Largest countdown threshold already announced, in seconds. */
  const lastAnnouncedRef = useRef<number | null>(null);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const attemptIdRef = useRef(attemptId);
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["examPreview", courseId, uniqueCode],
    queryFn: async () => await api.get(`/exam/link/${courseId}/${uniqueCode}`),
    select: (res) => res.data?.data,
    refetchOnWindowFocus: false,
  });

  const submitExamMutation = useMutation({
    mutationFn: async (currentAnswers: Record<string, any>) =>
      await api.post(`/exam/${attemptIdRef.current}/submit`, {
        answers: currentAnswers,
      }),
    onSuccess: () => {
      setState("submitted");
      posthog.capture('exam_submitted', {
        exam_id: previewData?.examId,
        subject: previewData?.subject,
        attempt_id: attemptIdRef.current,
        question_count: fullExam?.questions?.length,
      });
      toast.success("Exam submitted successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to submit exam";
      toast.error(message);
    },
  });

  const startExamMutation = useMutation({
    mutationFn: async (examIdParam: string) =>
      await api.post(`/exam/${examIdParam}/start`),
    onSuccess: (response) => {
      const { exam, attemptId: newAttemptId } = response.data?.data;
      setFullExam(exam);
      setAttemptId(newAttemptId);
      setState("in-progress");
      toast.success("Exam started!");
      posthog.capture('exam_started', {
        exam_id: previewData?.examId,
        subject: previewData?.subject,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to start exam";
      toast.error(message);
    },
  });

  const hasTriggeredLockdown = useRef(false);

  const handleSubmit = useCallback(() => {
    // De-duplication lives on the mutation, not on hasTriggeredLockdown: the
    // anti-cheat and timer paths set that flag *before* calling in, so keying
    // off it here would swallow the very submissions it is meant to trigger.
    if (submitExamMutation.isPending || submitExamMutation.isSuccess) {
      return;
    }
    hasTriggeredLockdown.current = true;
    submitExamMutation.mutate(answersRef.current);
  }, [submitExamMutation]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleBeginExam = () => {
    if (previewData?.examId) {
      startExamMutation.mutate(previewData.examId);
    }
  };

  // Initialize countdown timer when exam starts
  useEffect(() => {
    if (state === "in-progress" && previewData?.durationMinutes) {
      setRemainingSeconds(previewData.durationMinutes * 60);
    }
  }, [state, previewData]);

  useEffect(() => {
    // Relaxed (untimed / practice) quizzes must never lock down or auto-submit
    // on a tab switch — only formal, strictly-proctored CBT does.
    if (state !== "in-progress" || previewData?.proctoringMode !== "strict")
      return;

    let lockdownActive = false;
    let gracePeriodTimeout: NodeJS.Timeout;

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed", err);
      } finally {
        gracePeriodTimeout = setTimeout(() => {
          lockdownActive = true;
        }, 1500);
      }
    };
    enterFullscreen();

    const handleCheatingDetected = () => {
      if (!lockdownActive || hasTriggeredLockdown.current) return;

      const isHidden = document.hidden;
      const isBlurred = !document.hasFocus();
      const leftFullscreen = !document.fullscreenElement;

      if (isHidden || isBlurred || leftFullscreen) {
        hasTriggeredLockdown.current = true;
        toast.error(
          "You have left the exam environment or exited fullscreen. Your exam has been automatically submitted.",
          { duration: 6000 }
        );
        handleSubmitRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleCheatingDetected);
    window.addEventListener("blur", handleCheatingDetected);
    document.addEventListener("fullscreenchange", handleCheatingDetected);

    return () => {
      clearTimeout(gracePeriodTimeout);
      document.removeEventListener("visibilitychange", handleCheatingDetected);
      window.removeEventListener("blur", handleCheatingDetected);
      document.removeEventListener("fullscreenchange", handleCheatingDetected);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) =>
          console.warn("Exit fullscreen failed", err)
        );
      }
    };
  }, [state, previewData?.proctoringMode]);

  useEffect(() => {
    if (state !== "in-progress" || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (!hasTriggeredLockdown.current) {
            hasTriggeredLockdown.current = true;
            handleSubmitRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, remainingSeconds]);

  // Announce the countdown only as it crosses 10, 5 and 1 minutes. A live
  // region updating every second is unusable with a screen reader.
  useEffect(() => {
    if (state !== "in-progress" || remainingSeconds <= 0) return;
    const threshold = ANNOUNCE_THRESHOLDS.find((t) => remainingSeconds <= t);
    if (threshold === undefined || lastAnnouncedRef.current === threshold)
      return;
    lastAnnouncedRef.current = threshold;
    setTimeAnnouncement(
      `${threshold / 60} minute${threshold === 60 ? "" : "s"} remaining`
    );
  }, [state, remainingSeconds]);

  // Persist answers every 30s and on unload so a refresh or dropped
  // connection does not cost the student their attempt. Failures are
  // swallowed: autosave must never interrupt an exam.
  useEffect(() => {
    if (state !== "in-progress" || !attemptId) return;

    const persist = () => {
      autoSaveAttempt(attemptId, answersRef.current).catch(() => {});
    };

    const interval = setInterval(persist, 30000);
    window.addEventListener("beforeunload", persist);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", persist);
    };
  }, [state, attemptId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (previewLoading) {
    return <div className="p-8">Loading exam...</div>;
  }

  if (state === "preview" && previewData) {
    if (previewData.hasAttempted) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <main className="flex-1 px-4 py-6 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Already Attempted</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You have already attempted this quiz. You cannot take it
                  twice.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => nav("/student/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 px-4 py-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">{previewData.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Difficulty
                  </span>
                  <Badge variant="outline">{previewData.difficulty}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Questions
                  </span>
                  <span className="font-semibold">
                    {previewData.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Duration
                  </span>
                  <span className="font-semibold">
                    {previewData.durationMinutes
                      ? `${previewData.durationMinutes} minutes`
                      : "No time limit"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Type
                  </span>
                  <Badge variant="secondary">{previewData.examType}</Badge>
                </div>
              </div>

              {previewData.availabilityStartAt && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Available from{" "}
                  {new Date(
                    previewData.availabilityStartAt
                  ).toLocaleDateString()}
                </div>
              )}

              <Button
                onClick={handleBeginExam}
                disabled={startExamMutation.isPending}
                className="w-full"
                size="lg"
              >
                {startExamMutation.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Begin {previewData.examType}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (state === "in-progress" && fullExam) {
    const questions = fullExam.questions || [];
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Question {currentIndex + 1} / {questions.length}
            </Badge>
            {previewData?.durationMinutes == null ? (
              <span className="text-sm font-medium text-muted-foreground">
                No time limit
              </span>
            ) : (
              <>
                <span
                  role="timer"
                  aria-live="off"
                  className={`text-sm font-medium ${
                    remainingSeconds < 300
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  Time Left: {formatTime(remainingSeconds)}
                </span>
                <span className="sr-only" aria-live="polite">
                  {timeAnnouncement}
                </span>
              </>
            )}
          </div>
          <Progress
            value={progress}
            aria-label="Quiz progress"
            className="w-full"
          />
        </header>

        <main className="flex-1 px-4 py-6">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-base leading-relaxed">
                {currentQuestion?.question}
              </CardTitle>
              {currentQuestion?.description && (
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {currentQuestion?.type === "multiple-choice" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center space-x-3 rounded-md border p-3"
                    >
                      <RadioGroupItem
                        value={opt.id.toString()}
                        id={`${currentQuestion.id}-${opt.id}`}
                      />
                      <Label
                        htmlFor={`${currentQuestion.id}-${opt.id}`}
                        className="text-sm"
                      >
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.type === "essay" && (
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[220px]"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                />
              )}
            </CardContent>
          </Card>
        </main>

        <footer className="sticky bottom-0 border-t bg-background px-4 py-3">
          <div className="mx-auto flex max-w-xl justify-between gap-3">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="w-full dark:text-white"
            >
              Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitExamMutation.isPending}
                className="w-full"
              >
                {submitExamMutation.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="w-full"
              >
                Next
              </Button>
            )}
          </div>
          <div
            role="group"
            aria-label="Question navigator"
            className="mx-auto mt-3 max-w-xl grid grid-cols-8 sm:grid-cols-10 gap-1.5"
          >
            {questions.map((question, index) => {
              const answer = answers[question.id];
              const answered = answer !== undefined && answer !== "";
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Question ${index + 1}${
                    answered ? ", answered" : ", not answered"
                  }`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`h-8 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                    answered ? "bg-primary/15" : "bg-background"
                  } ${
                    isCurrent
                      ? "border-primary ring-2 ring-primary ring-offset-1"
                      : "border-input"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    );
  }

  if (state === "submitted") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 px-4 py-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Exam Submitted</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your exam has been submitted successfully. You will receive your
                results shortly.
              </p>
              {previewData?.leaderboard?.enabled && previewData?.examId && (
                <Button asChild className="w-full">
                  <Link
                    to={`/student/quiz/${previewData.examId}/leaderboard`}
                  >
                    View leaderboard
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => nav("../dashboard")}
              >
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return null;
};

export default ExamComponent;