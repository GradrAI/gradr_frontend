import type { PbtRubric } from "./Category";

export type UploadData = {
  lecturerId: string;
  name: string;
  fileType: "guide" | "question" | "answers";
  maxScoreAttainable: number;
  studentId?: string | null;
  categoryName?: string;
  categoryType: "test" | "assignment" | "exam";
  file: File;
  uploader: string | null;
  uploaderType: "lecturer" | "student";
  matricNo: string | null;
  /** Exam rules; only sent with a marking guide upload. */
  pbtRubric?: PbtRubric;
};
