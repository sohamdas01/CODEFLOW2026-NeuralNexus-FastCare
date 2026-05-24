// "use client";
// import { useState, useRef, useCallback } from "react";
// import { Upload, FileText, X, AlertCircle } from "lucide-react";
// import { REPORT_TYPES, MAX_PDF_SIZE_MB } from "../../utils/constants.js";

// export default function UploadZone({ file, setFile, reportType, setReportType, onUpload, uploading, error }) {
//   const [dragOver, setDragOver] = useState(false);
//   const inputRef = useRef(null);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const dropped = e.dataTransfer.files[0];
//     if (dropped && dropped.type === "application/pdf") {
//       setFile(dropped);
//     }
//   }, [setFile]);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     setDragOver(true);
//   }, []);

//   const handleDragLeave = useCallback(() => setDragOver(false), []);

//   const handleFileChange = useCallback((e) => {
//     const selected = e.target.files[0];
//     if (selected) setFile(selected);
//   }, [setFile]);

//   const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : null;

//   return (
//     <div className="space-y-6">
//       {/* Drop zone */}
//       <div
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onClick={() => !file && inputRef.current?.click()}
//         className={`
//           relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
//           ${dragOver
//             ? "border-primary bg-primary/10 glow-green"
//             : file
//             ? "border-primary/40 bg-primary/5 cursor-default"
//             : "border-border bg-surface hover:border-primary/40 hover:bg-surface2"
//           }
//         `}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept="application/pdf"
//           className="hidden"
//           onChange={handleFileChange}
//         />

//         <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
//           {file ? (
//             <>
//               <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
//                 <FileText className="w-7 h-7 text-accent" />
//               </div>
//               <p className="text-textprimary font-semibold text-lg">{file.name}</p>
//               <p className="text-textmuted text-sm mt-1">{fileSizeMB} MB · PDF</p>
//               <button
//                 onClick={(e) => { e.stopPropagation(); setFile(null); }}
//                 className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-surface2 hover:bg-critical/10 text-textmuted hover:text-critical border border-border hover:border-critical/30 text-sm transition-all"
//               >
//                 <X className="w-4 h-4" />
//                 Remove file
//               </button>
//             </>
//           ) : (
//             <>
//               <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 transition-colors ${dragOver ? "bg-primary/20 border-primary" : "bg-surface2 border-border"}`}>
//                 <Upload className={`w-7 h-7 ${dragOver ? "text-accent" : "text-textmuted"}`} />
//               </div>
//               <p className="text-textprimary font-semibold text-lg">
//                 {dragOver ? "Drop your PDF here" : "Drag & drop your PDF"}
//               </p>
//               <p className="text-textmuted text-sm mt-1">
//                 or <span className="text-accent underline">click to browse</span>
//               </p>
//               <p className="text-textmuted text-xs mt-3">PDF only · Max {MAX_PDF_SIZE_MB}MB</p>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Report type selector */}
//       <div>
//         <label className="block text-sm font-medium text-textprimary mb-2">
//           Report Type
//         </label>
//         <select
//           value={reportType}
//           onChange={(e) => setReportType(e.target.value)}
//           className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-textprimary focus:outline-none focus:border-primary transition-colors text-sm"
//         >
//           {REPORT_TYPES.map(({ value, label }) => (
//             <option key={value} value={value} className="bg-surface2">
//               {label}
//             </option>
//           ))}
//         </select>
//         <p className="text-textmuted text-xs mt-1.5">
//           Don't worry — our AI will also auto-detect the type from the document content.
//         </p>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="flex items-start gap-3 p-4 rounded-xl bg-critical/10 border border-critical/30">
//           <AlertCircle className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" />
//           <p className="text-critical text-sm">{error}</p>
//         </div>
//       )}

//       {/* Upload button */}
//       <button
//         onClick={onUpload}
//         disabled={!file || uploading}
//         className={`
//           w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3
//           ${file && !uploading
//             ? "bg-primary hover:bg-primary-hover text-white glow-green"
//             : "bg-surface2 text-textmuted cursor-not-allowed border border-border"
//           }
//         `}
//       >
//         {uploading ? (
//           <>
//             <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
//             Uploading...
//           </>
//         ) : (
//           <>
//             <Upload className="w-5 h-5" />
//             Upload & Process Record
//           </>
//         )}
//       </button>
//     </div>
//   );
// }

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
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
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