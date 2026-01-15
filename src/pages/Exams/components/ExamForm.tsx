import { z } from "zod";
import { CheckCircle, Loader2Icon, Paperclip } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CourseData, Category } from "@/types/CourseData";
import categories from "@/data/categories";
import { AxiosResponse } from "axios";
import useStore from "@/state";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTime } from "luxon";
import calculateDurationMinutes from "../helpers/calculateDurationMinutes";
import formSchema, { FormSchemaType } from "../helpers/formSchema";

export interface ExamData {
  id: string;
  question: string;
  description: string;
  options: { id: string; text: string }[];
}

export default function ExamForm() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [mode, setMode] = useState<"note" | "file">("note");
  const [addNew, setAddNew] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [courseName, setCourseName] = useState("");
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  // modal states
  const [open, setOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const {
    data: examData,
    mutate: examMutate,
    isPending: examIsPending,
    isError: examIsError,
    isSuccess: examIsSuccess,
  } = useMutation({
    mutationKey: ["generateQuiz"],
    mutationFn: async (data: any) => await api.post("/exam", data),
  });

  const { isPending: isCoursePending, mutate: courseMutate } = useMutation({
    mutationKey: ["courses"],
    mutationFn: async (data: any) => await api.post(`/courses`, data),
  });

  const {
    data: coursesData,
    isLoading: coursesIsLoading,
    isSuccess: coursesIsSuccess,
    isError: coursesIsError,
  } = useQuery<AxiosResponse<CourseData[]>>({
    queryKey: ["courses", user?._id],
    queryFn: async () => await api.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const {
    data: publishExamData,
    mutate: publishExam,
    isPending: publishExamIsPending,
  } = useMutation({
    mutationKey: ["publishExam"],
    mutationFn: async () =>
      await api.post("/exam/publish", {
        examId: examData?.data?.data?.examId,
      }),
    onMutate: () => toast.success(`Publishing exam...`),
    onSuccess: () => setOpen(true),
    onError: (err: any) =>
      toast.error(err?.message || "Unable to publish exam"),
  });

  useEffect(() => {
    if (coursesIsSuccess && coursesData) setCourses(coursesData.data);
    if (!coursesData) console.log("No exam record for current user");
  }, [coursesIsSuccess, coursesData]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      note: "",
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
    },
  });

  const fileRef = form.register("file");

  // Compute durationMinutes when start/end times change
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    const diff = calculateDurationMinutes(
      startDate,
      endDate,
      startTime,
      endTime
    );
    if (diff !== null) {
      form.setValue("durationMinutes", diff);
    }
  }, [startDate, endDate, startTime, endTime]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("data: ", data);

    if (mode === "file" && !data?.file?.length) return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formData = new FormData();

    if (data.startDate && data.startTime) {
      const startLocal = DateTime.fromISO(
        `${data.startDate.toISOString().split("T")[0]}T${data.startTime}`,
        {
          zone: tz,
        }
      );
      const startUtc = startLocal.toUTC().toISO();
      if (startUtc) formData.append("availabilityStartAt", startUtc);
    }

    if (data.endDate && data.endTime) {
      const endLocal = DateTime.fromISO(
        `${data.endDate.toISOString().split("T")[0]}T${data.endTime}`,
        {
          zone: tz,
        }
      );
      const endUtc = endLocal.toUTC().toISO();
      if (endUtc) formData.append("availabilityEndAt", endUtc);
    }

    if (data.durationMinutes) {
      formData.append("durationMinutes", String(data.durationMinutes));
    }

    for (const [key, val] of Object.entries(data)) {
      if (
        key === "startDate" ||
        key === "endDate" ||
        key === "startTime" ||
        key === "endTime" ||
        key === "durationMinutes"
      )
        continue; // Skip these as they are handled above
      if (typeof val === "string" || typeof val === "number") {
        formData.append(key, String(val));
      }
    }

    const { file } = data;
    for (const fileItem of Array.from(file)) {
      formData.append("file", fileItem);
    }

    console.log("formData: ", formData);

    examMutate(formData, {
      onSuccess: (data: any, variables: any, context: any) => {
        console.log("data: ", data);
        if (data?.success) {
          toast.success(notifications.QUIZ.SUCCESS);
          form.reset();
        } else {
          toast.error(data?.message || notifications.QUIZ.FAILURE);
        }
      },
      onError: (error: any, variables: any, context: any) => {
        console.log("error", error);
        toast.error(notifications.QUIZ.FAILURE);
      },
    });
  }

  const handleSelectCourse = (selection: string) => {
    if (selection === "addNew") {
      setAddNew(true);
      return;
    }
  };

  const handleAddCourse = () => {
    if (!user?._id?.length) {
      toast.error(notifications.EXAM.FAILURE);
      return;
    }
    courseMutate(
      {
        lecturerId: user?._id,
        name: courseName,
      },
      {
        onSuccess: (
          data: AxiosResponse<CourseData>,
          variables: any,
          context: any
        ) => {
          if (data?.status === 201) {
            toast.success("Added course successfully");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setCourses((prev) => [...prev, data.data]);
            setAddNew(false);
            handleSelectCourse(data.data.name);
          }
        },
        onError: (error: any, variables: any, context: any) => {
          console.log("error", error);
        },
      }
    );
  };

  const SharedForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
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
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
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
        <div className="flex gap-1 flex-wrap justify-between items-center">
          <FormField
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <FormItem className="w-3/6">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Assignment II"
                    className="inline-block bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryType"
            render={({ field }) => (
              <FormItem className="w-2/6">
                <FormLabel>Category Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxScoreAttainable"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Maximum Score Attainable</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
                  className="inline-block bg-white"
                  {...field}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "file" ? (
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload file</FormLabel>
                <FormControl>
                  <Input
                    id="file"
                    placeholder="Select file"
                    type="file"
                    {...fileRef}
                    multiple={false}
                    className="bg-white"
                  />
                </FormControl>
                <FormDescription>
                  Files must be PDF and of size less than 50MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your note here..."
                    className="bg-white rounded-md border p-2"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Paste the text content you want to generate the quiz from.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input
                  placeholder="Introduction to Mathematics"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-1 flex-wrap justify-between items-center">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="w-2/5">
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a difficulty level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel>Select difficulty level</SelectLabel>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Default is "Easy".</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-2/5">
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select quiz type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel>Select quiz type</SelectLabel>
                        <SelectItem value="multiple-choice">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Default is "Multiple Choice Questions".
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalQuizQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How many quiz questions do you want to generate?
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="5"
                  type="number"
                  {...field}
                  className="bg-white"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
              <FormDescription>Default is 5 questions.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 flex-wrap justify-between items-center">
          <div className="flex flex-col justify-between gap-2">
            <Label htmlFor="date" className="">
              Start Date
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {form.watch("startDate")
                    ? form.watch("startDate")?.toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={form.watch("startDate")}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    form.setValue("startDate", date);
                    setStartDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="w-2/5 flex flex-col gap-2">
                <FormLabel className="px-1">Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 flex-wrap justify-between items-center">
          <div className="flex flex-col justify-between gap-2">
            <Label htmlFor="date" className="">
              End Date
            </Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {form.watch("endDate")
                    ? form.watch("endDate")?.toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={form.watch("endDate")}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    form.setValue("endDate", date);
                    setEndDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="w-2/5 flex flex-col gap-2">
                <FormLabel className="px-1">End Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="60"
                  {...field}
                  className="bg-white"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
              <FormDescription>
                Exam duration in minutes. Will be auto-computed from start/end
                times but editable.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {
          /* Render numberOfOptions only if type is multiple-choice or hybrid */
          (form.getValues("type") === "multiple-choice" ||
            form.getValues("type") === "hybrid") && (
            <FormField
              control={form.control}
              name="numberOfOptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How many options should each question have?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5"
                      type="number"
                      {...field}
                      className="bg-white"
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Default is 4 options per question.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        <div className="flex gap-4 items-center justify-between">
          <Button className="w-[250px] my-4" disabled={examIsPending}>
            {examIsPending && <Loader2Icon className="animate-spin" />}
            Generate Quiz
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      {examIsSuccess && examData ? (
        <div>
          <div className="flex flex-col flex-wrap md:flex-row w-full gap-4 justify-between items-start md:items-center mb-4">
            <h2 className="text-2xl font-bold m-0">Generated Quiz Questions</h2>
          </div>
          {examData?.data?.data?.question?.map(
            (
              { id, question, description, options }: ExamData,
              index: number
            ) => (
              <div key={id} className="mb-6">
                <div className="flex justify-start items-start gap-2">
                  <span className="font-bold">Q{index + 1}.</span>
                  <h3 className="m-0">{question}</h3>
                </div>
                <p>{description}</p>
                <ol className="list-disc list-inside">
                  {options.map(({ id, text }) => (
                    <li key={id}>{text}</li>
                  ))}
                </ol>
              </div>
            )
          )}

          <Button
            className="w-[250px]"
            onClick={() => {
              if (examData?.data?.data?.examId) {
                publishExam();
              }
            }}
            disabled={publishExamIsPending}
          >
            {publishExamIsPending && <Loader2Icon className="animate-spin" />}
            Publish
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-start">Quiz Link</DialogTitle>
                <DialogDescription className="text-start">
                  Copy the link and share with your students.
                </DialogDescription>
              </DialogHeader>
              {publishExamData && (
                <div className="flex flex-col items-center justify-between gap-4">
                  <p className="break-all max-w-full text-sm text-start">
                    {publishExamData?.data?.data?.uploadLink}
                  </p>
                  <div
                    className="self-end"
                    key={changeClipboardIcon ? "checked" : "copy"}
                  >
                    {!changeClipboardIcon ? (
                      <Paperclip
                        onClick={() => {
                          navigator.clipboard.writeText(
                            publishExamData?.data?.data?.uploadLink
                          );
                          setChangeClipboardIcon(true);
                          toast.success("Copied");
                        }}
                        className="cursor-pointer hover:text-slate-400 border rounded-full"
                      />
                    ) : (
                      <CheckCircle className="pointer-events-none" />
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex w-full max-w-lg flex-col gap-6">
          <Button className="w-[100px] self-end" onClick={() => nav(-1)}>
            Back
          </Button>

          <Tabs
            defaultValue="note"
            onValueChange={(v) => {
              setMode(v as "note" | "file");
            }}
          >
            <TabsList>
              <TabsTrigger value="note">Paste as note</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="note" className="p-2">
              {SharedForm}
            </TabsContent>
            <TabsContent value="file" className="p-2">
              {SharedForm}
            </TabsContent>
          </Tabs>

          <Dialog open={addNew} onOpenChange={setAddNew}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add course</DialogTitle>
                <DialogDescription>
                  Input the name of the course you would like to create.
                </DialogDescription>
              </DialogHeader>
              <div className="w-full flex flex-wrap gap-2 items-center justify-between">
                <Input
                  name="name"
                  placeholder="Course name (e.g. CSC 101)"
                  className="w-3/4 self-center mx-auto md:mx-0 inline-block"
                  required
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddCourse}
                  type="button"
                  disabled={examIsPending}
                >
                  {examIsPending ? (
                    <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
                  ) : (
                    "Add"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
