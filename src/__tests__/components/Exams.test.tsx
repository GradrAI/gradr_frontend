import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Exams from "@/pages/Exams/pages/Exams";
import api from "@/lib/axios";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = vi.mocked(api);

const summaryExam = {
  _id: "exam-1",
  courseId: "course-1",
  categoryId: "category-1",
  topic: "Photosynthesis",
  status: "published",
  difficulty: "easy",
  totalQuestions: 5,
  examType: "multiple-choice",
  uniqueExamLink: "https://gradrai.com/exam/abc",
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
};

const detailExam = {
  ...summaryExam,
  totalQuestions: 1,
  questions: [
    {
      id: "Q1",
      question: "What do chloroplasts contain?",
      description: "",
      type: "multiple-choice",
      options: [
        { id: 1, text: "Chlorophyll" },
        { id: 2, text: "Hemoglobin" },
      ],
      correctOptionId: 1,
      maxMarks: 10,
    },
  ],
};

function renderExams() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter>
          <Exams />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("Exams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.delete.mockResolvedValue({ data: { success: true } });
  });

  it("renders exam cards from summary payload without questions", async () => {
    mockApi.get.mockResolvedValue({
      data: { data: [summaryExam], totalCount: 1, page: 1, limit: 10 },
    });

    renderExams();

    expect(await screen.findByText("Photosynthesis")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("easy")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/exam"));
  });

  it("clicking View fetches detail and renders questions", async () => {
    mockApi.get.mockImplementation(async (url: string) => {
      if (url === "/exam") {
        return {
          data: { data: [summaryExam], totalCount: 1, page: 1, limit: 10 },
        };
      }
      if (url === "/exam/exam-1") {
        return { data: { data: detailExam } };
      }
      return { data: { data: null } };
    });

    renderExams();

    await userEvent.click(await screen.findByRole("button", { name: "View" }));

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/exam/exam-1"));
    expect(await screen.findByText("What do chloroplasts contain?")).toBeInTheDocument();
    expect(screen.getByText("A.")).toBeInTheDocument();
    expect(screen.getByText("Chlorophyll")).toBeInTheDocument();
    expect(screen.getByText("B.")).toBeInTheDocument();
    expect(screen.getByText("Hemoglobin")).toBeInTheDocument();
  });
});
