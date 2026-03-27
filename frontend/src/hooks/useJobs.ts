import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import type { JobDetailResponse, JobListResponse } from "../types";

interface JobFilters {
  match_tier?: string;
  source?: string;
  location?: string;
  remote?: boolean;
  category?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: number;
  per_page?: number;
}

export function useJobs(filters: JobFilters = {}) {
  return useQuery<JobListResponse>({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get(`/jobs?${params.toString()}`);
      return data;
    },
  });
}

export function useJobDetail(jobId: number | null) {
  return useQuery<JobDetailResponse>({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}`);
      return data;
    },
    enabled: jobId !== null,
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      status,
    }: {
      jobId: number;
      status: string;
    }) => {
      const { data } = await api.patch(`/jobs/${jobId}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
