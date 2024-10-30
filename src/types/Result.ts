import { MongoDBDefault } from "./MongoDBDefault";

export type Result = MongoDBDefault & {
  exam: string;
  studentId: string;
  score: string;
  explanation: string;
  feedback: string;
  lecturerId: string;
};
