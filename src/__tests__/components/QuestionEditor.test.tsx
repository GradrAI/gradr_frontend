import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import QuestionEditor from "@/pages/Exams/components/QuestionEditor";
import type { EditableQuestion } from "@/types/Exam";

const mcq = (id: string, overrides: Partial<EditableQuestion> = {}) =>
  ({
    id,
    question: `Stem ${id}`,
    description: "",
    type: "multiple-choice",
    difficulty: "moderate",
    explanation: "",
    maxMarks: 10,
    options: [
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ],
    correctOptionId: 1,
    ...overrides,
  }) satisfies EditableQuestion;

const onChange = vi.fn<(next: EditableQuestion[]) => void>();

/** Renders, then opens the editor body for the question at `index`. */
const renderAndExpand = async (
  questions: EditableQuestion[],
  index = 0,
  maxScoreAttainable = 100
) => {
  const user = userEvent.setup();
  render(
    <QuestionEditor
      questions={questions}
      onChange={onChange}
      maxScoreAttainable={maxScoreAttainable}
    />
  );
  await user.click(
    screen.getByRole("button", { name: `Edit question ${index + 1}` })
  );
  return user;
};
describe("QuestionEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Radix Select relies on APIs jsdom does not implement.
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn(() => false);
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it("summarises each question with its type, difficulty and marks", () => {
    render(
      <QuestionEditor
        questions={[mcq("Q1"), mcq("Q2", { type: "essay", options: undefined, correctOptionId: null, difficulty: "hard" })]}
        onChange={onChange}
        maxScoreAttainable={100}
      />
    );

    expect(
      screen.getByRole("button", { name: "Edit question 1" })
    ).toBeInTheDocument();
    expect(screen.getByText("MCQ")).toBeInTheDocument();
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("hard")).toBeInTheDocument();
    expect(screen.getByText("20 / 100 marks allocated")).toBeInTheDocument();
  });

  it("flags an over-budget total", () => {
    render(
      <QuestionEditor
        questions={[mcq("Q1", { maxMarks: 80 })]}
        onChange={onChange}
        maxScoreAttainable={50}
      />
    );
    expect(screen.getByText("80 / 50 marks allocated")).toHaveClass(
      "text-destructive"
    );
  });

  it("edits the stem through onChange", async () => {
    const user = await renderAndExpand([mcq("Q1")]);
    await user.type(screen.getByLabelText("Question"), "!");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "Q1", question: "Stem Q1!" }),
    ]);
  });

  it("changes the correct answer via the radio group", async () => {
    const user = await renderAndExpand([mcq("Q1")]);
    const group = screen.getByRole("radiogroup", { name: "Correct answer" });
    await user.click(within(group).getByRole("radio", { name: /option 2/i }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ correctOptionId: 2 }),
    ]);
  });

  it("adds an option with an id past the current maximum", async () => {
    const user = await renderAndExpand([mcq("Q1")]);
    await user.click(screen.getByRole("button", { name: "Add option" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        options: [
          { id: 1, text: "A" },
          { id: 2, text: "B" },
          { id: 3, text: "" },
        ],
      }),
    ]);
  });

  it("disables option removal at the two-option minimum", async () => {
    await renderAndExpand([mcq("Q1")]);
    expect(screen.getByRole("button", { name: "Remove option 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove option 2" })).toBeDisabled();
  });

  it("reassigns the correct answer when the correct option is removed", async () => {
    const user = await renderAndExpand([
      mcq("Q1", {
        options: [
          { id: 1, text: "A" },
          { id: 2, text: "B" },
          { id: 3, text: "C" },
        ],
        correctOptionId: 1,
      }),
    ]);
    await user.click(screen.getByRole("button", { name: "Remove option 1" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        correctOptionId: 2,
        options: [
          { id: 2, text: "B" },
          { id: 3, text: "C" },
        ],
      }),
    ]);
  });

  it("clears options when the type switches to essay", async () => {
    const user = await renderAndExpand([mcq("Q1")]);
    await user.click(screen.getByLabelText("Type"));
    await user.click(screen.getByRole("option", { name: "Essay" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        type: "essay",
        options: undefined,
        correctOptionId: null,
      }),
    ]);
  });

  it("seeds two options when the type switches back to multiple-choice", async () => {
    const user = await renderAndExpand([
      mcq("Q1", { type: "essay", options: undefined, correctOptionId: null }),
    ]);
    await user.click(screen.getByLabelText("Type"));
    await user.click(screen.getByRole("option", { name: "Multiple choice" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        type: "multiple-choice",
        correctOptionId: 1,
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
        ],
      }),
    ]);
  });

  it("moves a question down and disables the boundary controls", async () => {
    const user = await renderAndExpand([mcq("Q1"), mcq("Q2")], 0);
    expect(
      screen.getByRole("button", { name: "Move question 1 up" })
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Move question 1 down" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "Q2" }),
      expect.objectContaining({ id: "Q1" }),
    ]);
  });

  it("duplicates a question next to the original with a fresh id", async () => {
    const user = await renderAndExpand([mcq("Q1"), mcq("Q2")], 0);
    await user.click(screen.getByRole("button", { name: "Duplicate question 1" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "Q1" }),
      expect.objectContaining({ id: "Q3", question: "Stem Q1" }),
      expect.objectContaining({ id: "Q2" }),
    ]);
  });

  it("deletes a question", async () => {
    const user = await renderAndExpand([mcq("Q1"), mcq("Q2")], 1);
    await user.click(screen.getByRole("button", { name: "Delete question 2" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "Q1" }),
    ]);
  });

  it("appends a blank multiple-choice question past the highest id", async () => {
    const user = userEvent.setup();
    render(
      <QuestionEditor
        questions={[mcq("Q1"), mcq("Q7")]}
        onChange={onChange}
        maxScoreAttainable={100}
      />
    );
    await user.click(screen.getByRole("button", { name: "Add question" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "Q1" }),
      expect.objectContaining({ id: "Q7" }),
      {
        id: "Q8",
        question: "",
        description: "",
        type: "multiple-choice",
        difficulty: "moderate",
        explanation: "",
        maxMarks: 0,
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
        ],
        correctOptionId: 1,
      },
    ]);
  });

  it("updates marks from the number input", async () => {
    const user = await renderAndExpand([mcq("Q1", { maxMarks: 0 })]);
    await user.type(screen.getByLabelText("Marks"), "5");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ maxMarks: 5 }),
    ]);
  });
});
