"use client";
import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

const reportTypes = [
  { value: "lab", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "scan", label: "Scan / X-Ray" },
  { value: "other", label: "Other" },
];

export default function UploadZone({ onUpload, uploading }) {
  const [files, setFiles] = useState([]);
  const [reportType, setReportType] = useState("other");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleFileInput(e) {
    const selected = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...selected]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (files.length === 0 || uploading) return;
    onUpload(files, reportType);
  }

  return (
    <div className="space-y-5">

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${dragging
            ? "border-green-500 bg-green-500/10"
            : "border-[#1f2d1f] hover:border-green-600 hover:bg-green-500/5"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
        <p className="text-[#f0fdf4] font-semibold text-base">
          Drag & drop your PDFs here
        </p>
        <p className="text-[#6b7280] text-sm mt-1">
          or click to browse
        </p>
        <p className="text-[#6b7280] text-xs mt-2">
          PDF only · Multiple files supported
        </p>
      </div>

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#6b7280] font-medium">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f]"
            >
              <FileText className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-[#f0fdf4] text-sm flex-1 truncate">
                {file.name}
              </span>
              <span className="text-[#6b7280] text-xs shrink-0">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="text-[#6b7280] hover:text-red-400 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Report type */}
      <div>
        <label className="text-sm text-[#6b7280] mb-2 block">
          Report Type
        </label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#1f2d1f] text-[#f0fdf4] rounded-xl px-4 py-2.5 outline-none focus:border-green-600 transition"
        >
          {reportTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upload button */}
      <button
        onClick={handleSubmit}
        disabled={files.length === 0 || uploading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-[#f0fdf4] font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {uploading
          ? "Uploading..."
          : files.length > 0
          ? `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
          : "Upload"}
      </button>
    </div>
  );
}