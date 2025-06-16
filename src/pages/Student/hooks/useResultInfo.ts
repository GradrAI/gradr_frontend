import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useResultInfo = (courseId: string = "", uniqueCode: string = "") =>
  useQuery({
    queryKey: ["results", courseId, uniqueCode],
    queryFn: async () => await api.get(`/results/${courseId}/${uniqueCode}`),
    enabled: !!courseId && !!uniqueCode,
    select: (res) => res.data,
    refetchOnWindowFocus: false,
    retry: false,
  });
