export type AssessmentStat = {
  totalUniqueStudents: number;
  gradedCount: number;
  averageScore: string;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: ScoreDistribution[];
  passFailRatio: PassFailRatio[];
  categoryPerformance: CategoryPerformance[];
};

type ScoreDistribution = {
  grade: string;
  count: number;
};

type PassFailRatio = {
  status: string;
  count: number;
};

type CategoryPerformance = {
  category: string;
  averageScore: number;
};