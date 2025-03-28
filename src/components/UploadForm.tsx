import { z } from "zod";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "react-router-dom";
import { UploadData } from "@/types/UploadData";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import useStore from "@/state";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";

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

const UploadForm = ({ uploadData }: { uploadData: Partial<UploadData> }) => {
  const nav = useNavigate();
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["gradeData"],
    mutationFn: async (uploadData: any) =>
      await axios.post(`/upload`, uploadData),
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
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

  const fileRef = form.register("file");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
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
                  multiple={uploadData?.fileType === "answers"} // only allow mutiple file selection when uploading student answers
                />
              </FormControl>
              <FormDescription>
                Files must be PDF and of size less than 50MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-between">
          <Button variant="secondary" onClick={() => nav("..")}>
            Back
          </Button>
          <Button type="submit" disabled={isError || !data?.data?.length}>
            {`Upload${isPending ? "ing..." : ""}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UploadForm;
