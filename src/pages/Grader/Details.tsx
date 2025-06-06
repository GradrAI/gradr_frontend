import { Button } from "@/components/ui/button";
import { Student } from "@/types/Student";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Details = () => {
  const nav = useNavigate();
  const {
    state: {
      result: { score, explanation, feedback },
    },
  } = useLocation();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  console.log("categoryId: ", categoryId);
  const studentId = searchParams.get("studentId");
  console.log("studentId: ", studentId);
  const [localData, setLocalData] = useState({
    markingGuide: "",
    question: "",
    score: "",
    explanation: "",
    feedback: "",
    onlineAnswers: ``,
    // onlineAnswers: `https://storage.googleapis.com/grdr/${categoryId}/OnlineAnswers.pdf `,
    studentAnswerUrl: "",
    report: "",
  });

  //! TO-DO: make API call to get institutionName, lecturerName, courseName and categoryType

  // const { data, isLoading, isSuccess, isError } = useQuery({
  //   queryKey: ["students"],
  //   queryFn: async () =>
  //     await axios.get<Student[]>(`/students?categoryId=${categoryId}`),
  // });

  // useEffect(() => {
  // if (data?.data?.length) {
  // const details = data.data.filter(({ _id }) => _id === studentId)[0];
  // console.log("details: ", details);
  // const {
  //   exams: {
  //     0: {
  //       file: { url },
  //       result: { score, explanation, feedback },
  //     },
  //   },
  // } = details;
  // setLocalData({
  //   ...localData,
  //   studentAnswerUrl:
  //     "https://storage.googleapis.com/" + url.split("//").at(-1),
  //   score,
  //   explanation,
  //   feedback,
  // });
  //   }
  // }, [data]);

  return (
    <div className="w-100 h-dvh flex flex-col gap-4 p-8">
      {/* <div className="w-100 py-6 flex justify-between items-center"> */}
      <Button onClick={() => nav("..")} className="self-start">
        Back
      </Button>
      {/* </div> */}

      <div className="flex flex-wrap gap-2 items-center justify-end text-end">
        <p
          onClick={() => {
            window.open(localData.question, "_blank", "noopener,noreferrer");
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.question.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Question
        </p>

        <p
          onClick={() => {
            window.open(
              localData.markingGuide,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.markingGuide.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Marking Guide
        </p>

        <p
          onClick={() => {
            window.open(
              localData.studentAnswerUrl,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.studentAnswerUrl.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          {`Student's Answer`}
        </p>

        <p
          onClick={() => {
            window.open(
              localData.onlineAnswers,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.onlineAnswers.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          {`Online Answers to question`}
        </p>

        <p
          onClick={() => {
            window.open(localData.report, "_blank", "noopener,noreferrer");
          }}
          className={`p-2 border rounded-xl m-0 ${!Boolean(localData.report.length) ? "text-gray-500 pointer-events-none" : "cursor-pointer text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 border-cyan-700"}`}
        >
          Student report
        </p>
      </div>

      <div className="w-full h-full flex flex-col gap-8 justify-start text-black border rounded-xl p-6 cursor-pointer">
        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Score</p>
          <p>{score}</p>
        </div>

        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Explanation</p>
          <p className="leading-relaxed">{explanation}</p>
        </div>

        <div className="flex flex-col justify-start">
          <p className="text-xl m-0 font-bold">Feedback</p>
          <p className="leading-relaxed">{feedback}</p>
        </div>
      </div>
    </div>
  );
};

export default Details;
