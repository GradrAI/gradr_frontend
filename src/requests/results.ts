import api from "@/lib/axios";
import type { QuestionScoreEdit } from "@/types/Attempt";

/**
 * Saves the teacher's per-question scores. The backend re-totals them under
 * the exam rules and, for a result awaiting review, marks it COMPLETED.
 */
export const approveQuestionScores = async (
  resultId: string,
  results: QuestionScoreEdit[],
  lecturerComment: string
) => {
  const res = await api.patch(`/results/${resultId}`, {
    results,
    lecturerComment,
  });
  return res.data;
};
