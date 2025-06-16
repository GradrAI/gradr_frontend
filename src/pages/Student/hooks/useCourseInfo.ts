import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useCourseInfo = (courseId: string = "", uniqueCode: string = "") =>
  useQuery({
    queryKey: ["courseInfo", courseId, uniqueCode],
    queryFn: async () =>
      await api.get(`/courses/courseInfo/${courseId}/${uniqueCode}`),
    enabled: !!courseId && !!uniqueCode,
    select: (res) => res.data.data,
    refetchOnWindowFocus: false,
    retry: false,
  });
