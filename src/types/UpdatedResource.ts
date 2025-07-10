import { Resource } from "./Resource";
import { Student } from "./Student";

export type UpdatedResource = Resource & {
  student: Student;
  result: {
    _id: String;
    score: String;
    explanation: String;
    feedback: String;
  };
};
