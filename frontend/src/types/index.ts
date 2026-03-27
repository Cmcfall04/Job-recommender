export interface JobResponse {
  id: number;
  title: string;
  company: string;
  location: string | null;
  is_remote: boolean;
  source: string;
  url: string;
  posted_date: string | null;
  category: string | null;
  salary_min: number | null;
  salary_max: number | null;
  match_score: number | null;
  match_tier: string | null;
  skills_matched: string[] | null;
  status: string;
  created_at: string;
}

export interface JobDetailResponse extends JobResponse {
  description: string;
}

export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface ResumeResponse {
  id: number;
  filename: string;
  skills: string[];
  created_at: string;
}

export interface ResumeUploadResponse {
  id: number;
  filename: string;
  extracted_text_preview: string;
  skills: string[];
  created_at: string;
}

export interface ScanStartRequest {
  sources: string[];
  search_terms: string[];
  location: string;
  remote_only: boolean;
}

export interface ScanStartResponse {
  scan_id: number;
  status: string;
}

export interface ScanStatusResponse {
  scan_id: number;
  status: string;
  total_jobs: number;
  sources_completed: string[];
  errors: string[];
  started_at: string;
  completed_at: string | null;
}

export interface DashboardStats {
  total_jobs: number;
  strong_matches: number;
  medium_matches: number;
  low_matches: number;
  sources: Record<string, number>;
  latest_scan: {
    scan_id: number;
    status: string;
    total_jobs: number;
    started_at: string;
  } | null;
}

export interface ChartData {
  match_distribution: { tier: string; count: number }[];
  by_source: { source: string; count: number }[];
  by_category: { category: string; count: number }[];
}

export interface SettingsResponse {
  preferred_location: string | null;
  remote_only: boolean;
  search_terms: string[];
}
