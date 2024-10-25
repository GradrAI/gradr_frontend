import { MongoDBDefault } from "./MongoDBDefault";

export type Exam = MongoDBDefault & {
  user: string;
  examName: string;
  guide: string;
  question: string;
  students: [string];
  grade: string;
};
