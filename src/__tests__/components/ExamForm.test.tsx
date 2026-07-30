import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import ExamForm from "@/pages/Exams/components/ExamForm";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// ExamUploadForm is a sibling concern (source picking); stub it out so this
// file exercises only the generated-quiz review + question-editing flow.
vi.mock("@/pages/Exams/components/ExamUploadForm", () => ({
  default: () => <div data-testid="upload-form" />,
}));

vi.mock("@posthog/react", () => ({ usePostHog: () => ({ capture: vi.fn() }) }));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const EXAM = {
  _id: "exam-1",
  maxScoreAttainable: 100,
  questions: [
    {
      id: "Q1",
      question: "What is photosynthesis?",
      description: "",
      type: "multiple-choice",
      difficulty: "easy",
      explanation: "",
      maxMarks: 10,
      options: [
        { id: 1, text: "A" },
        { id: 2, text: "B" },
      ],
      correctOptionId: 1,
    },
  ],
};

/** Seeds the ["generateQuiz"] mutation ExamForm reads via useMutationState. */
function SeedGeneration() {
  const { mutate } = useMutation({
    mutationKey: ["generateQuiz"],
    mutationFn: async () => ({ data: { data: { examId: "exam-1" } } }),
  });
  useEffect(() => mutate(), [mutate]);
  return null;
}

describe("ExamForm question editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn(() => false);
    vi.mocked(api.get).mockImplementation(async (url: string) =>
      url.includes("/exam/")
        ? { data: { data: EXAM } }
        : { data: { data: { _id: "period-1" } } }
    );
    vi.mocked(api.patch).mockResolvedValue({ data: { success: true } });
  });

  it("renders the editor, saves edits and gates publish on dirty state", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SeedGeneration />
          <ExamForm />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Review Generated Quiz");
    await screen.findByRole("button", { name: "Edit question 1" });

    const save = screen.getByRole("button", { name: /Save changes/i });
    const publish = screen.getByRole("button", { name: /Publish Quiz/i });
    expect(save).toBeDisabled();
    expect(publish).toBeEnabled();

    // Budget bar reflects the questions array, not a marks map.
    expect(screen.getByText("10 / 100 marks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit question 1" }));
    await user.type(screen.getByLabelText("Question"), "?");

    await waitFor(() => expect(save).toBeEnabled());
    expect(publish).toBeDisabled();

    await user.click(save);

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/exam/exam-1/questions", {
        questions: [
          expect.objectContaining({
            id: "Q1",
            question: "What is photosynthesis??",
            difficulty: "easy",
            explanation: "",
            maxMarks: 10,
            correctOptionId: 1,
          }),
        ],
      })
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Questions saved.")
    );
  });

  it("surfaces the backend's precise failure message", async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockRejectedValue(
      Object.assign(new Error("Request failed"), {
        isAxiosError: true,
        response: { data: { message: "Total marks exceed the maximum score" } },
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SeedGeneration />
          <ExamForm />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByRole("button", { name: "Edit question 1" });
    await user.click(screen.getByRole("button", { name: "Edit question 1" }));
    await user.type(screen.getByLabelText("Marks"), "0");
    await user.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Total marks exceed the maximum score"
      )
    );
  });
});
