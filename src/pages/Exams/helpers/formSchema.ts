import { z } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import calculateDurationMinutes from "./calculateDurationMinutes";

const formSchema = z
  .object({
    file: z
      .instanceof(FileList)
      .optional()
      .refine((files: FileList | undefined) => {
        if (!files) return true;
        return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
      }, `File size must be less than ${MAX_FILE_SIZE}MB`)
      .refine(
        (files: FileList | undefined) => {
          if (!files) return true;
          return Array.from(files).every((file) =>
            ACCEPTED_FILE_TYPES.includes(file.type)
          );
        },
        `File must be one of ${ACCEPTED_FILE_TYPES.join(", ")}`
      ),
    topic: z.string().min(1, "Topic is required"),
    difficulty: z.enum(["easy", "moderate", "hard"], {
      required_error: "Difficulty is required",
    }),
    totalQuizQuestions: z
      .number()
      .positive("Must be a positive number")
      .gt(1, "Must be at least 2 questions"),
    courseId: z.string().min(1, "Course is required"),
    categoryName: z.string().min(1, "Category name is required"),
    categoryType: z.string().min(1, "Category type is required"),
    maxScoreAttainable: z
      .number()
      .positive("Must be a positive number")
      .gt(0, "Must be at least 1"),
    type: z.enum(["multiple-choice", "essay", "hybrid"], {
      required_error: "Type is required",
    }),
    numberOfOptions: z
      .number()
      .positive("Must be a positive number")
      .gt(1, "Must be at least 2 questions"),
    standard: z.string().default("GENERIC"),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z
      .number()
      .min(1, "Duration must be at least 1 minute")
      .optional(),
    resourceIds: z
      .array(z.string())
      .min(1, "Add at least one source")
      .max(5, "At most 5 sources"),
    difficultyMode: z.enum(["uniform", "mixed"]).default("uniform"),
    difficultyMix: z
      .object({
        easy: z.number().int().min(0),
        moderate: z.number().int().min(0),
        hard: z.number().int().min(0),
      })
      .optional(),
    timed: z.boolean().default(true),
    proctoringMode: z.enum(["strict", "relaxed"]).default("strict"),
    leaderboardEnabled: z.boolean().default(false),
    leaderboardVisibility: z.enum(["full", "anonymized"]).default("anonymized"),
    customInstructions: z
      .string()
      .max(2000, "Custom instructions must be 2000 characters or fewer")
      .default(""),
    topicPriorities: z.array(z.object({
      topic: z.string(),
      weight: z.number().min(0).max(100),
      selected: z.boolean().default(true),
    })).optional(),
    hybridCount: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      // An untimed quiz has no duration to check against the window.
      if (data.timed === false) return true;
      // Only validate if all time fields and durationMinutes are provided
      if (
        data.startDate &&
        data.endDate &&
        data.startTime &&
        data.endTime &&
        data.durationMinutes !== undefined
      ) {
        const diffMinutes = calculateDurationMinutes(
          data.startDate,
          data.endDate,
          data.startTime,
          data.endTime
        );
        return diffMinutes !== null && data.durationMinutes <= diffMinutes;
      }
      return true; // Skip validation if fields are missing
    },
    {
      message:
        "Duration cannot exceed the total time window between start and end dates/times.",
      path: ["durationMinutes"], // Targets the error to this field
    }
  )
  .refine(
    (data) => {
      if (data.difficultyMode !== "mixed") return true;
      if (!data.difficultyMix) return false;
      const { easy, moderate, hard } = data.difficultyMix;
      return easy + moderate + hard === data.totalQuizQuestions;
    },
    {
      message: "Difficulty counts must add up to the total number of questions",
      path: ["difficultyMix"],
    }
  )
  .refine((data) => data.timed !== true || data.durationMinutes !== undefined, {
    message: "Set a duration or turn the timer off",
    path: ["durationMinutes"],
  });

export type FormSchemaType = z.infer<typeof formSchema>;

export default formSchema;
