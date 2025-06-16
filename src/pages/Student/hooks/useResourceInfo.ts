import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useResourceInfo = (courseData: any, matricNo: string) =>
  useQuery({
    queryKey: ["getResources", courseData?.category._id, matricNo],
    queryFn: async () =>
      await api.get(`/resources/${courseData?.category._id}/${matricNo}`),
    enabled: !!courseData?.course?._id && !!matricNo,
    select: (res) => res.data.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
