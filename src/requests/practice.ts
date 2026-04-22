import api from "@/lib/axios";

export const startPracticeSession = async (payload: { examType: string, subjects: string[], mode: string, questionCount: number }) => {
    return await api.post("/practice/sessions", payload);
};

export const getPracticeSessions = async (status?: string, limit = 10, page = 1) => {
    return await api.get("/practice/sessions", {
        params: { status, limit, page }
    });
};

export const getPracticeSessionById = async (sessionId: string) => {
    return await api.get(`/practice/sessions/${sessionId}`);
};

export const submitPracticeSession = async (sessionId: string, answers: { pastQuestionId: string, studentAnswer: string, timeSpentMs: number }[]) => {
    return await api.post(`/practice/sessions/${sessionId}/submit`, { answers });
};

export const pollExplanations = async (sessionId: string) => {
    return await api.get(`/practice/sessions/${sessionId}/explanations`);
};
