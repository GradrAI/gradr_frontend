import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ExamUploadForm from "@/pages/Exams/components/ExamUploadForm";
import api from "@/lib/axios";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/state", () => ({
  default: () => ({
    user: {
      _id: "lecturer-1",
      role: "lecturer",
      organization: {
        paymentPlan: { name: "pro" },
        creditsBalance: 500,
      },
    },
    saveUser: vi.fn(),
  }),
}));

const URL_SOURCE = {
  _id: "src-1",
  name: "Photosynthesis — Wikipedia",
  type: "material",
  kind: "url",
  fileUrl: null,
  charCount: 12400,
  ingestStatus: "ready",
};

/** Shape axios throws for a 422 the SourcePicker must render inline. */
const privateDriveRejection = {
  isAxiosError: true,
  response: {
    status: 422,
    data: {
      success: false,
      error:
        'This Google Drive link is private. Set link sharing to "Anyone with the link", or download the file and upload it instead.',
      data: {
        _id: "src-bad",
        name: "Private notes",
        kind: "url",
        ingestStatus: "failed",
      },
    },
  },
};

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ExamUploadForm setAddNew={vi.fn()} />
    </QueryClientProvider>
  );
}

/** Picks an option out of a Radix Select by its accessible trigger name. */
async function selectOption(
  user: UserEvent,
  triggerName: string,
  optionName: string
) {
  await user.click(screen.getByRole("combobox", { name: triggerName }));
  await user.click(await screen.findByRole("option", { name: optionName }));
}

async function chooseCourse(user: UserEvent) {
  await waitFor(() =>
    expect(screen.getByRole("combobox", { name: "Course" })).toBeEnabled()
  );
  await selectOption(user, "Course", "Biology");
}

