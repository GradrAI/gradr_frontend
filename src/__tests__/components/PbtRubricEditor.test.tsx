import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import PbtRubricEditor from "@/pages/Grader/components/PbtRubricEditor";
import {
  defaultPbtRubric,
  resizeRubricQuestions,
  validatePbtRubric,
} from "@/pages/Grader/helpers/pbtRubricSchema";
import type { PbtRubric } from "@/types/Category";

const Harness = ({
  initial,
  maxScoreAttainable,
}: {
  initial: PbtRubric;
  maxScoreAttainable: number;
}) => {
  const [rubric, setRubric] = useState(initial);
  return (
    <PbtRubricEditor
      value={rubric}
      onChange={setRubric}
      maxScoreAttainable={maxScoreAttainable}
    />
  );
};

const bestFourOfFive = (marks: number): PbtRubric => ({
  selectionPolicy: { mode: "best_n", answerCount: 4 },
  questions: resizeRubricQuestions([], 5).map((q) => ({ ...q, maxMarks: marks })),
});

describe("PbtRubricEditor", () => {
  it("accepts best 4 of 5 at 15 marks each against a maximum of 60", async () => {
    const user = userEvent.setup();
    render(<Harness initial={bestFourOfFive(0)} maxScoreAttainable={60} />);

    for (let i = 1; i <= 5; i++) {
      const input = screen.getByLabelText(`Q${i} marks`);
      await user.clear(input);
      await user.type(input, "15");
    }

    expect(screen.getByText("Counted marks: 60 of 60")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the add-up error for best 4 of 5 at 15 marks against a maximum of 75", () => {
    render(<Harness initial={bestFourOfFive(15)} maxScoreAttainable={75} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Question marks must add up to the maximum score (75)."
    );
  });

  it("generates Q1..Qn rows from the question count", () => {
    render(<Harness initial={defaultPbtRubric()} maxScoreAttainable={60} />);

    fireEvent.change(screen.getByLabelText("Number of questions"), {
      target: { value: "3" },
    });

    expect(screen.getByLabelText("Q3 marks")).toBeInTheDocument();
    expect(screen.queryByLabelText("Q4 marks")).not.toBeInTheDocument();
  });
});

describe("validatePbtRubric", () => {
  const all = (marks: number[]): PbtRubric => ({
    selectionPolicy: { mode: "all" },
    questions: marks.map((maxMarks, i) => ({ questionId: `Q${i + 1}`, maxMarks })),
  });

  it("mirrors each backend message", () => {
    expect(validatePbtRubric(all([]), 10)).toBe(
      "PBT rubric must list between 1 and 50 questions."
    );
    expect(validatePbtRubric(all(Array(51).fill(1)), 51)).toBe(
      "PBT rubric must list between 1 and 50 questions."
    );
    expect(
      validatePbtRubric(
        { ...all([5, 5]), questions: [{ questionId: "Q2", maxMarks: 5 }, { questionId: "Q1", maxMarks: 5 }] },
        10
      )
    ).toBe("Question IDs must be Q1..Qn in order.");
    expect(validatePbtRubric(all([5, 0]), 5)).toBe(
      "Each question needs a positive mark."
    );
    expect(
      validatePbtRubric(
        { ...all([5, 5, 5]), selectionPolicy: { mode: "best_n", answerCount: 3 } },
        15
      )
    ).toBe("Answer count must be between 1 and 2 for 'answer any N'.");
    expect(validatePbtRubric(all([5, 5]), 10.005)).toBeNull();
    expect(validatePbtRubric(all([5, 5]), 11)).toBe(
      "Question marks must add up to the maximum score (11)."
    );
  });
});
