export type UploadData = {
  user: string;
  examName: string;
  fileType: "guide" | "question" | "answers";
  file: File;
  maxScoreAttainable: number;
};
