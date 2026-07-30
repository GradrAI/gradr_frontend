import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, AxiosHeaders } from "axios";
import Leaderboard from "@/pages/Exams/pages/Leaderboard";
import { getExamLeaderboard } from "@/requests/exam";
import type { LeaderboardResponse } from "@/types/Exam";

vi.mock("@/requests/exam", () => ({ getExamLeaderboard: vi.fn() }));

const mockGetLeaderboard = vi.mocked(getExamLeaderboard);

const renderLeaderboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app/exams/exam-1/leaderboard"]}>
        <Routes>
          <Route
            path="/app/exams/:examId/leaderboard"
            element={<Leaderboard />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const response = (
  overrides: Partial<LeaderboardResponse>
): LeaderboardResponse => ({
  totalGraded: 3,
  myRank: 2,
  visibility: "anonymized",
  entries: [
    {
      rank: 1,
      displayName: "Student #1",
      score: 90,
      maxScore: 100,
      percentage: 90,
      durationSeconds: 605,
      isMe: false,
    },
    {
      rank: 2,
      userId: "me",
      displayName: "Ada Lovelace",
      score: 75,
      maxScore: 100,
      percentage: 75,
      durationSeconds: null,
      isMe: true,
    },
    {
      rank: 3,
      displayName: "Student #3",
      score: 40,
      maxScore: 100,
      percentage: 40,
      durationSeconds: 61,
      isMe: false,
    },
  ],
  ...overrides,
});

describe("Leaderboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ranks entries, marks the requester's row and formats durations", async () => {
    mockGetLeaderboard.mockResolvedValue(response({}));
    renderLeaderboard();

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Your rank: #2")).toBeInTheDocument();

    const myRow = screen.getByText("Ada Lovelace").closest("tr");
    expect(myRow).toHaveAttribute("aria-current", "true");
    expect(myRow?.className).toContain("bg-primary/5");

    // m:ss, and an em dash when the attempt has no recorded duration.
    expect(screen.getByText("10:05")).toBeInTheDocument();
    expect(screen.getByText("1:01")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("describes the chart for screen readers using the top three", async () => {
    mockGetLeaderboard.mockResolvedValue(response({}));
    renderLeaderboard();

    const chart = await screen.findByRole("img");
    expect(chart).toHaveAccessibleName(
      "Top 3 by percentage. Student #1 90%, Ada Lovelace 75%, Student #3 40%."
    );
  });

  it("shows an empty state when nothing has been graded", async () => {
    mockGetLeaderboard.mockResolvedValue(
      response({ totalGraded: 0, myRank: null, entries: [] })
    );
    renderLeaderboard();

    expect(await screen.findByText("No graded attempts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("surfaces a 403 reason instead of crashing", async () => {
    const error = new AxiosError("Request failed");
    error.response = {
      status: 403,
      statusText: "Forbidden",
      data: { message: "Submit your attempt to see the leaderboard." },
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    };
    mockGetLeaderboard.mockRejectedValue(error);
    renderLeaderboard();

    expect(
      await screen.findByText("Submit your attempt to see the leaderboard.")
    ).toBeInTheDocument();
    expect(screen.getByText("Leaderboard unavailable")).toBeInTheDocument();
  });
});
