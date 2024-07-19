import { useState, useEffect } from "react";
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

const Results = () => {
  const nav = useNavigate();
  const [sheetsUri, setSheetsUri] = useState("");

  const code = localStorage.getItem("code");

  const {
    isFetching: exportIsFetching,
    isLoading: exportIsLoading,
    isError: exportIsError,
    isSuccess: exportIsSuccess,
    error: exportError,
    data: exportData,
    mutate: exportMutate,
  } = useMutation({
    mutationKey: ["gradeData"],
    mutationFn: async ({ code, sheetsObject }) => {
      try {
        const res = await axios.post(`${BASE_URL}/api/oauth2callback`, {
          code,
          sheetsObject,
        });
        console.log("res: ", res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    // retry: 3,
  });

  // const data = useMutationState({
  //   filters: "gradeData",
  //   select: (mutation) => {
  //     let data = mutation.state?.data?.data;
  //     if (data) return data;
  //   },
  // });

  let _gradingResponse = [{ score: "17/60" }, { score: "35/60" }]; //! test data to be used till new Gemini resource is created
  // let _gradingResponse = [];
  // console.log("data: ", data);
  // if (data?.length) {
  //   const {
  //     data: { gradingResponse }, // gradingResponse
  //   } = data[0];

  //   _gradingResponse = gradingResponse;
  // }

  let buttonText = "Export to Google Sheets.";

  useEffect(() => {
    if (exportIsFetching || exportIsLoading) buttonText = "Exporting...";
    if (exportIsError) {
      console.log("error: ", exportError);
      toast.error("An error occurred");
      buttonText = "Retry";
    }
    if (exportIsSuccess) {
      toast.success("Successfully exported data");
      console.log("data: ", exportData);
      setSheetsUri(exportData?.data?.data?.spreadsheetUrl);
    }
  }, [
    exportIsFetching,
    exportIsLoading,
    exportIsError,
    exportIsSuccess,
    exportData,
  ]);

  const exportToGoogleSheets = () => {
    if (code && _gradingResponse?.length) {
      const re = _gradingResponse?.map(({ score }, id) => [
        `${id + 1}`,
        `${score}`,
      ]);
      const header = ["Student ID", "Grade"];
      const sheetsObject = [header, ...re];
      exportMutate({ code, sheetsObject }); // makes call to endpoint that (1) creates new sheet and (2) appends values to the sheet
    }
  };

  // if (_gradingResponse[0]?.status == "rejected") {
  //   return (
  //     <div
  //       style={{
  //         width: "100%",
  //         height: "100%",
  //         display: "flex",
  //         flexDirection: "column",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <p>Oops. An error occurred.</p>
  //       <Button primary onClick={() => nav("/assessments")}>
  //         Go back
  //       </Button>
  //     </div>
  //   );
  // }

  console.log("sheetsUri: ", sheetsUri);

  return (
    <div className="w-100 h-screen p-8 flex flex-col gap-6">
      {sheetsUri && (
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

        {/* ?.map(({ value }) => JSON.parse(value)) */}
        <TableBody>
          {_gradingResponse.map(({ score }, id) => (
            <TableRow key={id}>
              <TableCell>{id + 1}</TableCell>
              <TableCell>{score}</TableCell>
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
