import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetch on every mount
      gcTime: 10 * 60 * 1000, // 10 minutes — keep unused cache for reuse
      retry: (failureCount, error: unknown) => {
        // Don't retry on client errors (4xx)
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
