import api from "@/lib/axios";
import type { CreateSourceBody, Resource } from "@/types/Resource";
import type { EditableQuestion, LeaderboardResponse } from "@/types/Exam";

/**
 * Normalises any source — uploaded file, web URL, YouTube video or pasted
 * text — into a Resource of type "material" holding plain text.
 *
 * A source that cannot be read comes back as HTTP 422 carrying
 * `error` (the user-facing reason) and `data` (the failed Resource), so the
 * caller can surface the problem inline against that specific source.
 */
export const createSource = async (body: CreateSourceBody) => {
  const res = await api.post("/exam/sources", body);
  return res.data.data as Resource;
};

export const deleteSource = async (resourceId: string) => {
  await api.delete(`/exam/sources/${resourceId}`);
};

/** Lists the lecturer's reusable source library for a course. */
export const listMaterials = async (role: string, courseId: string) => {
  const res = await api.get(`/resources/${role}/${courseId}/material`);
  return (res.data?.data ?? []) as Resource[];
};

export const extractTopics = async (resourceIds: string[]) => {
  const res = await api.post("/exam/extract-topics", { resourceIds });
  return res.data;
};

/**
 * Replaces the exam's whole question list. Always send the complete array in
 * display order — that is how reordering, adding and deleting are expressed.
 */
export const updateQuestions = async (
  examId: string,
  questions: EditableQuestion[]
) => {
  const res = await api.patch(`/exam/${examId}/questions`, { questions });
  return res.data;
};

export const getExamLeaderboard = async (examId: string) => {
  const res = await api.get(`/exam/${examId}/leaderboard`);
  return res.data.data as LeaderboardResponse;
};

/**
 * Persists in-progress answers so a refresh or dropped connection does not
 * lose the attempt. Fire-and-forget: never surface a failure to the student.
 */
export const autoSaveAttempt = async (
  attemptId: string,
  answers: Record<string, unknown>
) => {
  await api.post(`/exam/${attemptId}/auto-save`, { answers });
};
