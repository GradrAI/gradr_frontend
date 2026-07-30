import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ExamComponent from "@/pages/Student/pages/ExamComponent";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/requests/exam", () => ({
  autoSaveAttempt: vi.fn().mockResolvedValue(undefined),
}));

const mockApi = vi.mocked(api);

const questions = [
  {
    id: "Q1",
    question: "What is 2 + 2?",
    description: "",
    type: "multiple-choice",
    options: [
      { id: 1, text: "3" },
      { id: 2, text: "4" },
    ],
  },
  {
    id: "Q2",
    question: "What is 3 + 3?",
    description: "",
    type: "multiple-choice",
    options: [
      { id: 1, text: "6" },
      { id: 2, text: "7" },
    ],
  },
];

const preview = (overrides: Record<string, unknown>) => ({
  data: {
    data: {
      examId: "exam-1",
      title: "Algebra Quiz",
      difficulty: "easy",
      totalQuestions: 2,
      examType: "multiple-choice",
      hasAttempted: false,
      durationMinutes: null,
      proctoringMode: "relaxed",
      leaderboard: { enabled: false },
      ...overrides,
    },
  },
});

const renderExam = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[
          { pathname: "/student/quiz", state: { courseId: "c1", uniqueCode: "u1" } },
        ]}
      >
        <ExamComponent />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const beginExam = async () => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: /^Begin/ }));
  return user;
};

const delay = (ms: number) => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

const submitCount = () =>
  mockApi.post.mock.calls.filter(([url]) => String(url).endsWith("/submit"))
    .length;

describe("ExamComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.post.mockImplementation(async (url: string) => {
      if (url.endsWith("/start")) {
        return {
          data: { data: { exam: { questions }, attemptId: "attempt-1" } },
        };
      }
      return { data: { data: {} } };
    });
  });

  it("shows 'No time limit' for an untimed quiz, in preview and in the header", async () => {
    mockApi.get.mockResolvedValue(preview({}));
    renderExam();

    expect(await screen.findAllByText("No time limit")).toHaveLength(1);

    await beginExam();

    expect(await screen.findByText("No time limit")).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("does NOT auto-submit a relaxed quiz when the student leaves the tab", async () => {
    mockApi.get.mockResolvedValue(preview({}));
    renderExam();
    await beginExam();
    await screen.findByText("What is 2 + 2?");

    // Past any lockdown grace period.
    await delay(1700);
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("blur"));
    document.dispatchEvent(new Event("fullscreenchange"));

    await delay(50);
    expect(submitCount()).toBe(0);
  });

  it("auto-submits a strictly proctored quiz exactly once on tab switch", async () => {
    mockApi.get.mockResolvedValue(
      preview({ durationMinutes: 30, proctoringMode: "strict" })
    );
    renderExam();
    await beginExam();
    await screen.findByText("What is 2 + 2?");

    await delay(1700);
    // Leaving the tab typically fires all three at once; that must still be
    // a single submission.
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("blur"));
    document.dispatchEvent(new Event("fullscreenchange"));

    await waitFor(() => expect(submitCount()).toBe(1));

    document.dispatchEvent(new Event("visibilitychange"));
    await delay(50);
    expect(submitCount()).toBe(1);
  });

  it("auto-submits exactly once when a timed quiz runs out", async () => {
    // 0.05 minutes = a 3-second countdown, so the expiry branch is reachable
    // in a test without faking timers around react-query.
    mockApi.get.mockResolvedValue(
      preview({ durationMinutes: 0.05, proctoringMode: "strict" })
    );
    renderExam();
    await beginExam();
    await screen.findByText("What is 2 + 2?");
    expect(screen.getByRole("timer")).toBeInTheDocument();

    await waitFor(() => expect(submitCount()).toBe(1), { timeout: 6000 });

    await delay(1500);
    expect(submitCount()).toBe(1);
  });

  it("never reaches the expiry branch for an untimed quiz", async () => {
    mockApi.get.mockResolvedValue(preview({}));
    renderExam();
    await beginExam();
    await screen.findByText("What is 2 + 2?");

    // remainingSeconds stays at 0, so the tick effect must bail out rather
    // than treat "0 seconds left" as "time is up".
    await delay(3200);
    expect(submitCount()).toBe(0);
  });

  it("renders a question navigator that reports answered state and jumps", async () => {
    mockApi.get.mockResolvedValue(preview({}));
    renderExam();
    const user = await beginExam();
    await screen.findByText("What is 2 + 2?");

    expect(
      screen.getByRole("button", { name: "Question 1, not answered" })
    ).toHaveAttribute("aria-current", "true");
    const second = screen.getByRole("button", { name: "Question 2, not answered" });

    await user.click(screen.getByLabelText("4"));
    expect(
      screen.getByRole("button", { name: "Question 1, answered" })
    ).toBeInTheDocument();

    await user.click(second);
    expect(await screen.findByText("What is 3 + 3?")).toBeInTheDocument();
  });

  it("offers a leaderboard link after submitting when the leaderboard is enabled", async () => {
    mockApi.get.mockResolvedValue(preview({ leaderboard: { enabled: true } }));
    renderExam();
    const user = await beginExam();
    await screen.findByText("What is 2 + 2?");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Submit Exam" }));

    const link = await screen.findByRole("link", { name: "View leaderboard" });
    expect(link).toHaveAttribute(
      "href",
      "/student/quiz/exam-1/leaderboard"
    );
  });
});
