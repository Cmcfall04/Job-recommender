import { MapPin, Wifi } from "lucide-react";

interface Filters {
  match_tier: string;
  source: string;
  location: string;
  remote: string;
  category: string;
  sort: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Match Tier */}
        <select
          value={filters.match_tier}
          onChange={(e) => update("match_tier", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Matches</option>
          <option value="strong">Strong Match</option>
          <option value="medium">Medium Match</option>
          <option value="low">Low Match</option>
        </select>

        {/* Source */}
        <select
          value={filters.source}
          onChange={(e) => update("source", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Sources</option>
          <option value="indeed">Indeed</option>
          <option value="linkedin">LinkedIn</option>
          <option value="glassdoor">Glassdoor</option>
          <option value="google">Google Jobs</option>
          <option value="handshake">Handshake</option>
        </select>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="SWE">Software Engineering</option>
          <option value="IT">IT</option>
          <option value="AI/ML">AI / ML</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Other">Other</option>
        </select>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => update("location", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          />
        </div>

        {/* Remote Toggle */}
        <button
          onClick={() =>
            update("remote", filters.remote === "true" ? "" : "true")
          }
          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
            filters.remote === "true"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          Remote
        </button>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-auto"
        >
          <option value="match_score">Sort by Match</option>
          <option value="date">Sort by Date</option>
          <option value="company">Sort by Company</option>
        </select>
      </div>
    </div>
  );
}
