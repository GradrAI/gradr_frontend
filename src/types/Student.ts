import { MongoDBDefault } from "./MongoDBDefault";

export type Student = MongoDBDefault & {
  exams: [
    {
      name: string;
      lecturerId: string;
      file: {
        url: string;
        name: string;
      };
      result: {
        score: string;
        explanation: string;
        feedback: string;
      };
    },
  ];
};
