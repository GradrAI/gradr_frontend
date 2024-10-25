import { MongoDBDefault } from "./MongoDBDefault";

export type Result = MongoDBDefault & {
  exam: string;
  studentId: string;
  grade?: String;
  feedback: String;
  user: String;
};
