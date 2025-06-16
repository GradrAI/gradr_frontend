import { Category } from "@/types/Category";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Loader2Icon, Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { Resource } from "@/types/Resource";

export default function CategoryRow({
  category,
  courseId,
}: {
  category: Category;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  const {
    data: linkData,
    isPending: linkIsPending,
    mutate,
  } = useMutation({
    mutationKey: ["courseLink", category._id],
    mutationFn: async () =>
      await axios.post(`/courses/generateLink`, {
        courseId,
        categoryId: category._id,
      }),
    onMutate: () => toast.success(`Generating link for ${category.name}`),
    onSuccess: () => setOpen(true),
    onError: (err: any) =>
      toast.error(err?.message || "Unable to generate link"),
  });

  return (
    <div key={category._id} className="p-4 border border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{category?.name}</p>
          <p>
            Maximum Score Attainable:{" "}
            <span className="text-sm text-gray-500">
              {category?.maxScoreAttainable}
            </span>
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={linkIsPending}
          onClick={() => mutate()}
        >
          {linkIsPending && <Loader2Icon className="animate-spin" />}
          Generate Link
        </Button>
      </div>

      {/* Resources */}
      <div className="flex flex-col gap-4">
        {category.resources?.map((resource: Resource) =>
          ["guide", "question"].includes(resource?.type) ? (
            <div key={resource._id}>
              <p className="m-0">{resource?.type?.toUpperCase()}</p>
              <p
                className="truncate max-w-xl text-sm text-blue-400 hover:text-blue-600 cursor-pointer"
                onClick={() => window.open(resource?.fileUrl, "_blank")}
              >
                {resource?.fileUrl}
              </p>
            </div>
          ) : null
        )}
      </div>

      {/* Dialog for link */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-start">Course Link</DialogTitle>
            <DialogDescription className="text-start">
              Copy the link and share with your students.
            </DialogDescription>
          </DialogHeader>
          {linkData?.data?.uploadLink && (
            <div className="flex flex-col items-center justify-between gap-4">
              <p className="break-all max-w-full text-sm text-start">
                {linkData.data.uploadLink}
              </p>
              <div className="self-end">
                {!changeClipboardIcon ? (
                  <Paperclip
                    onClick={() => {
                      navigator.clipboard.writeText(linkData.data.uploadLink);
                      toast.success("Copied");
                      setChangeClipboardIcon(true);
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
  );
}
