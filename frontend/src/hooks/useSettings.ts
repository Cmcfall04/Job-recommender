import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import type { SettingsResponse } from "../types";

export function useSettings() {
  return useQuery<SettingsResponse>({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then((r) => r.data),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<SettingsResponse, Error, Partial<SettingsResponse>>({
    mutationFn: (payload) => api.put("/settings", payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
