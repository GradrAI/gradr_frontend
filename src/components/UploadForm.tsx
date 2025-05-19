import { z } from "zod";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { UploadData } from "@/types/UploadData";
import toast from "react-hot-toast";
import notifications from "@/requests/notifications";
import useStore from "@/state";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import { useEffect } from "react";
import { Label } from "./ui/label";

const studentAnswersSchema = z.object({
  students: z
    .array(
      z.object({
        file: z.instanceof(File),
        identifierType: z.enum(["email", "id"]),
        identifierValue: z.string().min(1),
      })
    )
    .min(1),
});

const otherSchema = z.object({
  file: z.instanceof(File),
  // .instanceof(FileList)
  // .refine((files) => files.length > 0, "The file is required.")
  // .refine((files: FileList) => {
  //   return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
  // }, `File size must be less than ${MAX_FILE_SIZE}MB`)
  // .refine(
  //   (files: FileList) => {
  //     return Array.from(files).every((file) =>
  //       ACCEPTED_FILE_TYPES.includes(file.type)
  //     );
  //   },
  //   `File must be one of ${ACCEPTED_FILE_TYPES.join(", ")}`
  // ),
});

const formSchema = z.union([studentAnswersSchema, otherSchema]);

const UploadForm = ({ uploadData }: { uploadData: Partial<UploadData> }) => {
  const nav = useNavigate();
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "students",
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
    // if (!uploadData || !data?.file?.length) return;

    const formData = new FormData();

    if (uploadData.fileType === "answers") {
      if ("students" in data) {
        data.students.forEach((student, i) => {
          formData.append("files", student.file);
        });
        formData.append(
          "students",
          JSON.stringify(
            data.students.map((s) => ({
              identifierType: s.identifierType,
              identifierValue: s.identifierValue,
            }))
          )
        );
      }
    } else {
      if ("file" in data) {
        formData.append("file", data.file);
      }
    }

    // for (const [key, val] of Object.entries(uploadData)) {
    //   if (typeof val === "string") formData.append(key, val);
    // }
    // const { file } = data;
    // for (const [key, val] of Object.entries(file)) {
    //   formData.append("file", val);
    // }
    mutate(formData, {
      onSuccess: (data: any, variables: any, context: any) => {
        console.log("data: ", data);
        toast.success(notifications.UPLOAD.SUCCESS);
        form.reset();
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
        {uploadData?.fileType === "answers" ? (
          <>
            <div className="space-y-4 flex flex-col md:flex-row items-stretch justify-between">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row gap-4 items-center"
                >
                  {/* <div className="">
                    <Label>File</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      {...form.register(`students.${index}.file` as const)}
                    />
                  </div> */}
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-between h-full">
                        <FormLabel>Enter your file here</FormLabel>
                        <FormControl>
                          <Input
                            id="file"
                            placeholder="Select file"
                            type="file"
                            // {...fileRef}
                            {...form.register(
                              `students.${index}.file` as const
                            )}
                            multiple //={uploadData?.fileType === "answers"} // only allow mutiple file selection when uploading student answers
                            className="bg-white"
                          />
                        </FormControl>
                        {/* <FormDescription>
                          Files must be PDF and of size less than 50MB.
                        </FormDescription> */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`students.${index}.identifierType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="bg-white">
                            <SelectTrigger>
                              <SelectValue placeholder="Select the identifier type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="id">ID</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <div className="flex-1">
                    <Label>Identifier Type</Label>
                    <select
                      {...form.register(
                        `students.${index}.identifierType` as const
                      )}
                      className="input"
                    >
                      <option value="email">Email</option>
                      <option value="id">ID</option>
                    </select>
                  </div> */}

                  <FormField
                    control={form.control}
                    name={`students.${index}.identifierValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl className="bg-white">
                          <Input placeholder="student@email.com" {...field} />
                        </FormControl>
                        {/* <FormDescription>
                          This is your public display name.
                        </FormDescription> */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <div className="flex-1">
                    <Label>Identifier Value</Label>
                    <Input
                      type="text"
                      placeholder="e.g. john@example.com"
                      {...form.register(
                        `students.${index}.identifierValue` as const
                      )}
                    />
                  </div> */}

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className=""
              onClick={() =>
                append({
                  file: undefined as any,
                  identifierType: "email",
                  identifierValue: "",
                })
              }
            >
              + Add Student Answer
            </Button>
          </>
        ) : (
          // <div>
          //   <Label>Marking Guide File</Label>
          //   <Input type="file" accept=".pdf" {...register("file")} />\
          // </div>
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
                    // multiple={uploadData?.fileType === "answers"} // only allow mutiple file selection when uploading student answers
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
        )}

        <div className="flex gap-4 items-center justify-between">
          <Button variant="secondary" onClick={() => nav("..")}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={isError || isPending || !data?.data?.length}
          >
            {isPending ? (
              <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UploadForm;
