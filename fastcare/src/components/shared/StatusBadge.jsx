"use client";
import { REPORT_TYPE_COLORS, SEVERITY_COLORS } from "../../utils/constants.js";
import { getRiskBadgeClass } from "../../utils/riskLevel.js";

const STATUS_STYLES = {
  pending: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
  uploading: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  extracting: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
  running_ner: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  structuring: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
  generating_summary: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  completed: "bg-green-500/10 text-green-500 border border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border border-red-500/20",
};

const STATUS_LABELS = {
  pending: "Pending",
  uploading: "Uploading",
  extracting: "Extracting",
  running_ner: "Running NER",
  structuring: "Structuring",
  generating_summary: "Summarizing",
  completed: "Completed",
  failed: "Failed",
};

export default function StatusBadge({ status, severity, reportType, riskLevel, className = "" }) {
  let style = "";
  let label = "";

  if (status) {
    style = STATUS_STYLES[status] || STATUS_STYLES.pending;
    label = STATUS_LABELS[status] || status;
  } else if (severity) {
    style = SEVERITY_COLORS[severity] || SEVERITY_COLORS.info;
    label = severity.charAt(0).toUpperCase() + severity.slice(1);
  } else if (reportType) {
    style = REPORT_TYPE_COLORS[reportType] || REPORT_TYPE_COLORS.other;
    label = reportType.charAt(0).toUpperCase() + reportType.slice(1);
  } else if (riskLevel) {
    style = getRiskBadgeClass(riskLevel);
    label = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + " Risk";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}