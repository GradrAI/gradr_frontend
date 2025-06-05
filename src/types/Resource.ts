import { MongoDBDefault } from "./MongoDBDefault";

export type ResourceType = "guide" | "question" | "answers";

export type Resource = MongoDBDefault & {
  categoryId: string;
  type: ResourceType;
  fileUrl: string;
  studentId?: string;
  lecturerId?: string;
};
