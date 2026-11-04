import { MongoDBDefault } from "./MongoDBDefault";
import { Resource } from "./Resource";
import { Student } from "./Student";

export type ResourceType = "test" | "assignment" | "exam";

/** "Answer all questions" or "answer any N of the M questions". */
export type PbtSelectionPolicy =
  | { mode: "all"; answerCount?: null }
  | { mode: "best_n"; answerCount: number };

/** Paper-based exam rules: marks per question plus the selection policy. */
export type PbtRubric = {
  selectionPolicy: PbtSelectionPolicy;
  questions: { questionId: string; maxMarks: number }[];
};

export type Category = MongoDBDefault & {
  id: string;
  courseId: string;
  name: string;
  type: ResourceType;
  maxScoreAttainable: number;
  pbtRubric?: PbtRubric | null;
  resources?: Resource[];
  students?: Student[];
};
