import { MongoDBDefault } from "./MongoDBDefault";

export type QuestionResult = {
  questionId: string;
  score: number;
  maxScore: number;
  explanation: string;
  feedback: string;
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
  course?: { name: string };
  category?: { name: string; type: string };
  createdAt: string;
};
