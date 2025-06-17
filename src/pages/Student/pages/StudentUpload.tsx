import { useParams } from "react-router-dom";
import useStore from "@/state";
import { Skeleton } from "@/components/ui/skeleton";
import StudentHeader from "../components/StudentHeader";
import SignInPrompt from "../components/SignInPrompt";
import StudentUploadDetails from "../components/StudentUploadDetails";
import StudentUploadForm from "../components/StudentUploadForm";
import StudentResult from "../components/StudentResult";
import StudentGrade from "../components/StudentGrade";
import { useCourseInfo } from "../hooks/useCourseInfo";
import { useResourceInfo } from "../hooks/useResourceInfo";
import { useResultInfo } from "../hooks/useResultInfo";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const StudentUpload = () => {
  const queryClient = useQueryClient();
  const { courseId, uniqueCode } = useParams();
  const { user } = useStore();
  const [matricNo, setMatricNo] = useState("");

  const studentInfo = useQuery({
    queryKey: ["studentInfo"],
    queryFn: async () => await api.get(`/students/${matricNo}`),
    enabled: !!matricNo?.length,
    select: (res) => res.data.data,
  });

  const courseInfo = useCourseInfo(courseId, uniqueCode);
  const { isLoading: courseIsLoading, data: courseData } = courseInfo;

  const resourceInfo = useResourceInfo(courseData, studentInfo, "answers");
  const resultInfo = useResultInfo(courseId, uniqueCode);

  const shouldSignIn = !user;
  const hasResult = resultInfo?.data;
  const hasUpload = resourceInfo?.data;

  const userInfo = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => await api.get(`user/student`),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    if (courseData?.category._id && userInfo?.data?.studentId) {
      setMatricNo(userInfo.data.studentId);
      queryClient.invalidateQueries({
        queryKey: [
          "getResources",
          courseData?.category._id,
          userInfo.data.studentId,
        ],
      });
    }
  }, [userInfo]);

  return (
    <>
      <StudentHeader user={user} />

      <div className="md:w-2/4 p-6 flex flex-col gap-4">
        {!hasResult && (
          <div className="flex flex-row items-baseline justify-start gap-1 font-bold">
            <h2>Grade</h2>
            <span>
              {courseIsLoading && (
                <Skeleton className="w-[60px] h-[20px] rounded-sm" />
              )}
            </span>
            <span className="text-green-500 text-2xl">
              {courseData?.course?.name}
            </span>
          </div>
        )}

        {shouldSignIn ? (
          <SignInPrompt
            courseInfo={courseInfo}
            uniqueCode={uniqueCode}
            courseId={courseId}
          />
        ) : hasResult ? (
          <StudentResult
            resultInfo={resultInfo}
            courseInfo={courseInfo}
            studentInfo={studentInfo}
          />
        ) : hasUpload ? (
          <div className="flex flex-col gap-2">
            <StudentUploadDetails resourceInfo={resourceInfo} />
            <StudentGrade
              courseInfo={courseInfo}
              resourceInfo={resourceInfo}
              user={user}
              userInfo={userInfo}
              matricNo={matricNo}
              uniqueCode={uniqueCode}
            />
          </div>
        ) : (
          <StudentUploadForm
            courseInfo={courseInfo}
            user={user}
            setMatricNo={setMatricNo}
          />
        )}
      </div>
    </>
  );
};

export default StudentUpload;
