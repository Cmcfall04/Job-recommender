import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs, useUpdateJobStatus } from "../hooks/useJobs";
import FilterBar from "../components/FilterBar";
import JobTable from "../components/JobTable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Jobs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    match_tier: "",
    source: "",
    location: "",
    remote: "",
    category: "",
    sort: "match_score",
  });

  const { data: jobsData, isLoading } = useJobs({
    match_tier: filters.match_tier || undefined,
    source: filters.source || undefined,
    location: filters.location || undefined,
    remote: filters.remote === "true" ? true : undefined,
    category: filters.category || undefined,
    sort: filters.sort,
    order: "desc",
    page,
    per_page: 25,
  });
  const updateStatus = useUpdateJobStatus();

  const totalPages = jobsData ? Math.ceil(jobsData.total / 25) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {jobsData
            ? `${jobsData.total} jobs found`
            : "Loading..."}
        </p>
      </div>

      <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">Loading jobs...</p>
        </div>
      ) : (
        <JobTable
          jobs={jobsData?.jobs || []}
          onStatusChange={(jobId, status) =>
            updateStatus.mutate({ jobId, status })
          }
          onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
