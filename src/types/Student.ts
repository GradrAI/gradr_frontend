import { MongoDBDefault } from "./MongoDBDefault";
import { Result } from "./Result";

export type Student = MongoDBDefault & {
  name: string;
  email: string;
  studentId: string;
  student: { studentId: string };
  result: Result;
  exams: Array<{
    file: { url: string };
    result: { score: string; explanation: string; feedback: string };
    // add other properties if needed
  }>;
};
