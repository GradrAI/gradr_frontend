import { z } from "zod";
import type { PbtRubric } from "@/types/Category";

export const MAX_PBT_QUESTIONS = 50;

/** Q1..Qn rows, keeping the marks already entered for surviving rows. */
export const resizeRubricQuestions = (
  questions: PbtRubric["questions"],
  count: number
): PbtRubric["questions"] =>
  Array.from({ length: count }, (_, index) => ({
    questionId: `Q${index + 1}`,
    maxMarks: questions[index]?.maxMarks ?? 0,
  }));

export const defaultPbtRubric = (): PbtRubric => ({
  selectionPolicy: { mode: "all" },
  questions: resizeRubricQuestions([], 1),
});

/**
 * Marks that count toward the total: every question for "answer all", or the
 * `answerCount` largest marks for "answer any N".
 */
export const countedMarks = (rubric: PbtRubric): number => {
  const marks = rubric.questions.map((q) => q.maxMarks);
  if (rubric.selectionPolicy.mode === "all") {
    return marks.reduce((sum, m) => sum + m, 0);
  }
  return [...marks]
    .sort((a, b) => b - a)
    .slice(0, rubric.selectionPolicy.answerCount)
    .reduce((sum, m) => sum + m, 0);
};

/**
 * Mirrors the backend `validatePbtRubric` rules and messages, in the same
 * order, so the teacher sees the error the server would return.
 */
export const buildPbtRubricSchema = (maxScoreAttainable: number) =>
  z
    .object({
      selectionPolicy: z.discriminatedUnion("mode", [
        z.object({ mode: z.literal("all"), answerCount: z.null().optional() }),
        z.object({ mode: z.literal("best_n"), answerCount: z.number() }),
      ]),
      questions: z.array(
        z.object({ questionId: z.string(), maxMarks: z.number() })
      ),
    })
    .superRefine((rubric, ctx) => {
      const fail = (message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      const n = rubric.questions.length;

      if (n < 1 || n > MAX_PBT_QUESTIONS) {
        return fail("PBT rubric must list between 1 and 50 questions.");
      }
      if (rubric.questions.some((q, i) => q.questionId !== `Q${i + 1}`)) {
        return fail("Question IDs must be Q1..Qn in order.");
      }
      if (rubric.questions.some((q) => !(q.maxMarks > 0))) {
        return fail("Each question needs a positive mark.");
      }
      if (rubric.selectionPolicy.mode === "best_n") {
        const { answerCount } = rubric.selectionPolicy;
        if (!Number.isInteger(answerCount) || answerCount < 1 || answerCount > n - 1) {
          return fail(
            `Answer count must be between 1 and ${n - 1} for 'answer any N'.`
          );
        }
      }
      if (!(Math.abs(countedMarks(rubric) - maxScoreAttainable) <= 0.01)) {
        return fail(
          `Question marks must add up to the maximum score (${maxScoreAttainable}).`
        );
      }
    });

/** The first rule the rubric breaks, or null when the server would accept it. */
export const validatePbtRubric = (
  rubric: PbtRubric,
  maxScoreAttainable: number
): string | null => {
  const parsed = buildPbtRubricSchema(maxScoreAttainable).safeParse(rubric);
  return parsed.success ? null : parsed.error.issues[0].message;
};
