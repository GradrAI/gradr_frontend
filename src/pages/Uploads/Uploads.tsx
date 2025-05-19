import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useStore from "@/state";
import { ErrorResponse } from "@/types/ErrorResponse";
import { Exam } from "@/types/Exam";
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

const Uploads = () => {
  const nav = useNavigate();
  const { user, token } = useStore();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [open, setOpen] = useState(false);
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const {
    data: linkData,
    isLoading: linkIsLoading,
    isSuccess: linkIsSuccess,
    isError: linkIsError,
    error: linkError,
  } = useQuery({
    queryKey: ["examLink"],
    queryFn: async () =>
      await axios.post(
        `/exams/generateLink`,
        { examId: selectedExamId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ),
    enabled: Boolean(selectedExamId?.length),
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
    setSelectedExamId(examId);
  };

  useEffect(() => {
    if (linkIsLoading) toast.success(`Generating link for exam`);
    if (linkIsSuccess && linkData) setOpen(true);
    if (linkIsError)
      toast.error(linkError?.message || "Unable to generate exam link");
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
      <div className="w-full flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-bold text-3xl m-0">Uploads</h1>
        <Button className="w-[150px] self-end" onClick={handleClick}>
          Upload new file(s)
        </Button>
      </div>
      {isLoading && (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
          <Skeleton className="w-[250px] h-[200px] rounded-lg" />
          <Skeleton className="w-[250px] h-[200px] rounded-lg" />
          <Skeleton className="w-[250px] h-[200px] rounded-lg" />
        </div>
      )}
      {isError && (
        <p className="text-2xl text-red-500">
          {(error as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}
      <div className="flex gap-4 flex-wrap">
        {data?.data?.map(
          ({ _id, examName, guide, question, students }: Exam) => (
            <div
              key={_id}
              className="w-full md:w-1/4 flex flex-col gap-4 items-start justify-between p-4 border border-solid rounded-md bg-white shadow-md"
            >
              <div className="w-full flex justify-between items-start">
                <p className="font-semibold text-2xl text-slate-500">
                  {examName}
                </p>
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>
                      <EllipsisVertical />
                    </MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem onClick={() => handleGenerateLink(_id)}>
                        Generate link
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
              {Boolean(guide?.length) && (
                <a
                  target="_blank"
                  href={guide}
                  rel="noopener noreferrer"
                  className="text-blue-500 cursor-pointer"
                >
                  View marking guide
                </a>
              )}
              {Boolean(question?.length) && (
                <a
                  target="_blank"
                  href={question}
                  rel="noopener noreferrer"
                  className="text-blue-500 cursor-pointer"
                >
                  View question
                </a>
              )}
              {Boolean(students?.length) && (
                <p className="text-gray-500 cursor-not-allowed">
                  View student answers
                </p>
              )}
            </div>
          )
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exam Link</DialogTitle>
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
