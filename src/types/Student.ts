import { MongoDBDefault } from "./MongoDBDefault";

export type Student = MongoDBDefault & {
  name: string;
  email: string;
  studentId: string;
};
