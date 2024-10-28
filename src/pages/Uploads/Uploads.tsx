import { Button } from "@/components/ui/button";
import initialUserState from "@/data/initialUserState";
import { Exam } from "@/types/Exam";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const nav = useNavigate();
  const [currentUser, setCurrentUser] = useState(initialUserState);

  useEffect(() => {
    const user = localStorage.getItem("user");
    let parsedUser = initialUserState;
    if (user) parsedUser = JSON.parse(user);
    if (parsedUser) setCurrentUser(parsedUser);
  }, []);

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: async () =>
      await axios.get(`/exams/users?userId=${currentUser._id}`),
    enabled: Boolean(currentUser?._id?.length),
  });

  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-start">
        {/* //! TO-DO: replace with skeleton loader */}
        <p className="text-3xl">Fetching uploads...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-8 flex items-start">
        <p className="text-3xl">An error occurred</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="">
        <div className="w-full p-4 flex flex-wrap items-center justify-between">
          <h1 className="font-bold text-3xl m-0">Uploads</h1>
          <Button className="w-[150px] self-end" onClick={() => nav("new")}>
            Upload new file(s)
          </Button>
        </div>
        <div className="flex gap-4 flex-wrap">
          {data?.data?.map(
            ({ _id, examName, guide, question, students }: Exam) => (
              <div
                key={_id}
                className="w-full md:w-1/4 flex flex-col gap-4 items-start justify-between p-4 border border-solid rounded-md"
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
    </div>
  );
};

export default Uploads;