describe("ExamUploadForm source picking and quiz options", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Radix Select relies on APIs jsdom does not implement.
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn(() => false);
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    // Radix Switch measures its thumb through ResizeObserver.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes("/periods/active")) {
        return { data: { data: { _id: "period-1" } } };
      }
      if (url.includes("/courses/users")) {
        return { data: { data: [{ _id: "course-1", name: "Biology" }] } };
      }
      if (url.includes("/user/settings")) {
        return { data: { data: { customInstructions: "Focus on definitions." } } };
      }
      if (url.includes("/material")) {
        return { data: { data: [] } };
      }
      return { data: {} };
    });

    vi.mocked(api.post).mockImplementation(async (url: string) => {
      if (url === "/exam/sources") return { data: { data: URL_SOURCE } };
      if (url === "/exam/extract-topics") {
        return {
          data: { success: true, data: [{ topic: "Light reactions", weight: 60 }] },
        };
      }
      return { data: { success: true } };
    });
  });

  it("offers all four source kinds and adds a link source with its size", async () => {
    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    expect(screen.getByRole("tab", { name: "Upload" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "YouTube" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Paste text" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Link" }));
    await user.type(
      screen.getByLabelText("Web page or document link"),
      "https://en.wikipedia.org/wiki/Photosynthesis"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/exam/sources", {
        kind: "url",
        courseId: "course-1",
        categoryId: undefined,
        url: "https://en.wikipedia.org/wiki/Photosynthesis",
      })
    );

    expect(
      await screen.findByText("Photosynthesis — Wikipedia")
    ).toBeInTheDocument();
    expect(screen.getByText("12.4k characters read")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Photosynthesis — Wikipedia" })
    ).toBeInTheDocument();
  });

  it("uploads a file as material and then registers it as a source", async () => {
    const uploaded = { ...URL_SOURCE, _id: "src-file", kind: "file" };
    vi.mocked(api.post).mockImplementation(async (url: string) => {
      if (url === "/upload") return { data: { success: true, resources: [uploaded] } };
      if (url === "/exam/sources") return { data: { data: uploaded } };
      return { data: { success: true, data: [] } };
    });

    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);
    await user.type(screen.getByLabelText("Category Name"), "Assignment II");
    await selectOption(user, "Category Type", "Assignment");

    const file = new File(["lecture notes"], "notes.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("Upload a document"), file);

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/upload", expect.any(FormData)));
    const formData = vi
      .mocked(api.post)
      .mock.calls.find(([url]) => url === "/upload")?.[1] as FormData;
    expect(formData.get("fileType")).toBe("material");
    expect(formData.get("categoryName")).toBe("Assignment II");

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/exam/sources", {
        kind: "file",
        courseId: "course-1",
        categoryId: undefined,
        resourceId: "src-file",
      })
    );
    expect(await screen.findByText("12.4k characters read")).toBeInTheDocument();
  });

  it("gates pasted text on the 200 character minimum with a live counter", async () => {
    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    await user.click(screen.getByRole("tab", { name: "Paste text" }));
    const textarea = screen.getByLabelText("Paste your material");
    expect(screen.getByText("0 / 200 minimum")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "x".repeat(199) } });
    expect(screen.getByText("199 / 200 minimum")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "y".repeat(200) } });
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/exam/sources", {
        kind: "text",
        courseId: "course-1",
        categoryId: undefined,
        text: "y".repeat(200),
      })
    );
  });

  it("lets an existing course material be reused from the library", async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes("/periods/active")) return { data: { data: { _id: "period-1" } } };
      if (url.includes("/courses/users")) {
        return { data: { data: [{ _id: "course-1", name: "Biology" }] } };
      }
      if (url.includes("/material")) return { data: { data: [URL_SOURCE] } };
      return { data: {} };
    });

    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    const checkbox = await screen.findByRole("checkbox", {
      name: /Photosynthesis — Wikipedia/,
    });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(
      screen.getByText("1 of 5 source(s) selected for exam generation.")
    ).toBeInTheDocument();
    // Reusing a library source needs no ingestion round-trip.
    expect(api.post).not.toHaveBeenCalledWith("/exam/sources", expect.anything());
  });

  it("renders a 422 failure reason inline instead of selecting the source", async () => {
    vi.mocked(api.post).mockRejectedValue(privateDriveRejection);
    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    await user.click(screen.getByRole("tab", { name: "Link" }));
    await user.type(
      screen.getByLabelText("Web page or document link"),
      "https://drive.google.com/file/d/abc/view"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("This Google Drive link is private.");
    expect(alert).toHaveClass("text-destructive");
    expect(screen.getByText("0 of 5 source(s) selected for exam generation."))
      .toBeInTheDocument();
  });

  it("switches difficulty to mixed and flags counts that miss the total", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectOption(user, "Difficulty mode", "Mixed");

    // Seeded split for the default 5 questions already balances.
    expect(screen.getByText("Σ 5 / 5")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("easy"), { target: { value: "4" } });
    await waitFor(() =>
      expect(screen.getByText("Σ 7 / 5")).toHaveClass("text-destructive")
    );

    // The single-difficulty select is gone while mixed.
    expect(
      screen.queryByRole("combobox", { name: "Difficulty" })
    ).not.toBeInTheDocument();
  });

  it("blocks a mixed quiz until the counts add up, then posts difficultyMix", async () => {
    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    await user.type(screen.getByLabelText("Category Name"), "Assignment II");
    await selectOption(user, "Category Type", "Assignment");
    fireEvent.change(screen.getByLabelText("Maximum Score Attainable"), {
      target: { value: "100" },
    });
    await user.type(screen.getByLabelText("Main Topic / Subject"), "Photosynthesis");

    await user.click(screen.getByRole("tab", { name: "Link" }));
    await user.type(
      screen.getByLabelText("Web page or document link"),
      "https://en.wikipedia.org/wiki/Photosynthesis"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("12.4k characters read");

    await user.click(screen.getByRole("switch", { name: "Timed quiz" }));
    await selectOption(user, "Difficulty mode", "Mixed");
    fireEvent.change(screen.getByLabelText("hard"), { target: { value: "4" } });

    await user.click(screen.getByRole("button", { name: /Generate Exam/ }));
    expect(
      await screen.findByText(
        "Difficulty counts must add up to the total number of questions"
      )
    ).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalledWith("/exam", expect.anything());

    fireEvent.change(screen.getByLabelText("hard"), { target: { value: "1" } });
    await user.click(screen.getByRole("button", { name: /Generate Exam/ }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/exam",
        expect.objectContaining({
          difficulty: "mixed",
          difficultyMix: { easy: 2, moderate: 2, hard: 1 },
          durationMinutes: null,
        })
      )
    );
  });

  it("turning the timer off disables duration and offers the lockdown opt-in", async () => {
    const user = userEvent.setup();
    renderForm();

    fireEvent.change(screen.getByLabelText("Duration (minutes)"), {
      target: { value: "45" },
    });
    expect(screen.getByLabelText("Duration (minutes)")).toBeEnabled();

    await user.click(screen.getByRole("switch", { name: "Timed quiz" }));

    expect(screen.getByLabelText("Duration (minutes)")).toBeDisabled();
    expect(screen.getByLabelText("Duration (minutes)")).toHaveValue(null);
    expect(
      screen.getByText("Students can take as long as they need.")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Still enforce fullscreen lockdown")
    ).not.toBeChecked();
  });

  it("posts an untimed, leaderboard-enabled quiz with the prefilled instructions", async () => {
    const user = userEvent.setup();
    renderForm();
    await chooseCourse(user);

    await user.type(screen.getByLabelText("Category Name"), "Assignment II");
    await selectOption(user, "Category Type", "Assignment");
    fireEvent.change(screen.getByLabelText("Maximum Score Attainable"), {
      target: { value: "100" },
    });
    await user.type(
      screen.getByLabelText("Main Topic / Subject"),
      "Photosynthesis"
    );

    await user.click(screen.getByRole("tab", { name: "Link" }));
    await user.type(
      screen.getByLabelText("Web page or document link"),
      "https://en.wikipedia.org/wiki/Photosynthesis"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("12.4k characters read");

    await user.click(screen.getByRole("switch", { name: "Timed quiz" }));
    await user.click(screen.getByRole("switch", { name: "Show a leaderboard" }));

    // The saved default seeds the per-quiz instruction box.
    expect(
      screen.getByLabelText("Extra instructions for the AI (optional)")
    ).toHaveValue("Focus on definitions.");

    await user.click(screen.getByRole("button", { name: /Generate Exam/ }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/exam",
        expect.objectContaining({
          courseId: "course-1",
          categoryName: "Assignment II",
          categoryType: "assignment",
          maxScoreAttainable: 100,
          topic: "Photosynthesis",
          difficulty: "easy",
          durationMinutes: null,
          proctoringMode: "relaxed",
          leaderboard: { enabled: true, visibility: "anonymized" },
          customInstructions: "Focus on definitions.",
          resourceIds: ["src-1"],
        })
      )
    );

    const examCall = vi
      .mocked(api.post)
      .mock.calls.find(([url]) => url === "/exam");
    expect(examCall?.[1]).not.toHaveProperty("difficultyMix");
  });
});
