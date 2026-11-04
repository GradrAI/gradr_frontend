import { MongoDBDefault } from "./MongoDBDefault";

export type ResultStatus = "COMPLETED" | "PENDING_REVIEW";

export type QuestionResult = {
  questionId: string;
  score: number;
  maxScore: number;
  explanation: string;
  feedback: string;
  topic?: string;
  /** False when an "answer any N" rule left this question out of the total. */
  selected?: boolean;
};

export type GradingMeta = {
  pipelineType?: "PBT" | "CBT";
  refereeStatus?: string;
  validationErrors?: string[];
};

export type Result = MongoDBDefault & {
  courseId?: any;
  categoryId?: any;
  examId?: any;
  studentId: string; // Matric number
  studentRef?: string; // Student document ID
  linkedUserId?: string; // Associated User ID
  score: string; // Overall score string e.g. "45/60"
  results: QuestionResult[];
  explanation: string;
  feedback: string;
  lecturerId: string;
  lecturerComment: string | null;
  status?: ResultStatus;
  gradingMeta?: GradingMeta;
  course?: { name: string };
  category?: { name: string; type: string };
  createdAt: string;
};
