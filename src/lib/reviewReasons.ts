/** Teacher-facing labels for the backend finalizer's review codes. */
const REVIEW_REASON_LABELS: Record<string, string> = {
  missing_question_score: "A question could not be graded",
  score_exceeds_question_max: "AI score exceeded the question maximum (capped)",
  total_exceeds_exam_max: "Total exceeded the exam maximum (capped)",
  low_confidence: "AI was unsure",
  invalid_confidence: "AI returned an invalid confidence",
  transcription_warning: "Handwriting was hard to read",
  extraction_error: "Part of the script could not be read",
  referee_flagged: "The checker flagged an inconsistency",
  rubric_not_configured: "Marks per question are not set for this assessment",
  unexpected_question_score: "AI graded a question not in the exam rules",
  duplicate_question_score: "AI returned a question twice",
  negative_question_score: "AI returned a negative score (set to 0)",
  missing_question_max: "A question has no maximum mark",
  missing_answer_key: "A multiple-choice question has no answer key",
  agent_failed: "AI grading failed",
  theory_grading_pending: "Offline essay grading has not synced yet",
};

/** `code` or `code:Q3` → "<label>" or "<label> (Q3)". Unknown codes show as-is. */
export const formatReviewReason = (reason: string): string => {
  const separator = reason.indexOf(":");
  const code = separator === -1 ? reason : reason.slice(0, separator);
  const questionId = separator === -1 ? "" : reason.slice(separator + 1);
  const label = REVIEW_REASON_LABELS[code] ?? code;
  return questionId ? `${label} (${questionId})` : label;
};
