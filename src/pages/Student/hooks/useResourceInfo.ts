import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useResourceInfo = (
  courseData: any,
  studentInfo: any,
  type: "answers" | "report" | "guide" | "onlineAnswer" | "generatedExam",
  scope: "category" | "course" = "category"
) =>
  useQuery({
    queryKey: [
      "getResources",
      courseData?.course?._id,
      scope === "category" ? courseData?.category?._id : null,
      studentInfo?.data?._id,
      type,
    ],
    queryFn: async () => {
      const courseId = courseData?.course?._id;
      const categoryId = scope === "category" ? courseData?.category?._id : undefined;
      const userId = studentInfo?.data?._id;
      
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId);
      if (userId) params.append("userId", userId);
      
      return await api.get(
        `/resources/student/${courseId}/${type}?${params.toString()}`
      );
    },
    enabled:
      !!courseData?.course?._id && !!type,
    select: (res) => res.data.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
