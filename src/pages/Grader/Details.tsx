import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/Student";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2Icon, Pencil } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { convertGCSUrlToPublicUrl } from "@/lib/convertGCSUrlToPublicUrl";

const formSchema = z.object({
  score: z.string(),
  lecturerComment: z.string().optional(),
});

const Details = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const {
    state: {
      categoryData,
      fileUrl,
      result: { score, explanation, feedback, results, _id },
    },
  } = useLocation();

  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");
  const categoryId = searchParams.get("categoryId");
  const studentId = searchParams.get("studentId");

  const [localData, setLocalData] = useState({
    markingGuide: "",
    question: "",
    score: "",
    explanation: "",
    feedback: "",
    onlineAnswers: ``,
    // onlineAnswers: `https://storage.googleapis.com/grdr/${categoryId}/OnlineAnswers.pdf `,
    studentAnswerUrl: "",
    report: "",
  });

  //!TO-DO: use categoryId to make API call to get marking guide and answer resources (seperately)

  const editScore = () => {
    setOpenDialog(true);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: score?.split("/")[0] ?? score,
      lecturerComment: "",
    },
  });

  // Fetch latest result for this student/category for live update
  const {
    data: latestResult,
    refetch: refetchResult,
    isFetching: isFetchingResult,
  } = useQuery({
    queryKey: ["studentResult", courseId, categoryId, studentId],
    queryFn: async () => {
      const res = await api.get(
        `/courses/${courseId}/categories/${categoryId}/students/${studentId}/results`
      );
      return res.data;
    },
    enabled: Boolean(studentId && categoryId),
  });

  // Use latestResult for score only, fallback to navigation state
  const displayScore = latestResult?.result?.score ?? score;

  const { mutate: editResultMutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await api.patch(`/results/${_id}`, {
        score: `${values.score}/${categoryData.maxScoreAttainable}`,
        lecturerComment: values.lecturerComment,
        categoryId,
      });
      return res.data;
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.score > categoryData.maxScoreAttainable) {
      toast.error(
        "You're attempting to assign a score higher than the max score for this category."
      );
      return;
    }

    editResultMutate(values, {
      onSuccess: (data: any, variables: any, context: any) => {
        if (data.success) {
          queryClient.invalidateQueries({
            queryKey: ["singleCourse", courseId],
          });
          refetchResult();
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
        setOpenDialog(false);
      },
      onError: (error: any, variables: any, context: any) => {
        console.log("error", error);
        toast.error(notifications.RESULT.FAILURE);
      },
    });
  }

  return (
    <div className="w-100 h-dvh flex flex-col gap-4 p-8">
      {/* <div className="w-100 py-6 flex justify-between items-center"> */}
      <Button onClick={() => nav("..")} className="self-start">
        Back
      </Button>
      {/* </div> */}

      <div className="flex flex-wrap gap-2 items-center justify-end text-end">
        <p
          onClick={() => {
            window.open(localData.question, "_blank", "noopener,noreferrer");
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.question.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Question
        </p>

        <p
          onClick={() => {
            window.open(
              localData.markingGuide,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.markingGuide.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Marking Guide
        </p>

        <p
          onClick={() => {
            window.open(
              convertGCSUrlToPublicUrl(fileUrl),
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(fileUrl?.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          {`Student's Answer`}
        </p>

        <p
          onClick={() => {
            window.open(
              localData.onlineAnswers,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.onlineAnswers.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          {`Online Answers to question`}
        </p>

        <p
          onClick={() => {
            window.open(localData.report, "_blank", "noopener,noreferrer");
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.report.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Student report
        </p>
      </div>

      <div className="w-full h-full flex flex-col gap-8 justify-start text-black border rounded-xl cursor-pointer text-justify p-6 bg-white overflow-y-auto">
        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold text-slate-500 uppercase text-xs tracking-widest mb-2">Overall Score</p>
          <div className="flex items-center justify-start gap-4">
            <p className="m-0 text-3xl font-black text-slate-900">
              {isFetchingResult ? (
                <Loader2Icon className="animate-spin text-primary" />
              ) : (
                displayScore
              )}
            </p>
            <Button variant="ghost" size="icon" onClick={editScore} className="rounded-full hover:bg-slate-100">
              <Pencil size="16" className="text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {((latestResult?.result?.results || results) && (latestResult?.result?.results?.length > 0 || results?.length > 0)) && (
          <div className="flex flex-col justify-start gap-4">
            <p className="text-xl m-0 font-bold text-slate-500 uppercase text-xs tracking-widest border-b pb-2">Question Breakdown</p>
            <div className="grid grid-cols-1 gap-4">
              {(latestResult?.result?.results || results).map((res: any, index: number) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/20 transition-colors shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-800 text-sm">{res.questionId || `Question ${index + 1}`}</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Marks: {res.score}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed"><span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">AI Explanation</span>{res.explanation}</p>
                    {res.feedback && (
                      <p className="text-sm leading-relaxed italic border-l-2 border-green-500 pl-3"><span className="font-bold text-slate-500 text-[10px] uppercase block not-italic mb-1">AI Feedback</span>{res.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold text-slate-500 uppercase text-xs tracking-widest border-b pb-2 mb-4">Summary & Feedback</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">AI Justification</p>
              <p className="leading-relaxed text-slate-700">{latestResult?.result?.explanation || explanation}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">AI General Feedback</p>
              <p className="leading-relaxed text-slate-700 italic">{latestResult?.result?.feedback || feedback}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-start">Edit score</DialogTitle>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormDescription>
                        Change the student's previous score.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lecturerComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="You deserve a better score because..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly explain why you are changing the AI-assigned
                        score.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2Icon className="animate-spin mr-2" />}
                  Edit
                </Button>
              </form>
            </Form>

            <DialogDescription className="text-start flex items-center justify-start gap-2">
              <AlertTriangle size={15} />
              <p>This changes the score of the student</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Details;
