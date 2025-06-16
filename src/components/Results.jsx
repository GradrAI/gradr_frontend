import { useMutationState, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  TableRow,
  TableHeaderCell,
  TableHeader,
  TableFooter,
  TableCell,
  TableBody,
  Button,
  Table,
} from "semantic-ui-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useStore from "@/state";

const Results = () => {
  const nav = useNavigate();
  const { code, token } = useStore();
  const [clicked, setClicked] = useState(false);
  const [sheetsObject, setSheetsObject] = useState([]);
  const [sheetsUri, setSheetsUri] = useState("");
  const [buttonText, setButtonText] = useState("Export to Google Sheets.");

  const gradeData = useMutationState({
    filters: "gradeData",
    select: (mutation) => {
      let data = mutation.state?.data?.data;
      if (data) return data;
    },
  });

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["exportData"],
    queryFn: async (sheetsObject) =>
      await axios.post(`/oauth2callback`, {
        code,
        sheetsObject,
      }),
    enabled: Boolean(sheetsObject.length) && clicked && Boolean(token?.length),
  });

  let gradingResponse_ = useMemo(() => {
    if (gradeData?.length) {
      const filteredGradeData = gradeData.filter((el) => el);
      const filteredGradingResponse =
        filteredGradeData[0]?.data?.gradingResponse?.filter((el) => el);
      return filteredGradingResponse;
    } else {
      return [];
    }
  }, [gradeData]);

  useEffect(() => {
    if (data) {
      toast.success("Successfully exported data");
      console.log("data: ", data);
      setSheetsUri(data?.data?.data?.spreadsheetUrl);
    }
  }, [data]);

  useEffect(() => {
    if (isLoading) setButtonText("Exporting...");
    if (isError) {
      console.log("error: ", error);
      toast.error("An error occurred");
      setButtonText("Retry");
    }
  }, [isLoading, isError, error]);

  useEffect(() => {
    if (gradingResponse_?.length) {
      const re = gradingResponse_.map(({ parsedResponse: { score } }, id) => [
        `${id + 1}`,
        `${score}`,
      ]);
      const header = ["Student ID", "Grade"];
      setSheetsObject([header, ...re]);
    }
  }, [gradingResponse_]);

  const exportToGoogleSheets = () => {
    setClicked(true);
  };

  if (gradingResponse_[0]?.status == "rejected") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Oops. An error occurred.</p>
        <Button primary onClick={() => nav("/assessments")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-100 h-screen p-8 flex flex-col gap-6">
      {Boolean(sheetsUri) && (
        <div className="w-full h-max flex flex-col gap-0.5 justify-end content-end text-end">
          <p>Google Sheets url:</p>
          <p
            onClick={() => {
              window.open(sheetsUri, "_blank", "noopener,noreferrer");
            }}
            className="text-cyan-500 cursor-pointer"
          >
            {sheetsUri}
          </p>
        </div>
      )}

      <Table columns={3}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Student ID</TableHeaderCell>
            <TableHeaderCell>Grade</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {gradingResponse_?.map(({ parsedResponse }, id) => (
            <TableRow key={id}>
              <TableCell>{id + 1}</TableCell>
              <TableCell>{parsedResponse.score}</TableCell>
              <TableCell>
                <Button secondary onClick={() => nav(`${id}`)}>
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter fullWidth>
          <TableRow>
            <TableHeaderCell colSpan="6">
              <Button
                floated="right"
                primary
                size="small"
                onClick={exportToGoogleSheets}
                disabled={Boolean(sheetsUri)}
                className={Boolean(sheetsUri) && "cursor-not-allowed"}
              >
                {buttonText}
              </Button>
            </TableHeaderCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default Results;
