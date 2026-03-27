import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useDashboardCharts } from "../hooks/useDashboard";
import { useJobs, useUpdateJobStatus } from "../hooks/useJobs";
import { useCurrentResume } from "../hooks/useResume";
import StatsCards from "../components/StatsCards";
import MatchChart from "../components/MatchChart";
import SourceChart from "../components/SourceChart";
import JobTable from "../components/JobTable";
import FilterBar from "../components/FilterBar";
import ScanButton from "../components/ScanButton";
import { FileText, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    match_tier: "",
    source: "",
    location: "",
    remote: "",
    category: "",
    sort: "match_score",
  });

  const { data: stats } = useDashboardStats();
  const { data: charts } = useDashboardCharts();
  const { data: resume } = useCurrentResume();
  const { data: jobsData } = useJobs({
    match_tier: filters.match_tier || undefined,
    source: filters.source || undefined,
    location: filters.location || undefined,
    remote: filters.remote === "true" ? true : undefined,
    category: filters.category || undefined,
    sort: filters.sort,
    order: "desc",
    per_page: 20,
  });
  const updateStatus = useUpdateJobStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your job search at a glance
          </p>
        </div>
        <ScanButton />
      </div>

      {/* Resume warning */}
      {!resume && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              No resume uploaded
            </p>
            <p className="text-xs text-amber-600">
              Upload your resume to get match scores for job listings.
            </p>
          </div>
          <button
            onClick={() => navigate("/resume")}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Upload Resume
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Match Distribution
          </h3>
          <MatchChart data={charts?.match_distribution || []} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Jobs by Source
          </h3>
          <SourceChart data={charts?.by_source || []} />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Job Table */}
      <JobTable
        jobs={jobsData?.jobs || []}
        onStatusChange={(jobId, status) =>
          updateStatus.mutate({ jobId, status })
        }
        onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
      />

      {/* Pagination info */}
      {jobsData && jobsData.total > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {jobsData.jobs.length} of {jobsData.total} jobs
        </p>
      )}
    </div>
  );
}
