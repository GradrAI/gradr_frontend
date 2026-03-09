import { MongoDBDefault } from "./MongoDBDefault";

export type ResourceType = "guide" | "question" | "answers" | "report" | "generatedExam";

export type Resource = MongoDBDefault & {
  name: string;
  categoryId: string;
  type: ResourceType;
  fileUrl: string;
  studentId?: string;
  lecturerId?: string;
  examId?: string;
};
