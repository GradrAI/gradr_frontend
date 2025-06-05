import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useStore from "@/state";
import { ErrorResponse } from "@/types/ErrorResponse";
import { Course } from "@/types/Course";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, EllipsisVertical, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";

const Uploads = () => {
  const nav = useNavigate();
  const { user, token } = useStore();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [open, setOpen] = useState(false);
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => await axios.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
    refetchOnWindowFocus: false,
  });

  // const { data: resourceData } = useQuery({
  //   querykey: ["resources"],
  //   queryFn: async () => await axios.get(`/courses/${data?._id}/resources`),
  //   enabled: Boolean(data?.id?.length),
  // });

  const {
    data: linkData,
    isLoading: linkIsLoading,
    isSuccess: linkIsSuccess,
    isError: linkIsError,
    error: linkError,
  } = useQuery({
    queryKey: ["courseLink"],
    queryFn: async () =>
      await axios.post(
        `/courses/generateLink`,
        { courseId: selectedCourseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ),
    enabled: Boolean(selectedCourseId?.length),
  });

  const handleClick = () => {
    // check if user is linked to an organization
    if (!user?.organization) {
      toast.error("You need to be part of an organization to upload files");
      return;
    }
    nav("new");
  };

  const handleGenerateLink = (examId: string) => {
    setSelectedCourseId(examId);
  };

  useEffect(() => {
    if (linkIsLoading) toast.success(`Generating link for course`);
    if (linkIsSuccess && linkData) setOpen(true);
    if (linkIsError)
      toast.error(linkError?.message || "Unable to generate course link");
  }, [linkIsSuccess, linkIsLoading, linkIsError, linkData]);

  useEffect(() => {
    if (changeClipboardIcon) {
      setInterval(() => {
        setChangeClipboardIcon(false);
      }, 1000);
    }
  }, [changeClipboardIcon]);

  return (
    <div className="p-4 flex flex-col gap-4 ">
      <Button className="w-[150px] self-end" onClick={handleClick}>
        Upload new file(s)
      </Button>
      {isLoading && (
        <div className="w-full flex flex-col items-center justify-between gap-2">
          <div className="w-full flex items-center justify-between gap-6">
            <Skeleton className="w-[200px] h-[30px] rounded-lg" />
            <Skeleton className="w-[100px] h-[30px] rounded-lg" />
          </div>
          <Skeleton className="w-full h-[150px] rounded-lg" />
          <div className="w-full flex items-center justify-end gap-6">
            <Skeleton className="w-[50px] h-[30px] rounded-lg" />
            <Skeleton className="w-[50px] h-[30px] rounded-lg" />
          </div>
        </div>
      )}
      {isError && (
        <p className="text-2xl text-red-500">
          {(error as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {data?.data?.length && (
        <DataTable<Partial<Course>, unknown>
          columns={getColumns(handleGenerateLink)}
          data={data.data}
          getSubRows={(row: Partial<Course>) => row.categories ?? []}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Course Link</DialogTitle>
            <DialogDescription>
              Copy the link and share with your students.
            </DialogDescription>
          </DialogHeader>
          {linkData?.data?.uploadLink && (
            <div className="flex items-center justify-between gap-4">
              <p>{linkData.data.uploadLink}</p>
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
          )}
          <div className="w-full flex flex-wrap gap-2 items-center justify-between"></div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Uploads;
