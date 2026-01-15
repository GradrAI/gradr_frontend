import { z } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import calculateDurationMinutes from "./calculateDurationMinutes";

const formSchema = z
  .object({
    file: z
      .instanceof(FileList)
      // .refine((files) => files.length > 0, "The file is required.")
      .refine((files: FileList) => {
        return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
      }, `File size must be less than ${MAX_FILE_SIZE}MB`)
      .refine(
        (files: FileList) => {
          return Array.from(files).every((file) =>
            ACCEPTED_FILE_TYPES.includes(file.type)
          );
        },
        `File must be one of ${ACCEPTED_FILE_TYPES.join(", ")}`
      ),
    note: z.string().optional(),
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
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z
      .number()
      .min(1, "Duration must be at least 1 minute")
      .optional(),
  })
  .refine(
    (data) => {
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
        return diffMinutes !== null && data.durationMinutes >= diffMinutes;
      }
      return true; // Skip validation if fields are missing
    },
    {
      message:
        "Duration cannot be less than the time between start and end dates/times.",
      path: ["durationMinutes"], // Targets the error to this field
    }
  );

export type FormSchemaType = z.infer<typeof formSchema>;

export default formSchema;
