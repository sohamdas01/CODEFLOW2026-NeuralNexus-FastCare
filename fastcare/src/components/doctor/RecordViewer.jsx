"use client";
import { ExternalLink, FileText, Calendar } from "lucide-react";
import StatusBadge from "../shared/StatusBadge.jsx";
import { formatDate } from "../../utils/formatDate.js";
import EmptyState from "../shared/EmptyState.jsx";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

export default function RecordViewer({ records, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading records..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!records?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No records uploaded"
        description="No medical records have been uploaded for this patient yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record._id}
          className="flex items-center gap-4 p-4 rounded-xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition hover:border-green-600/30 transition-all"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-green-400" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge reportType={record.reportType} />
              <StatusBadge status={record.processingStatus} />
            </div>
            <div className="flex items-center gap-1.5 text-[#6b7280] text-xs mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(record.recordDate || record.createdAt)}
            </div>
          </div>

          {/* View link */}
          {record.cloudinaryUrl && (
            <a
              href={record.cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 hover:border-green-600/50 text-sm font-medium transition-all whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              View PDF
            </a>
          )}
        </div>
      ))}
    </div>
  );
}