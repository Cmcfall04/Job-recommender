import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import type { ScanStartRequest, ScanStartResponse, ScanStatusResponse } from "../types";

export function useStartScan() {
  const queryClient = useQueryClient();
  return useMutation<ScanStartResponse, Error, ScanStartRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post("/scan/start", request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scan"] });
    },
  });
}

export function useScanStatus(scanId: number | null) {
  return useQuery<ScanStatusResponse>({
    queryKey: ["scan", scanId],
    queryFn: async () => {
      const { data } = await api.get(`/scan/${scanId}/status`);
      return data;
    },
    enabled: scanId !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "completed" || data.status === "failed")) {
        return false;
      }
      return 2000;
    },
  });
}
