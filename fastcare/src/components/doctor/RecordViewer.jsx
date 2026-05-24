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
      <div className="p-4 rounded-xl bg-critical/10 border border-critical/30">
        <p className="text-critical text-sm">{error}</p>
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
          className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-accent" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge reportType={record.reportType} />
              <StatusBadge status={record.processingStatus} />
            </div>
            <div className="flex items-center gap-1.5 text-textmuted text-xs mt-1">
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-accent border border-primary/30 hover:border-primary/50 text-sm font-medium transition-all whitespace-nowrap"
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