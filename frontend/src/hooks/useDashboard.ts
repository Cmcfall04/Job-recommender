import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import type { ChartData, DashboardStats } from "../types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useDashboardCharts() {
  return useQuery<ChartData>({
    queryKey: ["dashboard", "charts"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/charts");
      return data;
    },
    refetchInterval: 10000,
  });
}
