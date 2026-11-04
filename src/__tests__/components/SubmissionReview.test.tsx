import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubmissionReview from "@/pages/Exams/pages/SubmissionReview";
import api from "@/lib/axios";
import type { AttemptReview } from "@/types/Attempt";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = vi.mocked(api);

const review: AttemptReview = {
  attempt: {
    answers: { Q1: "2", Q2: "Plants use sunlight to make food" },
    status: "pending_review",
    submittedAt: "2026-11-04T10:00:00.000Z",
  },
  exam: {
    maxScoreAttainable: 12,
    vivaEnabled: true,
    questions: [
      {
        id: "Q1",
        question: "What is 2 + 2?",
        description: "",
        type: "multiple-choice",
        options: [
          { id: 1, text: "3" },
          { id: 2, text: "4" },
        ],
        correctOptionId: 2,
        maxMarks: 2,
      },
      {
        id: "Q2",
        question: "Explain photosynthesis.",
        description: "",
        type: "essay",
        maxMarks: 10,
        modelAnswer: "Light energy becomes chemical energy.",
      },
    ],
  },
  result: {
    _id: "result-1",
    studentId: "",
    score: "10/12",
    results: [
      { questionId: "Q1", score: 2, maxScore: 2, explanation: "Correct.", feedback: "" },
      {
        questionId: "Q2",
        score: 10,
        maxScore: 10,
        explanation: "Mentions sunlight.",
        feedback: "Name the products.",
      },
    ],
    explanation: "",
    feedback: "",
    lecturerId: "lecturer-1",
    lecturerComment: null,
    status: "PENDING_REVIEW",
    gradingMeta: { validationErrors: ["score_exceeds_question_max:Q2"] },
    createdAt: "2026-11-04T10:01:00.000Z",
    updatedAt: "2026-11-04T10:01:00.000Z",
  },
  viva: [
    {
      _id: "viva-1",
      attemptId: "attempt-1",
      questionId: "Q2",
      status: "processed",
      languagesRequested: ["en", "pcm"],
      chosenLanguage: "pcm",
      transcriptSource: "sahara",
      transcript: "Di plant dey use sunlight make food",
      recordingCount: 1,
      grade: { score: 6, maxScore: 10, explanation: "Partial.", feedback: "" },
      followUp: { question: "What gas do plants release?" },
    },
  ],
};

const renderReview = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app/exams/exam-1/submissions/attempt-1"]}>
        <Routes>
          <Route
            path="/app/exams/:examId/submissions/:attemptId"
            element={<SubmissionReview />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("SubmissionReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: { success: true, data: review } });
    mockApi.patch.mockResolvedValue({ data: { success: true } });
  });

  it("shows the review reasons and the viva transcript", async () => {
    renderReview();

    expect(
      await screen.findByText(
        "AI score exceeded the question maximum (capped) (Q2)"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("“Di plant dey use sunlight make food”")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What gas do plants release?", { exact: false })
    ).toBeInTheDocument();
    expect(mockApi.get).toHaveBeenCalledWith("/exam/attempts/attempt-1/review");
  });

  it("approve sends the per-question body", async () => {
    const user = userEvent.setup();
    renderReview();

    const q2Score = await screen.findByLabelText("Score for Q2");
    await waitFor(() => expect(q2Score).toHaveValue(10));
    await user.clear(q2Score);
    await user.type(q2Score, "7");
    await user.type(screen.getByLabelText("Comment for the student (optional)"), "Good effort");

    await user.click(screen.getByRole("button", { name: "Approve scores" }));

    await waitFor(() =>
      expect(mockApi.patch).toHaveBeenCalledWith("/results/result-1", {
        results: [
          { questionId: "Q1", score: 2, feedback: "" },
          { questionId: "Q2", score: 7, feedback: "Name the products." },
        ],
        lecturerComment: "Good effort",
      })
    );
  });

  it("blocks approval when a score is above the question maximum", async () => {
    const user = userEvent.setup();
    renderReview();

    const q1Score = await screen.findByLabelText("Score for Q1");
    await waitFor(() => expect(q1Score).toHaveValue(2));
    await user.clear(q1Score);
    await user.type(q1Score, "3");

    expect(screen.getByText("Enter a score between 0 and 2.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve scores" })).toBeDisabled();
  });
});
