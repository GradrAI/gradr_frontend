export interface Exam {
  _id: string;
  courseId: string;
  categoryId: string;
  lecturerId: string;
  institutionId?: string;
  topic?: string;
  difficulty: "easy" | "moderate" | "hard";
  totalQuestions: number;
  questions: Question[];
  examType: "multiple-choice" | "essay" | "hybrid";
  fileResourceId?: string;
  fileUri?: string;
  notes?: string;
  rawModelOutput?: string;
  status: "draft" | "published" | "archived";
  uniqueExamLink?: string;
  meta?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  question: string;
  description: string;
  type: "multiple-choice" | "essay";
  options?: Option[];
}

export interface Option {
  id: number;
  text: string;
}
