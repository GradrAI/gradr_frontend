// import { PDFViewer } from "@react-pdf/renderer";
// import RDocument from "./RDocument";
import { useMutationState } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "semantic-ui-react";
const Details = () => {
  const { id } = useParams();
  const nav = useNavigate();

  const data = useMutationState({
    filters: "gradeData",
    select: (mutation) => {
      let data = mutation.state?.data?.data;
      if (data) return data;
    },
  });

  let _markingGuide = "",
    _question = "",
    _score = "",
    _explanation = "",
    _feedback = "",
    _onlineAnswers = "",
    _studentAnswer = "";

  console.log("data: ", data);
  if (data?.length) {
    const filteredData = data.filter((el) => el);
    const {
      data: {
        question,
        markingGuide,
        gradingResponse,
        onlineAnswers,
        answerFilesUrls,
      },
    } = filteredData[0];

    _studentAnswer = answerFilesUrls[id];
    _markingGuide = markingGuide;
    _question = question;
    _onlineAnswers = onlineAnswers;

    if (gradingResponse?.length) {
      const { score, explanation, feedback } = gradingResponse
        .filter((el) => el)
        .map((response) => JSON.parse(response))[id];
      //! TO-DO: remove special characters(/n, *) and format appropriately
      _score = score;
      _explanation = explanation;
      _feedback = feedback;
    }
  }

  return (
    <div className="w-100 h-dvh flex flex-col gap-4 p-8">
      <Button primary onClick={() => nav("..")} className="w-[10%] self-start">
        Go back
      </Button>

      <div className="flex flex-col items-end justify-between gap-2 text-end">
        <div className="flex flex-col gap-0">
          <p
            onClick={() => {
              window.open(_question, "_blank", "noopener,noreferrer");
            }}
            className="text-cyan-500 cursor-pointer"
          >
            View Question
          </p>
        </div>

        <div className="flex flex-col gap-0">
          <p
            onClick={() => {
              window.open(_markingGuide, "_blank", "noopener,noreferrer");
            }}
            className="text-cyan-500 cursor-pointer"
          >
            View marking guide
          </p>
        </div>

        <div className="flex flex-col gap-0">
          <p
            onClick={() => {
              window.open(_studentAnswer, "_blank", "noopener,noreferrer");
            }}
            className="text-cyan-500 cursor-pointer"
          >
            {`View student's answer`}
          </p>
        </div>
      </div>

      <div
        className={`w-full min-h-full h-full flex gap-4 justify-between text-stone-500 border flex flex-col gap-4 p-4 overflow-y-scroll cursor-pointer`}
      >
        <div>
          <p className="text-xl">Score</p>
          <p>{_score}</p>
        </div>

        <div>
          <p className="text-xl">Explanation</p>
          <p>{_explanation}</p>
        </div>

        <div>
          <p className="text-xl">Feedback</p>
          <p>{_feedback}</p>
        </div>

        <div>
          <p className="text-xl">Online Answers</p>
          <pre>{_onlineAnswers}</pre>
        </div>
      </div>

      <Button primary onClick={() => nav("..")} className="w-[10%] self-end">
        Approve
      </Button>
    </div>
  );
};

export default Details;
