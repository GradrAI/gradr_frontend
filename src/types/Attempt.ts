import type { Question } from "./Exam";
import type { Result, ResultStatus } from "./Result";

/** Mirrors the backend ExamAttempt `status` enum. */
export type AttemptStatus =
  | "in-progress"
  | "submitted"
  | "grading"
  | "graded"
  | "pending_review"
  | "grading_failed";

/** GET /exam/attempts/:attemptId/status. Students only see score/resultId once COMPLETED. */
export interface AttemptStatusResponse {
  attemptId: string;
  status: AttemptStatus;
  resultId: string | null;
  resultStatus: ResultStatus | null;
  score: number | null;
  maxScore: number | null;
}

/** GET /exam/attempts/mine. */
export interface MyAttempt {
  attemptId: string;
  examId: string;
  examTopic: string;
  courseName: string;
  status: AttemptStatus;
  submittedAt: string | null;
  resultId: string | null;
}

/** GET /exam/:examId/submissions. */
export interface ExamSubmission {
  attemptId: string;
  student: { _id: string; name: string; email: string };
  status: AttemptStatus;
  submittedAt: string | null;
  score: number | null;
  resultId: string | null;
  resultStatus: ResultStatus | null;
  validationErrors: string[];
  vivaCount: number;
}

export type VivaLanguage =
  | "en"
  | "pcm"
  | "yo"
  | "ha"
  | "ig"
  | "sw"
  | "rw"
  | "zu"
  | "af";

/** A processed oral-verification recording; the audio itself is never stored. */
export interface VivaResponse {
  _id: string;
  attemptId: string;
  questionId: string;
  status: "processed" | "no_speech" | "failed";
  languagesRequested: VivaLanguage[];
  chosenLanguage?: VivaLanguage | null;
  transcriptSource?: "sahara" | "gemini" | null;
  transcript?: string | null;
  recordingCount: number;
  grade?: {
    score: number;
    maxScore: number;
    explanation: string;
    feedback: string;
    modelConfidence?: number;
  } | null;
  followUp?: {
    question: string;
    targetConcept?: string;
    reason?: string;
  } | null;
}

/** GET /exam/attempts/:attemptId/review (exam owner only). */
export interface AttemptReview {
  attempt: {
    answers: Record<string, string | undefined>;
    status: AttemptStatus;
    submittedAt: string | null;
  };
  exam: {
    questions: Question[];
    maxScoreAttainable: number;
    vivaEnabled: boolean;
  };
  result: Result | null;
  viva: VivaResponse[];
}

/** Body item of PATCH /results/:id when a teacher edits per-question scores. */
export interface QuestionScoreEdit {
  questionId: string;
  score: number;
  feedback?: string;
}

/** POST /exam/:attemptId/viva/:questionId success/failure body. */
export interface VivaUploadResult {
  status: "processed" | "no_speech" | "failed";
}
