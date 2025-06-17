import { Button } from "@/components/ui/button";
import { useResourceInfo } from "../hooks/useResourceInfo";

interface StudentResultProps {
  resultInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  courseInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
  studentInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
}

const StudentResult: React.FC<StudentResultProps> = ({
  resultInfo,
  courseInfo,
  studentInfo,
}) => {
  const { data } = resultInfo;
  const { data: courseData } = courseInfo;
  const { data: resourceData } = useResourceInfo(
    courseData,
    studentInfo,
    "report"
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between pb-8">
        <h1 className="m-0">Result breakdown</h1>

        {resourceData && (
          <a
            href={resourceData.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="self-end"
          >
            <Button className="">Download PDF report</Button>
          </a>
        )}
      </div>

      {data && Object.keys(data)?.length && (
        <div className="flex flex-col gap-8 items-start justify-start text-justify">
          <div className="flex flex-col items-start justify-start">
            <p className="font-semibold text-lg text-violet-500 m-0">Score</p>
            <p className="">{data?.score}</p>
          </div>
          <div className="flex flex-col items-start justify-start">
            <p className="font-semibold text-lg text-red-500 m-0">
              Explanation
            </p>
            <p className="">{data?.explanation}</p>
          </div>
          <div className="flex flex-col items-start justify-start">
            <p className="font-semibold text-lg text-green-500 m-0">Feedback</p>
            <p className="">{data?.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResult;
