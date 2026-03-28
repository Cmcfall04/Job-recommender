import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useStartScan, useScanStatus } from "../hooks/useScan";
import { useSettings } from "../hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";

export default function ScanButton() {
  const [scanId, setScanId] = useState<number | null>(null);

  const { data: settings } = useSettings();
  const startScan = useStartScan();
  const scanStatus = useScanStatus(scanId);
  const queryClient = useQueryClient();

  const isScanning =
    startScan.isPending ||
    (scanStatus.data && scanStatus.data.status === "running");

  const handleScan = () => {
    if (!settings) return;
    startScan.mutate(
      {
        sources: ["indeed", "google", "linkedin", "glassdoor"],
        search_terms: settings.search_terms,
        location: settings.preferred_location || "",
        remote_only: settings.remote_only,
      },
      {
        onSuccess: (data) => setScanId(data.scan_id),
      }
    );
  };

  // Refresh data when scan completes
  if (scanStatus.data?.status === "completed" && scanId) {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setScanId(null);
  }

  return (
    <button
      onClick={handleScan}
      disabled={isScanning || !settings}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isScanning ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Scanning...
          {scanStatus.data && (
            <span className="text-blue-200">
              ({scanStatus.data.total_jobs} jobs)
            </span>
          )}
        </>
      ) : (
        <>
          <Search className="w-4 h-4" />
          Scan for Jobs
        </>
      )}
    </button>
  );
}
