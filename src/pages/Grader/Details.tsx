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
      result: { score, explanation, feedback, _id },
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
  console.log("latestResult: ", latestResult);
  const displayScore = latestResult?.result?.score ?? score;
  console.log("displayScore: ", displayScore);

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

      <div className="w-full h-full flex flex-col gap-8 justify-start text-black border rounded-xl cursor-pointer text-justify p-4">
        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Score</p>
          <div className="flex items-center justify-start gap-4 ">
            <p className="m-0">
              {isFetchingResult ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                displayScore
              )}
            </p>
            <Pencil
              size="15"
              className="hover:text-green-500"
              onClick={editScore}
            />
          </div>
        </div>

        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Explanation</p>
          <p className="leading-relaxed">{explanation}</p>
        </div>

        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Feedback</p>
          <p className="leading-relaxed">{feedback}</p>
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
