// import { PDFViewer } from "@react-pdf/renderer";
// import RDocument from "./RDocument";
import { useMutationState } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "semantic-ui-react";
const Details = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [clicked, setClicked] = useState(-1);

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
    _filePath = "";

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

    _filePath = answerFilesUrls[id];
    _markingGuide = markingGuide;
    _question = question;
    _onlineAnswers = onlineAnswers;

    if (gradingResponse?.length) {
      const { score, explanation, feedback } = gradingResponse.map(
        ({ value }) => JSON.parse(value)
      )[id];
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

      <div className="w-full h-full flex gap-4 justify-between overflow-hidden">
        <div
          className={`${
            clicked == -1 ? "w-2/12" : clicked == 0 ? "w-8/12" : "w-2/12"
          } h-100 text-stone-500 border flex flex-col gap-4 p-4 overflow-y-scroll cursor-pointer`}
          onClick={() => setClicked(0)}
        >
          <p className="text-xl">Question</p>
          <pre>{_question}</pre>

          {!!_filePath && <img src={_filePath} alt="student's answer" />}
        </div>

        <div
          className={`${
            clicked == -1 ? "w-5/12" : clicked == 1 ? "w-8/12" : "w-2/12"
          } h-100 text-stone-500 border flex flex-col gap-4 p-4 bg-slate-100 overflow-y-scroll cursor-pointer`}
          onClick={() => setClicked(1)}
        >
          <p className="text-xl">Marking guide</p>
          <pre>{_markingGuide}</pre>
        </div>

        <div
          className={`${
            clicked == -1 ? "w-5/12" : clicked == 2 ? "w-8/12" : "w-2/12"
          } h-100 text-stone-500 border flex flex-col gap-4 p-4 overflow-y-scroll cursor-pointer`}
          onClick={() => setClicked(2)}
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
      </div>

      <Button primary onClick={() => nav("..")} className="w-[10%] self-end">
        Approve
      </Button>
    </div>
  );
};

export default Details;
