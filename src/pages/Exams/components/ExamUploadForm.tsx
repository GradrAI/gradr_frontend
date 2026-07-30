import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import notifications from "@/requests/notifications";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import formSchema, { FormSchemaType } from "../helpers/formSchema";
import { ChevronDownIcon, Loader2Icon, RefreshCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import categories from "@/data/categories";

const CBT_QUIZ_GENERATION_CREDITS = 15;
import calculateDurationMinutes from "../helpers/calculateDurationMinutes";
import { DateTime } from "luxon";
import api from "@/lib/axios";
import { CourseData, Category } from "@/types/CourseData";
import { Input } from "@/components/ui/input";
import useStore from "@/state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { extractTopics } from "@/requests/exam";
import SourcePicker from "./SourcePicker";

type ExamQuestionType = FormSchemaType["type"];

type ExamStandard = {
  id: string;
  name: string;
  description?: string;
  constraints: {
    allowedTypes: ExamQuestionType[];
    fixedOptions: number | null;
  };
};

type ExtractedTopic = { topic: string; weight: number };

type CreateExamPayload = {
  topic: string;
  courseId: string;
  categoryName: string;
  categoryType: string;
  maxScoreAttainable: number;
  type: ExamQuestionType;
  totalQuizQuestions: number;
  numberOfOptions: number;
  standard: string;
  difficulty: "easy" | "moderate" | "hard" | "mixed";
  difficultyMix?: { easy: number; moderate: number; hard: number };
  durationMinutes: number | null;
  proctoringMode: "strict" | "relaxed";
  leaderboard: { enabled: boolean; visibility: "full" | "anonymized" };
  customInstructions: string;
  resourceIds: string[];
  topicPriorities: { topic: string; weight: number; selected: boolean }[];
  availabilityStartAt?: string;
  availabilityEndAt?: string;
  mcqCount?: number;
  essayCount?: number;
};

const DIFFICULTY_LEVELS = ["easy", "moderate", "hard"] as const;

/** Surfaces the backend's user-facing `error` string when it sent one. */
const serverError = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const body: unknown = error.response?.data;
  if (typeof body === "object" && body !== null) {
    const { error: reason, message } = body as {
      error?: unknown;
      message?: unknown;
    };
    if (typeof reason === "string" && reason) return reason;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
};

const defaultStandards: ExamStandard[] = [
  {
    id: "GENERIC",
    name: "Generic / Custom",
    description: "Flexible format with no specific constraints.",
    constraints: { allowedTypes: ["multiple-choice", "essay", "hybrid"], fixedOptions: null }
  },
  {
    id: "JAMB",
    name: "JAMB (UTME)",
    description: "Joint Admissions and Matriculation Board (Nigeria)",
    constraints: { allowedTypes: ["multiple-choice"], fixedOptions: 4 }
  },
  {
    id: "WASSCE",
    name: "WASSCE (Senior)",
    description: "West African Senior School Certificate Examination",
    constraints: { allowedTypes: ["multiple-choice", "essay", "hybrid"], fixedOptions: 4 }
  },
  {
    id: "NCEE",
    name: "NCEE (Common Entrance)",
    description: "National Common Entrance Examination (Nigeria)",
    constraints: { allowedTypes: ["multiple-choice"], fixedOptions: 5 }
  }
];

interface ExamUploadFormProps {
  setAddNew: (value: boolean) => void;
}

const ExamUploadForm = ({ setAddNew }: ExamUploadFormProps) => {
  const { user, saveUser } = useStore();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [instructionsPrefilled, setInstructionsPrefilled] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      topic: "",
      difficulty: "easy",
      courseId: "",
      categoryName: "",
      categoryType: "",
      maxScoreAttainable: 0,
      totalQuizQuestions: 5,
      type: "multiple-choice",
      numberOfOptions: 4,
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
      durationMinutes: undefined,
      resourceIds: [],
      standard: "GENERIC",
      topicPriorities: [],
      hybridCount: 0,
      difficultyMode: "uniform",
      difficultyMix: undefined,
      timed: true,
      proctoringMode: "strict",
      leaderboardEnabled: false,
      leaderboardVisibility: "anonymized",
      customInstructions: "",
    },
  });

  const courseId = form.watch("courseId");
  const categoryName = form.watch("categoryName");
  const categoryType = form.watch("categoryType");
  const maxScoreAttainable = form.watch("maxScoreAttainable");
  const selectedResourceIds = form.watch("resourceIds") || [];
  const standard = form.watch("standard");
  const examType = form.watch("type");
  const topicPriorities = form.watch("topicPriorities") || [];
  const totalQuestions = form.watch("totalQuizQuestions");
  const hybridCount = form.watch("hybridCount") || 0;
  const difficultyMode = form.watch("difficultyMode");
  const timed = form.watch("timed");
  const proctoringMode = form.watch("proctoringMode");
  const leaderboardEnabled = form.watch("leaderboardEnabled");
  const customInstructions = form.watch("customInstructions");

  const courseName = courses.find((c) => c._id === courseId)?.name || "";

  const extractTopicsMutation = useMutation({
    mutationFn: async (resourceIds: string[]) => {
      const result = await extractTopics(resourceIds);
      // The endpoint is typed `unknown` in the shared client; it answers
      // { success, data: [{ topic, weight }] }.
      const payload = result as { success?: boolean; data?: ExtractedTopic[] };
      return payload.data ?? [];
    },
    onSuccess: (topics) => {
      form.setValue(
        "topicPriorities",
        topics.map((t) => ({
          topic: t.topic,
          weight: t.weight,
          selected: true,
        }))
      );
      if (topics.length) toast.success("Topics extracted from your sources!");
    },
    onError: (error: unknown) => {
      toast.error(serverError(error, "Topic extraction failed"));
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (selectedResourceIds.length > 0) {
        extractTopicsMutation.mutate(selectedResourceIds);
      } else {
        form.setValue("topicPriorities", []);
      }
    }, 1000); // 1s debounce to allow multiple selections

    return () => clearTimeout(handler);
  }, [JSON.stringify(selectedResourceIds)]);

  // Reset sources and topics when course changes to avoid cross-course selection
  useEffect(() => {
    const currentResources = form.getValues("resourceIds");
    if (currentResources && currentResources.length > 0) {
      form.setValue("resourceIds", []);
      form.setValue("topicPriorities", []);
    }
  }, [courseId, form]);

  const {
    mutate: examMutate,
    isPending: examIsPending,
  } = useMutation({
    mutationKey: ["generateQuiz"],
    mutationFn: async (payload: CreateExamPayload) =>
      await api.post<{ success?: boolean; message?: string }>("/exam", payload),
  });

  // Fetch active period
  const { data: activePeriodData } = useQuery({
    queryKey: ["activePeriod"],
    queryFn: async () => {
      const res = await api.get<{ data?: { _id: string } }>("/periods/active");
      return res.data.data ?? null;
    },
  });

  const { data: standardsResponse } = useQuery({
    queryKey: ["examStandards"],
    queryFn: async () => {
      const res = await api.get<{ data?: ExamStandard[] }>("/exam/standards");
      return res.data.data ?? null;
    },
  });

  const examStandards = standardsResponse ?? defaultStandards;
  const selectedStandardObj = examStandards.find((s) => s.id === standard);

  const { data: userSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await api.get<{
        data?: { randomizeQuestions?: boolean; customInstructions?: string };
      }>("/user/settings");
      return res.data.data ?? null;
    },
    enabled: Boolean(user?._id),
    refetchOnWindowFocus: false,
  });

  // Seed the per-quiz instructions from the lecturer's saved default, once,
  // and never over what they already typed.
  useEffect(() => {
    if (instructionsPrefilled || !userSettings) return;
    const preferred = userSettings.customInstructions;
    if (preferred && !form.getValues("customInstructions")) {
      form.setValue("customInstructions", preferred);
    }
    setInstructionsPrefilled(true);
  }, [userSettings, instructionsPrefilled, form]);

  const {
    data: coursesData,
  } = useQuery({
    queryKey: ["courses", user?._id, activePeriodData?._id],
    queryFn: async () => {
      const res = await api.get<{ data?: CourseData[] }>(
        `/courses/users?periodId=${activePeriodData?._id}`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(user?._id?.length) && !!activePeriodData?._id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData);
    }
  }, [coursesData]);

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (!timed) return;
    const diff = calculateDurationMinutes(
      startDate,
      endDate,
      startTime,
      endTime
    );
    if (diff !== null) {
      form.setValue("durationMinutes", diff);
    }
  }, [form, timed, startDate, endDate, startTime, endTime]);

  // Seeds a mix that already sums to the total when the lecturer picks Mixed,
  // and drops the field entirely otherwise — the backend forbids it when the
  // difficulty is uniform. Done on the change itself, not in an effect, so the
  // counts are in form state before the mix inputs first render.
  const handleDifficultyModeChange = (mode: "uniform" | "mixed") => {
    if (mode !== "mixed") {
      form.setValue("difficultyMix", undefined);
      return;
    }
    const total = form.getValues("totalQuizQuestions") || 0;
    const easy = Math.ceil(total / 3);
    const moderate = Math.ceil((total - easy) / 2);
    form.setValue("difficultyMix", {
      easy,
      moderate,
      hard: Math.max(0, total - easy - moderate),
    });
  };

  useEffect(() => {
    if (selectedStandardObj) {
      const { constraints } = selectedStandardObj;
      if (constraints.fixedOptions !== null) {
        form.setValue("numberOfOptions", constraints.fixedOptions);
      }
      if (constraints.allowedTypes && !constraints.allowedTypes.includes(examType)) {
        form.setValue("type", constraints.allowedTypes[0]);
      }
    }

    if (examType === "hybrid" && hybridCount > totalQuestions) {
      form.setValue("hybridCount", Math.floor(totalQuestions / 2));
    }
  }, [standard, selectedStandardObj, form, examType, totalQuestions, hybridCount]);

  const handleSelectCourse = (selection: string) => {
    if (selection === "addNew") {
      setAddNew(true);
      return;
    }
  };

  async function onSubmit(data: FormSchemaType) {
    if (!data.resourceIds?.length) {
      toast.error("Add at least one source for the quiz.");
      return;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload: CreateExamPayload = {
      topic: data.topic,
      courseId: data.courseId,
      categoryName: data.categoryName,
      categoryType: data.categoryType,
      maxScoreAttainable: data.maxScoreAttainable,
      type: data.type,
      totalQuizQuestions: data.totalQuizQuestions,
      numberOfOptions: data.numberOfOptions,
      standard: data.standard,
      difficulty: data.difficultyMode === "mixed" ? "mixed" : data.difficulty,
      durationMinutes: data.timed ? data.durationMinutes ?? null : null,
      proctoringMode: data.proctoringMode,
      leaderboard: {
        enabled: data.leaderboardEnabled,
        visibility: data.leaderboardVisibility,
      },
      customInstructions: data.customInstructions,
      resourceIds: data.resourceIds,
      topicPriorities: (data.topicPriorities ?? []).filter((tp) => tp.selected),
    };

    // Joi forbids difficultyMix unless difficulty is "mixed".
    if (data.difficultyMode === "mixed" && data.difficultyMix) {
      payload.difficultyMix = data.difficultyMix;
    }

    if (data.startDate && data.startTime) {
      const startLocal = DateTime.fromISO(
        `${DateTime.fromJSDate(data.startDate).toISODate()}T${data.startTime}`,
        { zone: tz }
      );
      payload.availabilityStartAt = startLocal.toUTC().toISO() ?? undefined;
    }

    if (data.endDate && data.endTime) {
      const endLocal = DateTime.fromISO(
        `${DateTime.fromJSDate(data.endDate).toISODate()}T${data.endTime}`,
        { zone: tz }
      );
      payload.availabilityEndAt = endLocal.toUTC().toISO() ?? undefined;
    }

    if (data.type === "hybrid") {
      payload.mcqCount = data.totalQuizQuestions - (data.hybridCount || 0);
      payload.essayCount = data.hybridCount || 0;
    }

    examMutate(payload, {
      onSuccess: (res) => {
        if (res.data?.success) {
          toast.success(notifications.QUIZ.SUCCESS);
          if (user && user.organization && typeof user.organization === "object") {
             const planName = user.organization.paymentPlan?.name?.toLowerCase();
             if (planName !== "enterprise") {
               user.organization.creditsBalance = (user.organization.creditsBalance || 0) - CBT_QUIZ_GENERATION_CREDITS;
             }
             saveUser({...user});
          }
          form.reset();
        } else {
          toast.error(res.data?.message || notifications.QUIZ.FAILURE);
        }
      },
      onError: (error: unknown) => {
        toast.error(serverError(error, notifications.QUIZ.FAILURE));
      },
    });
  }

  const org = user?.organization;
  const isEnterprise = typeof org === "object" && org?.paymentPlan?.name?.toLowerCase() === "enterprise";
  const remainingCredits = typeof org === "object" ? (org?.creditsBalance || 0) : 0;
  const requiredCredits = CBT_QUIZ_GENERATION_CREDITS; // 15 credits to generate an exam

  const isOverLimit = !isEnterprise && requiredCredits > remainingCredits + 5;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full min-w-0">
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select
                name="courseId"
                required
                onValueChange={(val) => {
                  handleSelectCourse(val);
                  field.onChange(val);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {courses?.map(({ name, _id }: CourseData) => (
                      <SelectItem key={_id} value={_id}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="addNew">Add new</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Standard / Curriculum</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectGroup>
                    {examStandards.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                Select a standard to enforce specific exam rules (e.g. JAMB is strict MCQ).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Assignment II" className="bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryType"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Category Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {categories?.map(({ name, id, value }: Category) => (
                        <SelectItem key={id} value={value}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxScoreAttainable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Score Attainable</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
                  className="bg-background"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-zinc-900/40 min-w-0">
          <h3 className="text-sm font-medium">Quiz sources</h3>
          <p className="text-[11px] text-muted-foreground">
            Upload a document, add a web link or YouTube video, or paste text.
            The quiz is generated only from the sources you add here.
          </p>

          <FormField
            control={form.control}
            name="resourceIds"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <SourcePicker
                  courseId={courseId}
                  value={field.value || []}
                  onChange={field.onChange}
                  disabled={examIsPending}
                  uploadMeta={{
                    courseName,
                    categoryName,
                    categoryType,
                    maxScoreAttainable,
                  }}
                />
                <FormDescription>
                  {selectedResourceIds.length} of 5 source(s) selected for exam
                  generation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Topic / Subject</FormLabel>
              <FormControl>
                <Input placeholder="Introduction to Mathematics" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50 min-w-0">
          <h3 className="text-sm font-medium flex flex-wrap items-center gap-2 w-full">
            Topic Prioritization
            <span className="text-[10px] font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
              AI Extracted
            </span>
            {selectedResourceIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] ml-auto gap-1 text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => extractTopicsMutation.mutate(selectedResourceIds)}
                disabled={extractTopicsMutation.isPending}
              >
                <RefreshCcw className={`w-3 h-3 ${extractTopicsMutation.isPending ? 'animate-spin' : ''}`} />
                Refetch
              </Button>
            )}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Adjust the weights to prioritize specific topics in the generated exam. Uncheck a topic to exclude it.
          </p>
          <div className="space-y-3">
            {extractTopicsMutation.isPending || (selectedResourceIds.length > 0 && topicPriorities.length === 0) ?
              <div className="space-y-4">
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
              </div>
            : selectedResourceIds.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-md bg-background/50 dark:bg-zinc-900/50">
                  <p className="text-xs text-muted-foreground italic">No sources added. Add a source above to extract topics.</p>
              </div>
            ) :
            topicPriorities.map((tp, index) => (
              <div key={tp.topic} className="flex items-center gap-3 bg-background dark:bg-zinc-900 p-2 rounded-md border shadow-sm min-w-0">
                <Checkbox
                  checked={tp.selected}
                  aria-label={`Include the topic ${tp.topic}`}
                  onCheckedChange={(checked) => {
                    const newPriorities = [...topicPriorities];
                    newPriorities[index].selected = !!checked;
                    form.setValue("topicPriorities", newPriorities);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${!tp.selected ? 'text-muted-foreground line-through' : ''}`}>
                    {tp.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <Input
                    type="number"
                    aria-label={`Weight for the topic ${tp.topic} in percent`}
                    value={tp.weight}
                    onChange={(e) => {
                      const newPriorities = [...topicPriorities];
                      newPriorities[index].weight = Number(e.target.value);
                      form.setValue("topicPriorities", newPriorities);
                    }}
                    className="h-8 text-xs min-w-0"
                    min={0}
                    max={100}
                    disabled={!tp.selected}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficultyMode"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Difficulty mode</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    const mode = val === "mixed" ? "mixed" : "uniform";
                    handleDifficultyModeChange(mode);
                    field.onChange(mode);
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background">
                    <SelectGroup>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription className="text-[11px]">
                  Mixed lets you set how many questions land at each level.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={selectedStandardObj?.constraints?.allowedTypes?.length === 1}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background">
                    <SelectGroup>
                      <SelectItem
                        value="multiple-choice"
                        disabled={selectedStandardObj && !selectedStandardObj.constraints.allowedTypes.includes("multiple-choice")}
                      >
                        Multiple Choice
                      </SelectItem>
                      <SelectItem
                        value="essay"
                        disabled={selectedStandardObj && !selectedStandardObj.constraints.allowedTypes.includes("essay")}
                      >
                        Essay
                      </SelectItem>
                      <SelectItem
                        value="hybrid"
                        disabled={selectedStandardObj && !selectedStandardObj.constraints.allowedTypes.includes("hybrid")}
                      >
                        Hybrid
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {difficultyMode === "uniform" ? (
          // Distinct keys: without them React reuses the same Controller
          // instance across the two branches and the field reports the other
          // field's value.
          <FormField
            key="difficulty"
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background">
                    <SelectGroup>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            key="difficultyMix"
            control={form.control}
            name="difficultyMix"
            render={({ field }) => {
              const mix = {
                easy: field.value?.easy ?? 0,
                moderate: field.value?.moderate ?? 0,
                hard: field.value?.hard ?? 0,
              };
              const sum = mix.easy + mix.moderate + mix.hard;
              return (
                <FormItem className="space-y-3 p-4 border rounded-lg bg-background/50 min-w-0">
                  <p className="text-sm font-medium">Questions per difficulty</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <div key={level} className="space-y-1 min-w-0">
                        <Label
                          htmlFor={`difficulty-mix-${level}`}
                          className="text-xs capitalize"
                        >
                          {level}
                        </Label>
                        <Input
                          id={`difficulty-mix-${level}`}
                          type="number"
                          min={0}
                          className="bg-background min-w-0"
                          value={mix[level]}
                          onChange={(e) =>
                            field.onChange({
                              ...mix,
                              [level]: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <p
                    aria-live="polite"
                    className={`text-xs font-medium ${
                      sum === totalQuestions
                        ? "text-muted-foreground"
                        : "text-destructive"
                    }`}
                  >
                    {`Σ ${sum} / ${totalQuestions}`}
                  </p>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <FormField
          control={form.control}
          name="totalQuizQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Questions count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-background"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    field.onChange(val);
                    if (examType === "hybrid" && (form.getValues("hybridCount") || 0) > val) {
                      form.setValue("hybridCount", Math.floor(val / 2));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {examType === "hybrid" && (
          <FormField
            control={form.control}
            name="hybridCount"
            render={({ field }) => (
              <FormItem className="space-y-4 p-4 border rounded-lg bg-orange-50/30 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 min-w-0">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <FormLabel>Theory/Essay Ratio</FormLabel>
                  <span className="text-xs font-semibold text-primary bg-background px-2 py-1 rounded-md border">
                    {totalQuestions - (field.value || 0)} MCQ / {field.value || 0} Essay
                  </span>
                </div>
                <FormControl>
                  <Slider
                    aria-label="Number of theory or essay questions"
                    min={0}
                    max={totalQuestions}
                    step={1}
                    value={[field.value || 0]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Slide to adjust the balance between multiple-choice and theory questions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 min-w-0">
            <Label>Start Date & Time</Label>
            <div className="flex gap-2 min-w-0">
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" aria-label="Start date" className="w-full min-w-0 justify-start font-normal bg-background">
                    <span className="truncate">
                      {form.watch("startDate") ? form.watch("startDate")?.toLocaleDateString() : "Date"}
                    </span>
                    <ChevronDownIcon className="ml-auto shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("startDate")}
                    onSelect={(date) => {
                      form.setValue("startDate", date);
                      setStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <Input type="time" aria-label="Start time" {...field} className="bg-background w-28 shrink-0" />
                ) }
              />
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <Label>End Date & Time</Label>
            <div className="flex gap-2 min-w-0">
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" aria-label="End date" className="w-full min-w-0 justify-start font-normal bg-background">
                    <span className="truncate">
                      {form.watch("endDate") ? form.watch("endDate")?.toLocaleDateString() : "Date"}
                    </span>
                    <ChevronDownIcon className="ml-auto shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("endDate")}
                    onSelect={(date) => {
                      form.setValue("endDate", date);
                      setEndDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <Input type="time" aria-label="End time" {...field} className="bg-background w-28 shrink-0" />
                ) }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg min-w-0">
          <FormField
            control={form.control}
            name="timed"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 min-w-0">
                <div className="space-y-1 min-w-0">
                  <FormLabel>Timed quiz</FormLabel>
                  <FormDescription className="text-[11px]">
                    Turn this off for a practice quiz with no countdown.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="shrink-0"
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue("proctoringMode", "strict");
                      } else {
                        form.setValue("durationMinutes", undefined);
                        form.setValue("proctoringMode", "relaxed");
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className="bg-background min-w-0"
                    disabled={!timed}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                {!timed && (
                  <FormDescription>
                    Students can take as long as they need.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {!timed && (
            <div className="flex items-start gap-2 min-w-0">
              <Checkbox
                id="enforce-lockdown"
                checked={proctoringMode === "strict"}
                onCheckedChange={(checked) =>
                  form.setValue(
                    "proctoringMode",
                    checked === true ? "strict" : "relaxed"
                  )
                }
              />
              <Label
                htmlFor="enforce-lockdown"
                className="text-xs font-normal leading-snug"
              >
                Still enforce fullscreen lockdown
              </Label>
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 border rounded-lg min-w-0">
          <FormField
            control={form.control}
            name="leaderboardEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 min-w-0">
                <div className="space-y-1 min-w-0">
                  <FormLabel>Show a leaderboard</FormLabel>
                  <FormDescription className="text-[11px]">
                    Students see the ranking only after they submit.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="shrink-0"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {leaderboardEnabled && (
            <FormField
              control={form.control}
              name="leaderboardVisibility"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>Leaderboard names</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background">
                      <SelectGroup>
                        <SelectItem value="anonymized">Anonymized</SelectItem>
                        <SelectItem value="full">Show names</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="customInstructions"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Extra instructions for the AI (optional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. Every question must reference a worked example from the notes."
                  className="bg-background min-w-0"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Defaults to your saved preference. Changing it here affects only
                this quiz.
              </FormDescription>
              <p
                className="text-[11px] text-muted-foreground"
                aria-live="polite"
              >
                {(customInstructions || "").length} / 2000
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {(examType === "multiple-choice" || examType === "hybrid") && (
          <FormField
            control={form.control}
            name="numberOfOptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Options per question</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="bg-background"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={selectedStandardObj?.constraints?.fixedOptions != null}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-lg border mt-8 min-w-0">
           <div className="text-sm min-w-0">
             {isEnterprise ? (
               <p className="text-foreground/90 dark:text-zinc-300">
                 Generation Quota: Unlimited (Enterprise)
               </p>
             ) : remainingCredits >= requiredCredits ? (
               <p className="text-foreground/90 dark:text-zinc-300">
                 Credit Balance: {remainingCredits} credits available (Cost: {requiredCredits} credits)
               </p>
             ) : remainingCredits >= requiredCredits - 5 ? (
               <div>
                 <p className="text-amber-600 dark:text-amber-500 font-semibold">
                   Credit Balance: {remainingCredits} credits available (Cost: {requiredCredits} credits)
                 </p>
                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                   You can use up to 5 grace credits; top up immediately after this if your balance goes negative.
                 </p>
               </div>
             ) : (
               <p className="text-red-500 font-semibold">
                 Your credit balance is exhausted. You need {requiredCredits} credits to generate an exam.
               </p>
             )}
           </div>

           <Button
             type="submit"
             disabled={examIsPending || isOverLimit}
             className="w-full md:w-auto mt-4 md:mt-0"
           >
             {examIsPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
             Generate Exam
           </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExamUploadForm;
