import { MongoDBDefault } from "./MongoDBDefault";

export type Student = MongoDBDefault & {
  examName: string;
  lecturerId: string;
  answer: string;
  grade?: string;
};
