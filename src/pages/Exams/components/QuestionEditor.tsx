import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Difficulty, EditableQuestion, Option } from "@/types/Exam";

/** A multiple-choice question is meaningless with fewer than two options. */
const MIN_OPTIONS = 2;

const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];

const DIFFICULTY_VARIANT: Record<
  Difficulty,
  "secondary" | "default" | "destructive"
> = {
  easy: "secondary",
  moderate: "default",
  hard: "destructive",
};

/** Preserves the pill styling the read-only review list used before editing. */
const TYPE_PILL_CLASS =
  "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide border";

const typePillClass = (type: EditableQuestion["type"]) =>
  type === "essay"
    ? `${TYPE_PILL_CLASS} bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800`
    : `${TYPE_PILL_CLASS} bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800`;

const blankOptions = (): Option[] => [
  { id: 1, text: "" },
  { id: 2, text: "" },
];

const nextOptionId = (options: Option[]): number =>
  options.reduce((max, option) => Math.max(max, option.id), 0) + 1;

/**
 * Mints `Q<n>` one past the highest numeric suffix already in use, so a new or
 * duplicated question never collides with an existing id (the backend rejects
 * duplicates).
 */
const nextQuestionId = (questions: EditableQuestion[]): string => {
  const highest = questions.reduce((max, question) => {
    const digits = question.id.match(/\d+/);
    return digits ? Math.max(max, Number(digits[0])) : max;
  }, 0);
  return `Q${(highest || questions.length) + 1}`;
};

const roundMarks = (value: number) => Math.round(value * 100) / 100;

interface QuestionEditorProps {
  questions: EditableQuestion[];
  onChange: (next: EditableQuestion[]) => void;
  maxScoreAttainable: number;
  disabled?: boolean;
}

/**
 * Full pre-publish question editing: stem, description, options, correct
 * answer, type, difficulty, explanation, marks, plus reorder / duplicate /
 * delete / add. The parent owns the array and sends it whole to
 * PATCH /exam/:examId/questions — order in this list is the persisted order.
 */
