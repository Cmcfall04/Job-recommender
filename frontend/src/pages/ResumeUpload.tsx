import { useCurrentResume } from "../hooks/useResume";
import FileUpload from "../components/FileUpload";
import { FileText, Calendar, Sparkles } from "lucide-react";

export default function ResumeUpload() {
  const { data: resume, isLoading } = useCurrentResume();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload your resume to enable job matching
        </p>
      </div>

      <FileUpload />

      {/* Current resume info */}
      {isLoading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : resume ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {resume.filename}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Uploaded {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Detected Skills ({resume.skills.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-gray-400">
          No resume uploaded yet
        </div>
      )}
    </div>
  );
}
