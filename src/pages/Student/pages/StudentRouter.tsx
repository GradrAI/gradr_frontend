// src/pages/Student/components/StudentRouter.tsx
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import StudentUpload from "../pages/StudentUpload"; // Adjust path as needed
import { useCourseInfo } from "../hooks/useCourseInfo";
import ExamComponent from "./ExamComponent";
import { useEffect } from "react";
import useStore from "@/state";
import SignInPrompt from "../components/SignInPrompt";

const StudentRouter = () => {
  const nav = useNavigate();
  const { courseId, uniqueCode } = useParams();
  const { user } = useStore();
  const {
    data: courseData,
    isLoading,
    isError,
    error,
  } = useCourseInfo(courseId, uniqueCode);

  useEffect(() => {
    if (courseData && user) {
      const category = courseData.category;
      const isGrading = uniqueCode === category.uniqueCodes?.grading;
      const isExam = uniqueCode === category.uniqueCodes?.exam;

      if (isExam) {
        nav("quiz");
      } else if (isGrading) {
        nav("grading");
      }
    }
  }, [courseData, uniqueCode, nav, user]);

  if (isLoading) {
    return <Skeleton className="w-full h-[200px] rounded-sm" />;
  }

  if (error || !courseData) {
    return <div>Error loading course information. Please check the link.</div>;
  }

  if (!user) {
    return (
      <SignInPrompt
        courseInfo={{ data: courseData, isLoading, isError, error }}
        uniqueCode={uniqueCode}
        courseId={courseId}
      />
    );
  }

  return <div>Redirecting...</div>;
};

export default StudentRouter;
