import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import formSchema, { FormSchemaType } from "../helpers/formSchema";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import categories from "@/data/categories";
import calculateDurationMinutes from "../helpers/calculateDurationMinutes";
import { DateTime } from "luxon";
import api from "@/lib/axios";
import { CourseData, Category } from "@/types/CourseData";
import { AxiosResponse } from "axios";
import { Input } from "@/components/ui/input";
import useStore from "@/state";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import useDrivePicker from "react-google-drive-picker";
import { Resource } from "@/types/Resource";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface ExamUploadFormProps {
  setAddNew: (value: boolean) => void;
}

const ExamUploadForm = ({ setAddNew }: ExamUploadFormProps) => {
  const { user } = useStore();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [openPicker] = useDrivePicker();
  const [resourceOpen, setResourceOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    },
  });

  const type = "generatedExam";
  const courseId = form.watch("courseId");
  const categoryName = form.watch("categoryName");
  const categoryType = form.watch("categoryType");
  const maxScoreAttainable = form.watch("maxScoreAttainable");
  const selectedResourceIds = form.watch("resourceIds") || [];
  const standard = form.watch("standard");
  const examType = form.watch("type");
  const topicPriorities = form.watch("topicPriorities") || [];

  const { data: resourceData, refetch: refetchResources } = useQuery({
    queryKey: ["resourceData", courseId, user?._id, type],
    queryFn: async () =>
      await api.get(`/resources/lecturer/${courseId}/${type}`),
    enabled: Boolean(courseId && user?._id && type),
    refetchOnWindowFocus: false,
  });

  const extractTopicsMutation = useMutation({
    mutationFn: async (resourceIds: string[]) => {
      const res = await api.post("/exam/extract-topics", { resourceIds });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const formattedTopics = data.data.map((t: any) => ({
          topic: t.topic,
          weight: t.weight,
          selected: true,
        }));
        form.setValue("topicPriorities", formattedTopics);
        toast.success("Topics extracted from resources!");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Topic extraction failed");
    },
  });

  useEffect(() => {
    if (selectedResourceIds.length > 0) {
      extractTopicsMutation.mutate(selectedResourceIds);
    } else {
      form.setValue("topicPriorities", []);
    }
  }, [selectedResourceIds.length]);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/upload", formData);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.resources) {
        const newIds = data.resources.map((r: any) => r._id);
        const currentIds = form.getValues("resourceIds") || [];
        form.setValue("resourceIds", [...currentIds, ...newIds]);
        toast.success("File uploaded and resource created!");
        refetchResources();
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Upload failed");
    },
    onSettled: () => setIsUploading(false),
  });

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!courseId || !categoryName || !categoryType) {
      toast.error("Please select a course and set category details first.");
      return;
    }

    if (!window.confirm("Do you want to upload this file and create a resource?")) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("file", file));
    formData.append("lecturerId", user?._id || "");
    formData.append("name", courses.find((c) => c._id === courseId)?.name || "");
    formData.append("fileType", "generatedExam");
    formData.append("categoryName", categoryName);
    formData.append("categoryType", categoryType);
    formData.append("maxScoreAttainable", String(maxScoreAttainable));
    formData.append("uploader", JSON.stringify(user));
    formData.append("uploaderType", "lecturer");

    uploadMutation.mutate(formData);
  };

  const handleOpenPicker = () => {
    openPicker({
      clientId: import.meta.env.VITE_CLIENT_ID,
      developerKey: "",
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === "picked") {
          console.log("Drive Picker data: ", data);
          toast("Drive file pickup not fully implemented for separate upload yet. Use local upload.");
        }
      },
    });
  };

  const {
    mutate: examMutate,
    isPending: examIsPending,
  } = useMutation({
    mutationKey: ["generateQuiz"],
    mutationFn: async (data: any) => await api.post("/exam", data),
  });

  const {
    data: coursesData,
  } = useQuery<AxiosResponse<CourseData[]>>({
    queryKey: ["courses", user?._id],
    queryFn: async () => await api.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (coursesData?.data) {
      setCourses(coursesData.data);
    }
  }, [coursesData]);

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
  }, [form, startDate, endDate, startTime, endTime]);

  useEffect(() => {
    if (standard === "JAMB") {
      form.setValue("type", "multiple-choice");
      form.setValue("numberOfOptions", 4);
    } else if (standard === "WASSCE") {
      form.setValue("numberOfOptions", 4);
      // WASSCE allows hybrid, so we don't force type
    }
  }, [standard, form]);

  const handleSelectCourse = (selection: string) => {
    if (selection === "addNew") {
      setAddNew(true);
      return;
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!data.resourceIds?.length) {
      toast.error("Please upload or select at least one resource.");
      return;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload: any = { ...data };

    if (data.startDate && data.startTime) {
      const startLocal = DateTime.fromISO(
        `${DateTime.fromJSDate(data.startDate).toISODate()}T${data.startTime}`,
        { zone: tz }
      );
      payload.availabilityStartAt = startLocal.toUTC().toISO();
    }

    if (data.endDate && data.endTime) {
      const endLocal = DateTime.fromISO(
        `${DateTime.fromJSDate(data.endDate).toISODate()}T${data.endTime}`,
        { zone: tz }
      );
      payload.availabilityEndAt = endLocal.toUTC().toISO();
    }


    // Clean up payload
    delete payload.file;
    delete payload.startDate;
    delete payload.endDate;
    delete payload.startTime;
    delete payload.endTime;

    // Filter only selected topic priorities
    if (payload.topicPriorities) {
      payload.topicPriorities = payload.topicPriorities.filter((tp: any) => tp.selected);
    }

    examMutate(payload, {
      onSuccess: (res: any) => {
        if (res.data?.success) {
          toast.success(notifications.QUIZ.SUCCESS);
          form.reset();
        } else {
          toast.error(res.data?.message || notifications.QUIZ.FAILURE);
        }
      },
      onError: () => {
        toast.error(notifications.QUIZ.FAILURE);
      },
    });
  }

  return (
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
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectGroup>
                    <SelectItem value="GENERIC">Generic / Custom</SelectItem>
                    <SelectItem value="JAMB">JAMB (UTME)</SelectItem>
                    <SelectItem value="WASSCE">WASSCE (Senior)</SelectItem>
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

        <div className="flex gap-4 flex-wrap justify-between items-center">
          <FormField
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Assignment II" className="bg-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryType"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[150px]">
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
            <FormItem>
              <FormLabel>Maximum Score Attainable</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
                  className="bg-white"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Resources & Uploads</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPicker}
              className="bg-white border-primary text-primary hover:bg-primary/5"
            >
              Google Drive
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Upload Local Files</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                multiple
                className="bg-white"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                disabled={isUploading}
              />
              {isUploading && <Loader2Icon className="animate-spin mt-2 shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Uploading a file will automatically create a Knowledge Resource for the selected course/category.
            </p>
          </div>

          <FormField
            control={form.control}
            name="resourceIds"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Selected Resources</FormLabel>
                <Combobox
                  open={resourceOpen}
                  onOpenChange={setResourceOpen}
                  value={field.value?.[0] || ""}
                  onValueChange={(val) => {
                    if (!val) return;
                    const current = field.value || [];
                    const exists = current.includes(val);
                    if (exists) {
                      field.onChange(current.filter((id) => id !== val));
                    } else {
                      field.onChange([...current, val]);
                    }
                  }}
                >
                  <FormControl>
                    <ComboboxInput
                      placeholder="Search and toggle resources..."
                      className="bg-white"
                    />
                  </FormControl>
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxEmpty>No resource found.</ComboboxEmpty>
                      {resourceData?.data?.data?.map((resource: Resource) => (
                        <ComboboxItem
                          key={resource._id}
                          value={resource._id}
                        >
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${field.value?.includes(resource._id) ? 'bg-primary' : 'bg-transparent border'}`} />
                             {resource?.name || "Untitled Resource"}
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((id) => {
                    const res = resourceData?.data?.data?.find((r: Resource) => r._id === id);
                    if (!res) return null;
                    return (
                      <div key={id} className="flex items-center gap-1 bg-white border px-2 py-1 rounded-md text-xs">
                        <span>{res.name}</span>
                        <button 
                          type="button" 
                          onClick={() => field.onChange(field.value?.filter(i => i !== id))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <FormDescription>
                  {selectedResourceIds.length} resource(s) selected for exam generation.
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
                <Input placeholder="Introduction to Mathematics" {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30">
            <h3 className="text-sm font-medium flex items-center gap-2">
              Topic Prioritization
              <span className="text-[10px] font-normal text-muted-foreground bg-white px-2 py-0.5 rounded-full border">
                AI Extracted
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Adjust the weights to prioritize specific topics in the generated exam. Uncheck a topic to exclude it.
            </p>
            <div className="space-y-3">
              {topicPriorities.length===0 ?
                <div className="space-y-4"> 
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                </div>
              :
              topicPriorities.map((tp, index) => (
                <div key={tp.topic} className="flex items-center gap-4 bg-white p-2 rounded-md border shadow-sm">
                  <Checkbox 
                    checked={tp.selected} 
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
                  <div className="flex items-center gap-2 w-32">
                    <Input
                      type="number"
                      value={tp.weight}
                      onChange={(e) => {
                        const newPriorities = [...topicPriorities];
                        newPriorities[index].weight = Number(e.target.value);
                        form.setValue("topicPriorities", newPriorities);
                      }}
                      className="h-8 text-xs"
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
        

        <div className="flex gap-4 flex-wrap justify-between items-center">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[150px]">
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[150px]">
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={standard === "JAMB"}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
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
          name="totalQuizQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Questions count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-white"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label>Start Date & Time</Label>
            <div className="flex gap-2">
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal bg-white">
                    {form.watch("startDate") ? form.watch("startDate")?.toLocaleDateString() : "Date"}
                    <ChevronDownIcon className="ml-auto" />
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
                  <Input type="time" {...field} className="bg-white w-32" />
                ) }
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>End Date & Time</Label>
            <div className="flex gap-2">
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal bg-white">
                    {form.watch("endDate") ? form.watch("endDate")?.toLocaleDateString() : "Date"}
                    <ChevronDownIcon className="ml-auto" />
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
                  <Input type="time" {...field} className="bg-white w-32" />
                ) }
              />
            </div>
          </div>
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
                  {...field}
                  className="bg-white"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
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
                    className="bg-white"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={standard === "JAMB" || standard === "WASSCE"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full md:w-[250px]" disabled={examIsPending}>
          {examIsPending && <Loader2Icon className="animate-spin mr-2" />}
          Generate Quiz
        </Button>
      </form>
    </Form>
  );
};

export default ExamUploadForm;
