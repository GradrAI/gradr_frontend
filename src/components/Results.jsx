import { useMutationState, useMutation } from "@tanstack/react-query";
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
import { BASE_URL } from "../requests/constants";
import { useMemo } from "react";

const Results = () => {
  const nav = useNavigate();
  const code = localStorage.getItem("code");

  const { isFetching, isLoading, isError, isSuccess, error, data, mutate } =
    useMutation({
      mutationKey: ["exportData"],
      mutationFn: async ({ code, sheetsObject }) => {
        try {
          return await axios.post(`${BASE_URL}/api/oauth2callback`, {
            code,
            sheetsObject,
          });
        } catch (error) {
          console.log(error);
        }
      },
      // retry: 3,
    });

  const gradeData = useMutationState({
    filters: "gradeData",
    select: (mutation) => {
      let data = mutation.state?.data?.data;
      if (data) return data;
    },
  });

  let buttonText = "Export to Google Sheets.";
  let gradingResponse_ = useMemo(() => {
    if (gradeData?.length) {
      const filteredGradeData = gradeData.filter((el) => el);
      const filteredGradingResponse =
        filteredGradeData[0]?.data?.gradingResponse?.filter((el) => el);
      return filteredGradingResponse?.map((response) => JSON.parse(response));
    } else {
      return [];
    }
  }, [gradeData]);

  // let gradingResponse_ = [];
  // console.log("gradeData: ", gradeData);
  // if (gradeData?.length) {
  //   const filteredGradeData = gradeData.filter((el) => el);
  //   console.log("filteredGradeData: ", filteredGradeData);
  //   const {
  //     data: { gradingResponse }, // gradingResponse
  //   } = filteredGradeData[0];

  //   gradingResponse_ = gradingResponse?.map(({ value }) => JSON.parse(value));
  // }

  let sheetsUri = "";
  if (isFetching || isLoading) buttonText = "Exporting...";
  if (isError) {
    console.log("error: ", error);
    toast.error("An error occurred");
    buttonText = "Retry";
  }
  if (isSuccess && data) {
    toast.success("Successfully exported data");
    console.log("data: ", data);
    sheetsUri = data?.data?.data?.spreadsheetUrl;
  }

  const exportToGoogleSheets = () => {
    if (code && gradingResponse_?.length) {
      const re = gradingResponse_.map(({ score }, id) => [
        `${id + 1}`,
        `${score}`,
      ]);
      const header = ["Student ID", "Grade"];
      const sheetsObject = [header, ...re];
      console.log("sheetsObject: ", sheetsObject);
      mutate({ code, sheetsObject }); // mutation that makes call to endpoint that (1) creates new sheet and (2) appends values to the sheet
    }
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
          {gradingResponse_?.map((el, id) => (
            <TableRow key={id}>
              <TableCell>{id + 1}</TableCell>
              <TableCell>{el.score}</TableCell>
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
