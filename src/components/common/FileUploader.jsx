import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, CheckCircle, AlertCircle } from "lucide-react";
import { formatDuration } from "@/utils";

const formatSize = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const FileUploader = ({
  accept       = "*/*",
  multiple     = false,
  maxSizeMB    = 10,
  onFilesChange,
  label        = "Upload files",
  hint,
  error,
  className    = "",
}) => {
  const [files,   setFiles]    = useState([]);
  const [isDragging, setDrag]  = useState(false);
  const inputRef = useRef(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const processFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => f.size <= maxBytes);
    const next  = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(next);
    onFilesChange?.(next);
  }, [files, maxBytes, multiple, onFilesChange]);

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesChange?.(next);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    processFiles(e.dataTransfer.files);
  };

  const isImage = (file) => file.type.startsWith("image/");

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 text-center",
          isDragging
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40",
        ].join(" ")}
      >
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <Upload className={`w-5 h-5 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">
            {label}
            <span className="text-blue-600"> · click to browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {hint ?? `Max ${maxSizeMB}MB per file`}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              {/* Preview or icon */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                {isImage(file) ? (
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <File className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
              </div>

              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;