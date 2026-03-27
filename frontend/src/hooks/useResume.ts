import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import type { ResumeResponse, ResumeUploadResponse } from "../types";

export function useCurrentResume() {
  return useQuery<ResumeResponse | null>({
    queryKey: ["resume", "current"],
    queryFn: async () => {
      const { data } = await api.get("/resume/current");
      return data;
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation<ResumeUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
