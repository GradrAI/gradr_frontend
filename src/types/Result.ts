import { MongoDBDefault } from "./MongoDBDefault";

export type QuestionResult = {
  questionId: string;
  score: string;
  explanation: string;
  feedback: string;
};

export type Result = MongoDBDefault & {
  courseId?: string;
  categoryId?: string;
  studentId: string; // Matric number
  studentRef?: string; // Student document ID
  linkedUserId?: string; // Associated User ID
  score: string;
  results: QuestionResult[];
  explanation: string;
  feedback: string;
  lecturerId: string;
  lecturerComment: string | null;
  course?: { name: string }; // Populated in some responses
  category?: { name: string; type: string }; // Populated in some responses
};
