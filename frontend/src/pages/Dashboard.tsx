import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useDashboardCharts } from "../hooks/useDashboard";
import { useJobs, useUpdateJobStatus } from "../hooks/useJobs";
import { useCurrentResume } from "../hooks/useResume";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import StatsCards from "../components/StatsCards";
import MatchChart from "../components/MatchChart";
import SourceChart from "../components/SourceChart";
import JobTable from "../components/JobTable";
import FilterBar from "../components/FilterBar";
import ScanButton from "../components/ScanButton";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {
  FileText,
  AlertTriangle,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
} from "lucide-react";

const ALL_SOURCES = ["indeed", "google", "linkedin", "glassdoor", "handshake"];

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

  // Search config state
  const [configOpen, setConfigOpen] = useState(false);
  const [configLocation, setConfigLocation] = useState("");
  const [configRemoteOnly, setConfigRemoteOnly] = useState(false);
  const [configSearchTerms, setConfigSearchTerms] = useState("");
  const [configSources, setConfigSources] = useState([
    "indeed",
    "google",
    "linkedin",
    "glassdoor",
  ]);
  const [saved, setSaved] = useState(false);

  const { data: stats } = useDashboardStats();
  const { data: charts } = useDashboardCharts();
  const { data: resume } = useCurrentResume();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
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

  // Sync settings into local config state on load
  useEffect(() => {
    if (settings) {
      setConfigLocation(settings.preferred_location || "");
      setConfigRemoteOnly(settings.remote_only);
      setConfigSearchTerms(settings.search_terms.join(", "));
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        preferred_location: configLocation || null,
        remote_only: configRemoteOnly,
        search_terms: configSearchTerms
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  };

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

      {/* Search Configuration Panel */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setConfigOpen(!configOpen)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-gray-500" />
            Search Configuration
          </span>
          {configOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {configOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Terms */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Search Terms
                  <span className="font-normal text-gray-400 ml-1">
                    (comma-separated)
                  </span>
                </label>
                <textarea
                  value={configSearchTerms}
                  onChange={(e) => setConfigSearchTerms(e.target.value)}
                  rows={3}
                  placeholder="entry level software engineer, junior developer, entry level IT"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Location + Remote */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={configLocation}
                    onChange={setConfigLocation}
                    placeholder="e.g., Austin, TX"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configRemoteOnly}
                    onChange={(e) => setConfigRemoteOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remote jobs only</span>
                </label>
              </div>
            </div>

            {/* Sources */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Sources
              </label>
              <div className="flex flex-wrap gap-3">
                {ALL_SOURCES.map((src) => (
                  <label
                    key={src}
                    className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={configSources.includes(src)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfigSources([...configSources, src]);
                        } else {
                          setConfigSources(configSources.filter((s) => s !== src));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{src}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="pt-1">
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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
