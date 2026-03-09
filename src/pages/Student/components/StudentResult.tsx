import { Button } from "@/components/ui/button";
import { useResourceInfo } from "../hooks/useResourceInfo";
import { QuestionResult } from "@/types/Result";

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
            <p className="font-semibold text-lg text-violet-500 m-0">Overall Score</p>
            <p className="text-2xl font-bold">{data?.score}</p>
          </div>

          {data?.results && data.results.length > 0 && (
            <div className="w-full space-y-4">
              <p className="font-semibold text-lg text-slate-700 m-0 border-b pb-1">Question Breakdown</p>
              <div className="grid gap-4">
                {data.results.map((res: QuestionResult, index: number) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-violet-200 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-slate-800">{res.questionId || `Question ${index + 1}`}</span>
                      <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Score: {res.score}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Explanation</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{res.explanation}</p>
                      </div>
                      {res.feedback && (
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Feedback</p>
                          <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-green-400 pl-3">{res.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!data?.results?.length && (
            <>
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
            </>
          )}

          {data?.results?.length > 0 && (
            <div className="w-full p-6 bg-slate-900 rounded-2xl text-white">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-2 h-6 bg-violet-500 rounded-full" />
                 Overall Summary
               </h3>
               <div className="space-y-6">
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Justification</p>
                   <p className="text-slate-200 leading-relaxed">{data?.explanation}</p>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Learning Roadmap</p>
                   <p className="text-slate-200 leading-relaxed">{data?.feedback}</p>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentResult;
