import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { Category } from "@/types/Category";
import { Student } from "@/types/Student";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type AssessmentStat = {
  totalUniqueStudents: number;
  gradedCount: number;
  averageScore: string;
  highestScore: number;
  lowestScore: number;
};

const AssessmentDetails = () => {
  const { courseId } = useParams();
  const [assessmentStat, setAssessmentStat] = useState<AssessmentStat | null>(
    null
  );
  const { isSuccess, isLoading, isError, error, data } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () =>
      await api.get(
        `/courses/${decodeURI(courseId ?? "")}/students-by-category`
      ),
      select: (res) => res.data.data,
  });

  useEffect(() => {
    if (isSuccess && data?.stats) {
      setAssessmentStat(data.stats);
    }
  }, [isSuccess, data]);

  return (
    <div className="p-4">
      {isError && (error?.message || "An error occurred")}

      {isLoading && (
        <div className="flex flex-col gap-6 items-start justify-between">
          <Skeleton className="w-[150px] h-[50px] rounded-md" />

          <div className="flex flex-col gap-2 items-start justify-between">
            <Skeleton className="w-[200px] h-[40px] rounded-md" />
            <Skeleton className="w-[200px] h-[40px] rounded-md" />
            <Skeleton className="w-[200px] h-[40px] rounded-md" />
            <Skeleton className="w-[200px] h-[40px] rounded-md" />
            <Skeleton className="w-[200px] h-[40px] rounded-md" />
          </div>
        </div>
      )}
      {data && (
        <>
          <h1 className="text-green-500">{data?.courseName}</h1>
          <div className="mt-4 flex flex-col gap-4">
            <p>
              <span className="font-semibold text-xl">Categories:</span>{" "}
              {data?.categories?.length}
            </p>

            <p>
              <span className="font-semibold text-xl">Number of students:</span>{" "}
              <span className="">{assessmentStat?.totalUniqueStudents}</span>
            </p>
            <p>
              <span className="font-semibold text-xl">Total Graded:</span>{" "}
              <span className="">{assessmentStat?.gradedCount}</span>
            </p>
            <p>
              <span className="font-semibold text-xl">Average Score:</span>{" "}
              <span className="">{assessmentStat?.averageScore}</span>
            </p>
            <p>
              <span className="font-semibold text-xl">Highest Score:</span>{" "}
              <span className="">{assessmentStat?.highestScore}</span>
            </p>
            <p>
              <span className="font-semibold text-xl">Lowest Score:</span>{" "}
              <span className="">{assessmentStat?.lowestScore}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AssessmentDetails;
