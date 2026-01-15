import { useParams } from "react-router-dom";
import { useCourseInfo } from "../hooks/useCourseInfo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Exam } from "@/types/Exam";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

const ExamComponent = () => {
  const { courseId, examId, uniqueCode } = useParams();
  const [state, setState] = useState<"preview" | "in-progress" | "submitted">(
    "preview"
  );
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [fullExam, setFullExam] = useState<Exam | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Fetch exam preview
  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["examPreview", courseId, uniqueCode],
    queryFn: async () => await api.get(`/exam/link/${courseId}/${uniqueCode}`),
    select: (res) => res.data?.data,
  });

  // Mutation for starting exam attempt
  const startExamMutation = useMutation({
    mutationFn: async (examIdParam: string) =>
      await api.post(`/exam/${examIdParam}/start`),
    onSuccess: (response) => {
      const { exam, attemptId: newAttemptId } = response.data?.data;
      setFullExam(exam);
      setAttemptId(newAttemptId);
      setState("in-progress");
      toast.success("Exam started!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to start exam";
      toast.error(message);
    },
  });

  // Mutation for submitting exam
  const submitExamMutation = useMutation({
    mutationFn: async () =>
      await api.post(`/exams/${attemptId}/submit`, { answers }),
    onSuccess: () => {
      setState("submitted");
      toast.success("Exam submitted successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to submit exam";
      toast.error(message);
    },
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleBeginExam = () => {
    if (previewData?.examId) {
      startExamMutation.mutate(previewData.examId);
    }
  };

  const handleSubmit = () => {
    submitExamMutation.mutate();
  };

  // Initialize countdown timer when exam starts
  useEffect(() => {
    if (state === "in-progress" && previewData?.durationMinutes) {
      setRemainingSeconds(previewData.durationMinutes * 60);
    }
  }, [state, previewData]);

  // Countdown timer effect
  useEffect(() => {
    if (state !== "in-progress" || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, remainingSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (previewLoading) {
    return <div className="p-8">Loading exam...</div>;
  }

  // Preview state - show exam info and begin button
  if (state === "preview" && previewData) {
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
                    {previewData.durationMinutes} minutes
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

  // In-progress state - show exam questions
  if (state === "in-progress" && fullExam) {
    const questions = fullExam.questions || [];
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Question {currentIndex + 1} / {questions.length}
            </Badge>
            <span
              className={`text-sm font-medium ${
                remainingSeconds < 300
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              Time Left: {formatTime(remainingSeconds)}
            </span>
          </div>
          <progress
            value={progress}
            max={100}
            className="w-full h-2 rounded-full bg-primary/20"
          />
        </header>

        {/* Question */}
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
                <>
                  <Textarea
                    placeholder="Type your answer here..."
                    className="min-h-[220px]"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Navigation */}
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
        </footer>
      </div>
    );
  }

  // Submitted state
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
              <Button variant="outline" className="w-full">
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
