import { Category } from "@/types/Category";
import { Student } from "@/types/Student";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
  const { isSuccess, data } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () =>
      await axios.get(
        `/courses/${decodeURI(courseId ?? "")}/students-by-category`
      ),
  });

  useEffect(() => {
    if (isSuccess && data?.data?.data) {
      const uniqueStudentIds = new Set();
      const scores: number[] = [];
      let gradedCount = 0;

      data?.data?.data.categories.forEach((category: Category) => {
        category?.students?.forEach(({ student, result }) => {
          uniqueStudentIds.add(student.studentId);
          if (result?.score) {
            gradedCount++;
            const [score] = result.score.split("/").map(Number);
            scores.push(score);
          }
        });
      });

      const totalScore = scores.reduce((sum, s) => sum + s, 0);
      const averageScore = scores?.length
        ? (totalScore / scores.length).toFixed(2)
        : "0";

      setAssessmentStat({
        totalUniqueStudents: uniqueStudentIds.size,
        gradedCount,
        averageScore,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
      });
    }
  }, [isSuccess, data]);

  return (
    <div className="p-4">
      <h1 className="text-green-500">{data?.data?.data?.courseName}</h1>
      <p>
        <span className="font-semibold text-xl">Categories:</span>{" "}
        {data?.data?.data?.categories?.length}
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
  );
};

export default AssessmentDetails;
