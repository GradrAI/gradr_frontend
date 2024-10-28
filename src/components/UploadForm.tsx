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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import initialUserState from "@/data/initialUserState";
import notifications from "@/requests/notifications";

const formSchema = z.object({
  file: z.instanceof(FileList),
});

const UploadForm = ({ uploadData }: { uploadData: Partial<UploadData> }) => {
  const nav = useNavigate();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let parsedUser = initialUserState;
    const user = localStorage.getItem("user");
    if (user) parsedUser = JSON.parse(user);
    if (parsedUser && parsedUser._id) {
      setUserId(parsedUser._id);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${userId}`),
    enabled: Boolean(userId.length),
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["gradeData"],
    mutationFn: async (uploadData: any) =>
      await axios.post(`/upload`, uploadData),
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!uploadData) return;
    if (!data || !data?.file?.length) return;

    const formData = new FormData();

    for (const [key, val] of Object.entries(uploadData)) {
      formData.append(key, val);
    }
    const { file } = data;
    for (const [key, val] of Object.entries(file)) {
      formData.append("file", val);
    }
    mutate(formData, {
      onSuccess: (data, variables, context) => {
        console.log("data: ", data);
        toast.success(notifications.UPLOAD.SUCCESS);
      },
      onError: (error, variables, context) => {
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
              <FormControl>
                <Input
                  id="file"
                  placeholder="Select file"
                  type="file"
                  {...fileRef}
                  multiple={uploadData?.fileType === "answers"} // only allow mutiple file selection when uploading student answers
                />
              </FormControl>
              <FormDescription>Select files.</FormDescription>
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
