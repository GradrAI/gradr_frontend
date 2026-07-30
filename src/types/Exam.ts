export type Difficulty = "easy" | "moderate" | "hard";

/** Per-level question counts. Present when the exam difficulty is "mixed". */
export interface DifficultyMix {
  easy: number;
  moderate: number;
  hard: number;
}

export interface Exam {
  _id: string;
  courseId: string;
  categoryId: string;
  lecturerId: string;
  institutionId?: string;
  topic?: string;
  difficulty: Difficulty | "mixed";
  difficultyMix?: DifficultyMix;
  totalQuestions: number;
  questions: Question[];
  examType: "multiple-choice" | "essay" | "hybrid";
  fileResourceId?: string;
  fileUri?: string;
  notes?: string;
  /** Lecturer-supplied extra guidance sent to the AI for this quiz. */
  customInstructions?: string;
  rawModelOutput?: string;
  status: "draft" | "published" | "archived";
  uniqueExamLink?: string;
  /** null = untimed. */
  durationMinutes?: number | null;
  maxScoreAttainable?: number;
  /** "relaxed" disables the fullscreen lockdown for untimed practice quizzes. */
  proctoringMode?: ProctoringMode;
  leaderboard?: LeaderboardSettings;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ProctoringMode = "strict" | "relaxed";

export interface LeaderboardSettings {
  enabled: boolean;
  visibility: "full" | "anonymized";
}

export interface Question {
  id: string;
  question: string;
  description: string;
  type: "multiple-choice" | "essay";
  difficulty?: Difficulty;
  /** Why the correct answer is correct; shown in review. */
  explanation?: string;
  options?: Option[];
  correctOptionId?: number; // Present in lecturer views, stripped for student exam attempts
  maxMarks?: number;
}

export interface Option {
  id: number;
  text: string;
}

/**
 * The shape PATCH /exam/:examId/questions accepts. The client always sends the
 * complete list in display order — that is how reorder / add / delete persist.
 */
export interface EditableQuestion {
  id: string;
  question: string;
  description: string;
  type: "multiple-choice" | "essay";
  difficulty: Difficulty;
  explanation: string;
  maxMarks: number;
  options?: Option[];
  correctOptionId?: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  displayName: string;
  score: number;
  maxScore: number;
  percentage: number;
  durationSeconds: number | null;
  isMe: boolean;
}

export interface LeaderboardResponse {
  totalGraded: number;
  myRank: number | null;
  visibility: "full" | "anonymized";
  entries: LeaderboardEntry[];
}
