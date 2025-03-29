export type UploadData = {
  lecturerId: string;
  examName: string;
  fileType: "guide" | "question" | "answers";
  file: File;
  maxScoreAttainable: number;
  studentId?: string | null;
};
