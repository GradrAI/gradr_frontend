import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PbtRubric } from "@/types/Category";
import {
  MAX_PBT_QUESTIONS,
  countedMarks,
  resizeRubricQuestions,
  validatePbtRubric,
} from "../helpers/pbtRubricSchema";

type PbtRubricEditorProps = {
  value: PbtRubric;
  onChange: (rubric: PbtRubric) => void;
  maxScoreAttainable: number;
};

/** Exam rules for a paper-based assessment: marks per question and "answer any N". */
const PbtRubricEditor = ({
  value,
  onChange,
  maxScoreAttainable,
}: PbtRubricEditorProps) => {
  const questionCount = value.questions.length;
  const error = validatePbtRubric(value, maxScoreAttainable);

  const setQuestionCount = (raw: string) => {
    const count = Math.min(
      Math.max(Math.trunc(Number(raw)) || 0, 0),
      MAX_PBT_QUESTIONS
    );
    onChange({
      ...value,
      questions: resizeRubricQuestions(value.questions, count),
    });
  };

  const setMarks = (index: number, raw: string) => {
    onChange({
      ...value,
      questions: value.questions.map((q, i) =>
        i === index ? { ...q, maxMarks: Number(raw) } : q
      ),
    });
  };

  const setMode = (mode: string) => {
    onChange({
      ...value,
      selectionPolicy:
        mode === "best_n"
          ? { mode: "best_n", answerCount: Math.max(questionCount - 1, 1) }
          : { mode: "all" },
    });
  };

  const setAnswerCount = (raw: string) => {
    onChange({
      ...value,
      selectionPolicy: { mode: "best_n", answerCount: Number(raw) },
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="pbt-question-count">Number of questions</Label>
          <Input
            id="pbt-question-count"
            type="number"
            min={1}
            max={MAX_PBT_QUESTIONS}
            className="w-28 bg-background"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pbt-rule">Rule</Label>
          <Select value={value.selectionPolicy.mode} onValueChange={setMode}>
            <SelectTrigger id="pbt-rule" className="w-56 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Answer all questions</SelectItem>
              <SelectItem value="best_n">Answer any N</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.selectionPolicy.mode === "best_n" && (
          <div className="space-y-1">
            <Label htmlFor="pbt-answer-count">N</Label>
            <Input
              id="pbt-answer-count"
              type="number"
              min={1}
              max={Math.max(questionCount - 1, 1)}
              className="w-20 bg-background"
              value={value.selectionPolicy.answerCount}
              onChange={(e) => setAnswerCount(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.questions.map((q, index) => (
          <div key={q.questionId} className="space-y-1">
            <Label htmlFor={`pbt-marks-${q.questionId}`}>
              {q.questionId} marks
            </Label>
            <Input
              id={`pbt-marks-${q.questionId}`}
              type="number"
              min={0}
              step="any"
              className="bg-background"
              value={Number.isNaN(q.maxMarks) ? "" : q.maxMarks}
              onChange={(e) => setMarks(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Counted marks: {countedMarks(value)} of {maxScoreAttainable}
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default PbtRubricEditor;
