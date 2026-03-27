import { useEffect, useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import api from "../api/client";
import type { SettingsResponse } from "../types";

export default function Settings() {
  const [, setSettings] = useState<SettingsResponse | null>(null);
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [searchTerms, setSearchTerms] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setSettings(data);
      setLocation(data.preferred_location || "");
      setRemoteOnly(data.remote_only);
      setSearchTerms(data.search_terms.join(", "));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    await api.put("/settings", {
      preferred_location: location || null,
      remote_only: remoteOnly,
      search_terms: searchTerms
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure your job search preferences
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Austin, TX"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Used as the default location for job scans
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Remote jobs only
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-6">
            Only show remote positions in search results
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Default Search Terms
          </label>
          <textarea
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            rows={3}
            placeholder="entry level software engineer, junior developer, entry level IT"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Comma-separated search terms used when scanning for jobs
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
    </div>
  );
}
