import api from "@/lib/axios";
import type { Category, PbtRubric } from "@/types/Category";

/** Saves the paper-based exam rules for a category (marks per question, "answer any N"). */
export const updatePbtRubric = async (
  courseId: string,
  categoryId: string,
  pbtRubric: PbtRubric
) => {
  const res = await api.patch(
    `/courses/${courseId}/categories/${categoryId}/pbt-rubric`,
    { pbtRubric }
  );
  return res.data.data as Category;
};
