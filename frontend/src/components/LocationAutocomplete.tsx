import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    state_code?: string;
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function formatSuggestion(result: NominatimResult): string {
  const city =
    result.address.city ||
    result.address.town ||
    result.address.village ||
    result.address.county ||
    "";
  const state = result.address.state_code || result.address.state || "";
  return city && state ? `${city}, ${state}` : result.display_name;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., Austin, TX",
  className = "",
}: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync when parent changes the value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced fetch
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=us&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "User-Agent": "job-recommender-app/1.0" },
        });
        if (!res.ok) return;
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        if (data.length > 0) setIsOpen(true);
      } catch {
        // Aborted or network error — silently ignore
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (result: NominatimResult) => {
    const formatted = formatSuggestion(result);
    setQuery(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        className={className}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400 pointer-events-none" />
      )}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
            >
              {formatSuggestion(s)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
