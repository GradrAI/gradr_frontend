import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useResourceInfo = (
  courseData: any,
  studentInfo: any,
  type: "answers" | "report"
) =>
  useQuery({
    queryKey: [
      "getResources",
      courseData?.category._id,
      studentInfo?.data?.student?._id,
      type,
    ],
    queryFn: async () =>
      await api.get(
        `/resources/${courseData?.category._id}/${studentInfo?.data?._id}/${type}`
      ),
    enabled:
      !!courseData?.course?._id && !!studentInfo?.data?._id?.length && !!type,
    select: (res) => res.data.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
