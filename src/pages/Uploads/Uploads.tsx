import { Button } from "@/components/ui/button";
import useStore from "@/state";
import { ErrorResponse } from "@/types/ErrorResponse";
import { Exam } from "@/types/Exam";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const nav = useNavigate();
  const { user } = useStore();

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  const handleClick = () => {
    // check if user is tied to an organization
    if (!user?.organization) {
      toast.error("You need to be part of an organization to upload files");
      return;
    }
    nav("new");
  };

  return (
    <div className="p-4 flex flex-col gap-4 ">
      <div className="w-full flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-bold text-3xl m-0">Uploads</h1>
        <Button className="w-[150px] self-end" onClick={handleClick}>
          Upload new file(s)
        </Button>
      </div>
      {isLoading && <p className="text-2xl">Fetching uploads...</p>}
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
              <p className="font-semibold text-2xl text-slate-500">
                {examName}
              </p>
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
    </div>
  );
};

export default Uploads;
