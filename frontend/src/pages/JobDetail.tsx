import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  Wifi,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useJobDetail, useUpdateJobStatus } from "../hooks/useJobs";
import MatchBadge from "../components/MatchBadge";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobId = id ? parseInt(id) : null;
  const { data: job, isLoading } = useJobDetail(jobId);
  const updateStatus = useUpdateJobStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.is_remote && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Wifi className="w-4 h-4" />
                  Remote
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {job.posted_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {job.posted_date}
                </span>
              )}
              {(job.salary_min || job.salary_max) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salary_min && `$${job.salary_min.toLocaleString()}`}
                  {job.salary_min && job.salary_max && " - "}
                  {job.salary_max && `$${job.salary_max.toLocaleString()}`}
                </span>
              )}
              <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                {job.source}
              </span>
              {job.category && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {job.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <MatchBadge tier={job.match_tier} score={job.match_score} />
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Posting
            </a>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {["saved", "applied", "hidden"].map((status) => (
            <button
              key={status}
              onClick={() => updateStatus.mutate({ jobId: job.id, status })}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                job.status === status
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status === "saved"
                ? "Save"
                : status === "applied"
                ? "Mark Applied"
                : "Hide"}
            </button>
          ))}
        </div>
      </div>

      {/* Skills matched */}
      {job.skills_matched && job.skills_matched.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Skills Matched ({job.skills_matched.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_matched.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Job Description
        </h3>
        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
          {job.description}
        </div>
      </div>
    </div>
  );
}
