import { ExternalLink, Bookmark, Send, EyeOff } from "lucide-react";
import type { JobResponse } from "../types";
import MatchBadge from "./MatchBadge";

interface Props {
  jobs: JobResponse[];
  onStatusChange: (jobId: number, status: string) => void;
  onSelectJob: (jobId: number) => void;
}

export default function JobTable({ jobs, onStatusChange, onSelectJob }: Props) {
  if (!jobs.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No jobs found. Try running a scan or adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Job
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Company
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Location
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Source
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Match
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectJob(job.id)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {job.title}
                      </p>
                      {job.category && (
                        <span className="text-xs text-gray-400">
                          {job.category}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-700">{job.company}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-600">
                    {job.is_remote ? "Remote" : job.location || "—"}
                    {job.is_remote && job.location && (
                      <span className="text-gray-400"> / {job.location}</span>
                    )}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                    {job.source}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <MatchBadge tier={job.match_tier} score={job.match_score} />
                </td>
                <td className="px-5 py-4">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Open job posting"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onStatusChange(job.id, "saved")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        job.status === "saved"
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title="Save"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStatusChange(job.id, "applied")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        job.status === "applied"
                          ? "text-emerald-600 bg-emerald-50"
                          : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title="Mark as applied"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStatusChange(job.id, "hidden")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        job.status === "hidden"
                          ? "text-gray-600 bg-gray-100"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title="Hide"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
