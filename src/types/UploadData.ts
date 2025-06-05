export type UploadData = {
  lecturerId: string;
  name: string;
  categoryName?: string;
  categoryType: "test" | "assignment" | "exam";
  fileType: "guide" | "question" | "answers";
  file: File;
  maxScoreAttainable: number;
  studentId?: string | null;
};
