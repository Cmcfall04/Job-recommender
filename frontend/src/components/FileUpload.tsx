import { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useUploadResume } from "../hooks/useResume";

export default function FileUpload() {
  const [dragOver, setDragOver] = useState(false);
  const upload = useUploadResume();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        alert("Please upload a PDF file");
        return;
      }
      upload.mutate(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (upload.isSuccess && upload.data) {
    return (
      <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-emerald-800">
          Resume uploaded successfully!
        </p>
        <p className="text-xs text-emerald-600 mt-1">
          {upload.data.filename} — {upload.data.skills.length} skills detected
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {upload.data.skills.slice(0, 15).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-white rounded text-xs text-emerald-700 border border-emerald-200"
            >
              {skill}
            </span>
          ))}
          {upload.data.skills.length > 15 && (
            <span className="px-2 py-0.5 text-xs text-emerald-500">
              +{upload.data.skills.length - 15} more
            </span>
          )}
        </div>
        <button
          onClick={() => upload.reset()}
          className="mt-4 text-xs text-emerald-600 hover:text-emerald-800 underline"
        >
          Upload a different resume
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {upload.isPending ? (
        <div>
          <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-600">
            Processing resume... extracting skills and computing embeddings
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            {dragOver ? (
              <FileText className="w-6 h-6 text-blue-500" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">
            Drop your resume here, or{" "}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
              browse
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF files only</p>
        </>
      )}

      {upload.isError && (
        <p className="text-sm text-red-600 mt-3">
          Upload failed: {upload.error.message}
        </p>
      )}
    </div>
  );
}
