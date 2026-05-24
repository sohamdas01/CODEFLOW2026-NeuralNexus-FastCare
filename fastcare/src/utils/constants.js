
export const PROCESSING_STEPS = [
  { key: "uploading", label: "Uploading to Storage", description: "Securely uploading your PDF" },
  { key: "extracting", label: "Extracting Text", description: "Reading document content" },
  { key: "running_ner", label: "Running Medical NER", description: "Identifying medical entities with AI" },
  { key: "structuring", label: "Structuring Data", description: "Organizing clinical information" },
  { key: "generating_summary", label: "Generating Summary", description: "Creating AI clinical summary" },
  { key: "completed", label: "Complete", description: "Record fully processed" },
];

export const PROCESSING_STATUS_ORDER = [
  "pending",
  "uploading",
  "extracting",
  "running_ner",
  "structuring",
  "generating_summary",
  "completed",
];

export const REPORT_TYPES = [
  { value: "lab", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "scan", label: "Scan / Imaging" },
  { value: "other", label: "Other" },
];

export const REPORT_TYPE_COLORS = {
  lab: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  prescription: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  discharge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  scan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export const SEVERITY_COLORS = {
  critical: "bg-critical/10 text-critical border-critical/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export const MAX_PDF_SIZE_MB = 10;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export const POLLING_INTERVAL_MS = 3000;
