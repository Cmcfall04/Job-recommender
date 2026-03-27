import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useStartScan, useScanStatus } from "../hooks/useScan";
import { useQueryClient } from "@tanstack/react-query";

export default function ScanButton() {
  const [scanId, setScanId] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [sources, setSources] = useState([
    "indeed",
    "google",
    "linkedin",
    "glassdoor",
  ]);
  const [searchTerms, setSearchTerms] = useState(
    "entry level software engineer, entry level IT, junior developer, entry level cybersecurity"
  );
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const startScan = useStartScan();
  const scanStatus = useScanStatus(scanId);
  const queryClient = useQueryClient();

  const isScanning =
    startScan.isPending ||
    (scanStatus.data && scanStatus.data.status === "running");

  const handleScan = () => {
    startScan.mutate(
      {
        sources,
        search_terms: searchTerms.split(",").map((t) => t.trim()).filter(Boolean),
        location,
        remote_only: remoteOnly,
      },
      {
        onSuccess: (data) => {
          setScanId(data.scan_id);
          setShowConfig(false);
        },
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
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => (showConfig ? handleScan() : setShowConfig(true))}
          disabled={isScanning}
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
              {showConfig ? "Start Scan" : "Scan for Jobs"}
            </>
          )}
        </button>
        {showConfig && !isScanning && (
          <button
            onClick={() => setShowConfig(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      {showConfig && !isScanning && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-96 z-10">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Search Terms (comma-separated)
              </label>
              <textarea
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Austin, TX"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Remote only
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sources
              </label>
              <div className="flex flex-wrap gap-2">
                {["indeed", "google", "linkedin", "glassdoor", "handshake"].map(
                  (src) => (
                    <label
                      key={src}
                      className="flex items-center gap-1.5 text-xs text-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={sources.includes(src)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSources([...sources, src]);
                          } else {
                            setSources(sources.filter((s) => s !== src));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="capitalize">{src}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
