import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import useStore from "@/state";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { UploadData } from "@/types/UploadData";
import { Exam } from "@/types/Exam";
import { Result } from "@/types/Result";
import { ErrorResponse } from "@/types/ErrorResponse";

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "The file is required.")
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
});

const postResults = async (data: Exam[]) =>
  await axios.post<Result[]>(`/results`, data);

const StudentUpload = () => {
  const nav = useNavigate();
  const { uniqueCode } = useParams();
  const [file, setfile] = useState<FileList | null>(null);
  const [clicked, setClicked] = useState(false);
  const { user, token, setAccountType, setUniqueExamCode } = useStore();
  const [uploadData, setUploadData] = useState<Partial<UploadData> | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  // for sign in
  const { isLoading, isPending, isError, isSuccess, error, data, refetch } =
    useQuery({
      queryKey: ["Data"],
      queryFn: () => axios.get(`/auth/google`),
      enabled: clicked,
    });

  // to retrieve exam info using uniqueCode
  const {
    data: examData,
    isLoading: examIsLoading,
    isError: examIsError,
    isSuccess: examIsSuccess,
    error: examError,
  } = useQuery({
    queryKey: ["examInfo"],
    queryFn: async () =>
      await axios.get(`/exams/examInfo/${uniqueCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(uniqueCode?.length) && Boolean(user?._id), // retrieve exam info only when uniqueCode is available and user is signed in
    retry: false,
    select: (data) => data.data.data,
  });

  // for file upload
  const {
    data: uploadData_,
    isPending: uploadIsPending,
    isSuccess: uploadIsSuccess,
    isError: uploadIsError,
    error: uploadError,
    mutate,
  } = useMutation({
    mutationKey: ["upload"],
    mutationFn: async (data: any) => await axios.post(`/upload`, data),
  });

  // to retrieve user's previous upload for this exam, if it exists
  const {
    data: examStudentData,
    isLoading: examStudentIsLoading,
    isError: examStudentIsError,
    isSuccess: examStudentIsSuccess,
    error: examStudentError,
  } = useQuery({
    queryKey: ["examStudent"],
    queryFn: async () =>
      await axios.get(`exams/${examData?._id}/students/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(examData?._id) && Boolean(user?._id),
    retry: false,
  });

  // for grading
  const { isPending: resultsIsPending, mutate: resultsMutate } = useMutation({
    mutationKey: ["results"],
    mutationFn: postResults,
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!uploadData || !data?.file?.length) return;

    const formData = new FormData();

    for (const [key, val] of Object.entries(uploadData)) {
      if (typeof val === "string") formData.append(key, val);
    }

    const { file } = data;
    for (const [key, val] of Object.entries(file)) {
      formData.append("file", val);
    }

    mutate(formData, {
      onSuccess: (data: any, variables: any, context: any) => {
        console.log("data: ", data);
        toast.success(notifications.UPLOAD.SUCCESS);
      },
      onError: (error: any, variables: any, context: any) => {
        console.log("error", error);
        toast.error(notifications.UPLOAD.FAILURE);
      },
    });
  }

  const handleSignIn = () => {
    setAccountType("student");
    if (uniqueCode) setUniqueExamCode(uniqueCode);
    setClicked(true);
  };

  //   respond to sign in events
  useEffect(() => {
    if (isSuccess && data?.data?.success)
      window.location.href = data.data.authorizationUrl;
    if (isError)
      toast.error(error?.message || "An error occurred. Please retry");
  }, [data, isLoading, isSuccess, isError, error]);

  // respond to getting exam info from uniqueCode events
  useEffect(() => {
    if (examIsError) {
      if ((examError as AxiosError<ErrorResponse>)?.response?.data?.message) {
        toast.error("Session expired");
        // refetch(); // prompts re-login.
        // TO-DO: prompt user before re-logging them again
      } else {
        toast.error(examError?.message || "Unable to retrieve exam info");
      }
    }
    if (examIsLoading) toast.success("Retrieving exam info");
    if (examIsSuccess && examData) {
      setUploadData({
        examName: examData.examName,
        lecturerId: examData.lecturerId,
        fileType: "answers",
        maxScoreAttainable: examData.maxScoreAttainable,
      });
    }
  }, [examIsSuccess, examData, examIsError, examError, examIsLoading]);

  //   respond to uploadData
  useEffect(() => {
    if (uploadIsPending) toast.success("Uploading file");
    if (uploadIsError)
      toast.error(uploadError?.message || "File upload failed");
    if (uploadIsSuccess && uploadData_?.data.status === 200 && user?._id) {
      console.log("uploadData_: ", uploadData_);
      const {
        data: {
          response: {
            url: [{ fileName, url }],
          },
        },
      } = uploadData_;

      //   call mutation that performs grading
      const gradeArray: any[] = [
        {
          _id: user._id,
          exam: {
            file: {
              url,
            },
          },
        },
      ];
      resultsMutate(
        {
          resultData: gradeArray,
          examData: {
            maxScoreAttainable: examData.maxScoreAttainable,
            guide: examData.guide,
            question: examData.question,
          },
        },
        {
          onSuccess: (data: any, variables: any, context: any) => {
            console.log("data: ", data);
            toast.success(notifications.GRADE.SUCCESS);
            // queryClient.invalidateQueries({ queryKey: ["students"] });
          },
          onError: (error: any, variables: any, context: any) => {
            console.log("error", error);
            toast.error(notifications.GRADE.FAILURE);
          },
        }
      );
    }
  }, [
    uploadData_,
    uploadIsPending,
    uploadIsSuccess,
    uploadIsError,
    uploadError,
    user,
  ]);

  //   respond to retrieving user's data
  useEffect(() => {
    if (examStudentIsLoading) toast.success("Fetching previous data");
    if (examStudentIsError)
      toast.error(examStudentError?.message || "Unable to fetch previous data");
    if (examStudentIsSuccess && examStudentIsSuccess)
      console.log("examStudentData: ", examStudentData);
  }, [
    examStudentData,
    examStudentIsLoading,
    examStudentIsError,
    examStudentIsSuccess,
    examStudentError,
  ]);

  const fileRef = form.register("file");

  return (
    <>
      <header className="bg-stone-200 py-2 px-6 flex justify-between items-center">
        <h1 onClick={() => nav("/")}>GradrAI for students</h1>
        {user && <p>{`${user.first_name} ${user.last_name}`}</p>}
      </header>
      <div className="w-2/4 p-6 flex flex-col gap-4">
        {!user ? (
          <>
            <p>Sign in to get started and get your grade for this course.</p>
            {/* sign in */}
            <Button className="w-[250px]" onClick={handleSignIn}>
              {isLoading ? (
                <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
              ) : (
                "Sign in"
              )}
            </Button>
            {/* redirect back to this page */}
          </>
        ) : (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-2/3 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter your file here</FormLabel>
                      <FormControl>
                        <Input
                          id="file"
                          placeholder="Select file"
                          type="file"
                          {...fileRef}
                        />
                      </FormControl>
                      <FormDescription>
                        This file must be a PDF and of size less than 50MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={uploadIsSuccess || uploadData_}>
                  Submit
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </>
  );
};

export default StudentUpload;