export default function QuestionEditor({
  questions,
  onChange,
  maxScoreAttainable,
  disabled = false,
}: QuestionEditorProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const totalAllocated = roundMarks(
    questions.reduce((sum, question) => sum + (question.maxMarks || 0), 0)
  );
  const isOverBudget = totalAllocated > maxScoreAttainable;

  const patchAt = (index: number, patch: Partial<EditableQuestion>) =>
    onChange(
      questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question
      )
    );

  const setOpen = (id: string, open: boolean) =>
    setOpenIds((prev) =>
      open ? [...prev, id] : prev.filter((openId) => openId !== id)
    );

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    const moved = next[index];
    next[index] = next[target];
    next[target] = moved;
    onChange(next);
  };

  const duplicate = (index: number) => {
    const source = questions[index];
    const copy: EditableQuestion = {
      ...source,
      id: nextQuestionId(questions),
      options: source.options?.map((option) => ({ ...option })),
    };
    onChange([
      ...questions.slice(0, index + 1),
      copy,
      ...questions.slice(index + 1),
    ]);
  };

  const remove = (index: number) => {
    const removed = questions[index];
    setOpen(removed.id, false);
    onChange(questions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    const question: EditableQuestion = {
      id: nextQuestionId(questions),
      question: "",
      description: "",
      type: "multiple-choice",
      difficulty: "moderate",
      explanation: "",
      maxMarks: 0,
      options: blankOptions(),
      correctOptionId: 1,
    };
    onChange([...questions, question]);
    setOpen(question.id, true);
  };

  const changeType = (index: number, type: EditableQuestion["type"]) => {
    if (questions[index].type === type) return;
    patchAt(
      index,
      type === "essay"
        ? { type, options: undefined, correctOptionId: null }
        : { type, options: blankOptions(), correctOptionId: 1 }
    );
  };

  const setOptionText = (index: number, optionId: number, text: string) => {
    const options = (questions[index].options ?? []).map((option) =>
      option.id === optionId ? { ...option, text } : option
    );
    patchAt(index, { options });
  };

  const addOption = (index: number) => {
    const options = questions[index].options ?? [];
    patchAt(index, {
      options: [...options, { id: nextOptionId(options), text: "" }],
    });
  };

  const removeOption = (index: number, optionId: number) => {
    const question = questions[index];
    const options = (question.options ?? []).filter(
      (option) => option.id !== optionId
    );
    if (options.length < MIN_OPTIONS) return;
    patchAt(index, {
      options,
      // Deleting the answer would leave an unanswerable question behind.
      correctOptionId:
        question.correctOptionId === optionId
          ? options[0].id
          : question.correctOptionId,
    });
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="p-5 bg-card rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          This quiz has no questions yet. Add one below.
        </div>
      ) : (
        questions.map((question, index) => {
          const options = question.options ?? [];
          const canRemoveOption = options.length > MIN_OPTIONS;
          const fieldId = (field: string) => `q-${question.id}-${field}`;

          return (
            <Collapsible
              key={question.id}
              open={openIds.includes(question.id)}
              onOpenChange={(open) => setOpen(question.id, open)}
              className="p-5 bg-card rounded-xl border border-border shadow-sm hover:border-primary/20 transition-colors"
            >
              {/* ── Collapsed summary row ── */}
              <CollapsibleTrigger
                aria-label={`Edit question ${index + 1}`}
                disabled={disabled}
                className="group flex w-full items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm shrink-0 mt-0.5">
                  {index + 1}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={typePillClass(question.type)}
                    >
                      {question.type === "essay" ? "Essay" : "MCQ"}
                    </Badge>
                    <Badge
                      variant={DIFFICULTY_VARIANT[question.difficulty]}
                      className="capitalize"
                    >
                      {question.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {roundMarks(question.maxMarks || 0)}{" "}
                      {question.maxMarks === 1 ? "mark" : "marks"}
                    </span>
                  </span>

                  <span className="block truncate text-base font-semibold text-foreground">
                    {question.question || "Untitled question"}
                  </span>
                </span>

                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 mt-2 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>

              {/* ── Expanded editor ── */}
              <CollapsibleContent className="mt-4 pt-4 border-t border-border space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId("stem")}>Question</Label>
                  <Textarea
                    id={fieldId("stem")}
                    rows={2}
                    value={question.question}
                    disabled={disabled}
                    onChange={(e) =>
                      patchAt(index, { question: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={fieldId("description")}>
                    Description (optional)
                  </Label>
                  <Textarea
                    id={fieldId("description")}
                    rows={2}
                    value={question.description}
                    disabled={disabled}
                    onChange={(e) =>
                      patchAt(index, { description: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>

                {question.type === "multiple-choice" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium leading-none">
                      Options — select the correct answer
                    </p>
                    <RadioGroup
                      aria-label="Correct answer"
                      disabled={disabled}
                      value={
                        question.correctOptionId != null
                          ? String(question.correctOptionId)
                          : ""
                      }
                      onValueChange={(value) =>
                        patchAt(index, { correctOptionId: Number(value) })
                      }
                      className="gap-2"
                    >
                      {options.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <RadioGroupItem
                              id={fieldId(`correct-${option.id}`)}
                              value={String(option.id)}
                              className="shrink-0"
                            />
                            <Label
                              htmlFor={fieldId(`correct-${option.id}`)}
                              className="sr-only"
                            >
                              Mark option {optionIndex + 1} as correct
                            </Label>
                            <Input
                              value={option.text}
                              disabled={disabled}
                              aria-label={`Option ${optionIndex + 1} text`}
                              placeholder={`Option ${optionIndex + 1}`}
                              onChange={(e) =>
                                setOptionText(index, option.id, e.target.value)
                              }
                              className="h-9 min-w-0 flex-1 text-sm bg-background"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove option ${optionIndex + 1}`}
                            disabled={disabled || !canRemoveOption}
                            onClick={() => removeOption(index, option.id)}
                            className="shrink-0 self-end sm:self-auto"
                          >
                            <Trash2 aria-hidden="true" className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => addOption(index)}
                      className="gap-1.5"
                    >
                      <Plus aria-hidden="true" className="w-3.5 h-3.5" />
                      Add option
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor={fieldId("type")}>Type</Label>
                    <Select
                      value={question.type}
                      disabled={disabled}
                      onValueChange={(value) =>
                        changeType(index, value as EditableQuestion["type"])
                      }
                    >
                      <SelectTrigger id={fieldId("type")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="multiple-choice">
                            Multiple choice
                          </SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor={fieldId("difficulty")}>Difficulty</Label>
                    <Select
                      value={question.difficulty}
                      disabled={disabled}
                      onValueChange={(value) =>
                        patchAt(index, { difficulty: value as Difficulty })
                      }
                    >
                      <SelectTrigger id={fieldId("difficulty")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {DIFFICULTIES.map((level) => (
                            <SelectItem
                              key={level}
                              value={level}
                              className="capitalize"
                            >
                              {level}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor={fieldId("marks")}>Marks</Label>
                    <Input
                      id={fieldId("marks")}
                      type="number"
                      min={0}
                      step={0.5}
                      value={question.maxMarks}
                      disabled={disabled}
                      onChange={(e) =>
                        patchAt(index, {
                          maxMarks: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={fieldId("explanation")}>
                    Explanation (shown in review)
                  </Label>
                  <Textarea
                    id={fieldId("explanation")}
                    rows={2}
                    value={question.explanation}
                    disabled={disabled}
                    onChange={(e) =>
                      patchAt(index, { explanation: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>

                {/* ── Row actions ── */}
                <div className="flex flex-wrap items-center gap-1 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move question ${index + 1} up`}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp aria-hidden="true" className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move question ${index + 1} down`}
                    disabled={disabled || index === questions.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown aria-hidden="true" className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Duplicate question ${index + 1}`}
                    disabled={disabled}
                    onClick={() => duplicate(index)}
                  >
                    <Copy aria-hidden="true" className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete question ${index + 1}`}
                    disabled={disabled}
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={addQuestion}
          className="gap-2"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          Add question
        </Button>

        <p
          aria-live="polite"
          className={`text-sm ${
            isOverBudget
              ? "text-destructive font-medium"
              : "text-muted-foreground"
          }`}
        >
          {totalAllocated} / {maxScoreAttainable} marks allocated
        </p>
      </div>
    </div>
  );
}
