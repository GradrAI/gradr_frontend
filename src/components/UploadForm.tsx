import { z } from "zod";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
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
import { useEffect } from "react";
import toast from "react-hot-toast";

const formSchema = z.object({
  file: z.instanceof(FileList),
});

const UploadForm = ({ uploadData }: { uploadData: Partial<UploadData> }) => {
  const nav = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { data, mutate } = useMutation({
    mutationKey: ["gradeData"],
    mutationFn: async (uploadData: any) => {
      const res = await axios.post(`/api/upload`, uploadData);
      return res;
    },
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
    mutate(formData);
  }

  const fileRef = form.register("file");

  useEffect(() => {
    if (data) {
      const { status } = data;
      if (status === 200) {
        toast.success("Upload successfull!");
      } else {
        toast.error("Upload failed");
      }
    }
  }, [data]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Files</FormLabel> */}
              <FormControl>
                <Input
                  id="file"
                  placeholder="Select file"
                  type="file"
                  {...fileRef}
                  multiple={uploadData?.fileType === "answers"} // only answer mutiple file selection for upload of student answers
                />
              </FormControl>
              <FormDescription>Select files.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-between">
          <Button type="submit">Submit</Button>
          <Button variant="secondary" onClick={() => nav("..")}>
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UploadForm;
