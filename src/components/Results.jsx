import { useMutationState, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useStore from "@/state";
import api from "@/lib/axios";

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
      await api.post(`/oauth2callback`, {
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
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p>Oops. An error occurred.</p>
        <Button onClick={() => nav("/assessments")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-8 flex flex-col gap-6">
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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Student ID</TableHead>
              <TableHead className="font-bold">Grade</TableHead>
              <TableHead className="font-bold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {gradingResponse_?.map(({ parsedResponse }, id) => (
              <TableRow key={id} className="hover:bg-muted/30">
                <TableCell>{id + 1}</TableCell>
                <TableCell>{parsedResponse.score}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" onClick={() => nav(`${id}`)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="bg-transparent border-t">
            <TableRow>
              <TableCell colSpan={3} className="p-4">
                <div className="flex justify-end">
                  <Button
                    onClick={exportToGoogleSheets}
                    disabled={Boolean(sheetsUri) || isLoading}
                    className={Boolean(sheetsUri) ? "cursor-not-allowed opacity-50" : ""}
                  >
                    {buttonText}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default Results;
