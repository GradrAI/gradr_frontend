import { MongoDBDefault } from "./MongoDBDefault";

export type Exam = MongoDBDefault & {
  examData?: any;
  user: string;
  examName: string;
  guide: string;
  question: string;
  students: [string];
  grade: string;
};
