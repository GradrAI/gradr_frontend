import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const nav = useNavigate();
  const [userId, setUserId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (user && user._id) {
      setUserId(user._id);
    }
  }, [user]);

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await axios.get(`/exams/users/${userId}/exams`);
      return res;
    },
    enabled: Boolean(userId.length),
  });

  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-start">
        //! TO-DO: replace with skeleton loader
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
      <Button className="w-[150px] self-end p-4" onClick={() => nav("new")}>
        Upload new file(s)
      </Button>
      <div className="">
        <h1 className="font-bold text-3xl">Uploads</h1>
        <div className="flex gap-4 flex-wrap">
          {data?.data?.map(({ _id, examName, guide, question, answers }) => (
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
              {Boolean(answers?.length) && (
                <a
                  target="_blank"
                  href={answers}
                  rel="noopener noreferrer"
                  className="text-blue-500 cursor-pointer"
                >
                  View student answers
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Uploads;
