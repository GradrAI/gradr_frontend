export type Exam = {
  _id: string;
  user: string;
  examName: string;
  guide: string;
  question: string;
  students: [string];
  createdAt: string;
  updatedAt: string;
  grade: string;
};
