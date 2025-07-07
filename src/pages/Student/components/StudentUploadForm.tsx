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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import { UploadData } from "@/types/UploadData";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { User } from "@/types/User";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface StudentUploadFormProps {
  courseInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  user: User;
  setMatricNo: (matricNo: string) => void;
}

const formSchema = z.object({
  matricNo: z.string(),
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

function buildFormData(
  uploadResources: Partial<UploadData>,
  data: z.infer<typeof formSchema>
): FormData {
  const formData = new FormData();

  for (const [key, val] of Object.entries(uploadResources)) {
    if (
      val !== null &&
      val !== undefined &&
      (typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean")
    ) {
      formData.append(key, String(val));
    } else if (typeof val === "object" && key === "uploader") {
      formData.append(key, JSON.stringify(val)); // special case
    }
  }

  Array.from(data.file).forEach((file) => formData.append("file", file));

  return formData;
}

const StudentUploadForm: React.FC<StudentUploadFormProps> = ({
  courseInfo,
  user,
  setMatricNo,
}) => {
  const queryClient = useQueryClient();
  const [uploadResources, setUploadResources] = useState<Partial<UploadData>>({
    lecturerId: undefined,
    name: undefined,
    fileType: "answers",
    studentId: null,
    categoryName: undefined,
    categoryType: undefined,
    file: undefined,
    uploader: null,
    uploaderType: "student",
    maxScoreAttainable: courseInfo?.data?.category?.maxScoreAttainable,
  });

  const { data: courseData, isSuccess: courseIsSuccess } = courseInfo;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  useEffect(() => {
    if (courseIsSuccess && courseData?.category && courseData?.course) {
      toast.success("Successfully retrieved course info");

      setUploadResources((prev) => ({
        ...prev,
        lecturerId: courseData.course?.lecturerId,
        name: courseData.course?.name,
        maxScoreAttainable: courseData.category?.maxScoreAttainable,
        studentId: user?._id,
        categoryName: courseData.category?.name,
        categoryType: courseData.category?.type,
      }));
    }
  }, [courseIsSuccess, courseData]);

  //* updates uploadResources state with user value (when it's available)
  useEffect(() => {
    if (user?._id) {
      setUploadResources((prev) => ({
        ...prev,
        uploader: JSON.stringify(user),
      }));
    }
  }, [user]);

  // for file upload
  const { isPending: uploadIsPending, mutate } = useMutation({
    mutationKey: ["upload"],
    mutationFn: async (data: any) => await api.post(`/upload`, data),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!courseData?.category) {
      toast.error("Missing course information");
      return;
    }
    if (!user || !Object.keys(user)?.length) {
      toast.error("Missing user information");
      return;
    }
    setMatricNo(data.matricNo);
    const fullUploadData = {
      ...uploadResources,
      matricNo: data.matricNo,
    };

    const formData = buildFormData(fullUploadData, data);

    mutate(formData, {
      onSuccess: (data: any, variables: any, context: any) => {
        console.log("data: ", data);
        toast.success(notifications.UPLOAD.SUCCESS);
        queryClient.invalidateQueries({
          queryKey: ["getResources", courseData?.category._id, data.matricNo],
        });
        window.location.reload();
      },
      onError: (error: any, variables: any, context: any) => {
        console.log("error", error);
        toast.error(notifications.UPLOAD.FAILURE);
      },
    });
  }

  const fileRef = form.register("file");

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="matricNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matric No</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your unique student ID.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button type="submit" disabled={uploadIsPending}>
            {uploadIsPending && <Loader2Icon className="animate-spin" />}
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
};

export default StudentUploadForm;
