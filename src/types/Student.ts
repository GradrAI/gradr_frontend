import { MongoDBDefault } from "./MongoDBDefault";
import { Result } from "./Result";

export type Student = MongoDBDefault & {
  name: string;
  email: string;
  studentId: string; // Matric number
  linkedUserId?: string; // Associated User ID
  linkStatus?: string;   // "linked" or null
  exams: Array<{
    name: string;
    file: { url: string };
    result: Result;
  }>;
};
