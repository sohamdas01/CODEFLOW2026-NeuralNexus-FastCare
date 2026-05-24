"use client";
import { useState } from "react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import AlertItem from "../../../components/doctor/AlertItem.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import EmptyState from "../../../components/shared/EmptyState.jsx";
import { useAlerts } from "../../../hooks/useAlerts.js";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";

const SEVERITY_TABS = [
  { value: "", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

const REVIEWED_TABS = [
  { value: "", label: "All" },
  { value: "false", label: "Unreviewed" },
  { value: "true", label: "Reviewed" },
];

export default function DoctorAlertsPage() {
  const [severity, setSeverity] = useState("");
  const [reviewed, setReviewed] = useState("false");
  const [page, setPage] = useState(1);

  const { alerts, total, totalPages, loading, error, markReviewed } = useAlerts({
    severity,
    reviewed,
    page,
  });

  function handleSeverityChange(val) {
    setSeverity(val);
    setPage(1);
  }

  function handleReviewedChange(val) {
    setReviewed(val);
    setPage(1);
  }

  return (
    <DashboardLayout
      title="Alerts"
      subtitle={`${total} alert${total !== 1 ? "s" : ""} found`}
    >
      <div className="space-y-5 max-w-3xl">
        {/* Filter row */}
        <div className="space-y-3">
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-textmuted text-xs font-medium mr-1">Severity:</span>
            {SEVERITY_TABS.map(({ value, label }) => {
              const activeStyles = {
                "": "bg-primary/15 text-accent border-primary/40",
                critical: "bg-critical/15 text-critical border-critical/40",
                warning: "bg-warning/15 text-warning border-warning/40",
                info: "bg-blue-500/15 text-blue-400 border-blue-500/40",
              };
              return (
                <button
                  key={value}
                  onClick={() => handleSeverityChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    severity === value
                      ? activeStyles[value]
                      : "bg-surface2 text-textmuted border-border hover:border-primary/30 hover:text-textprimary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Reviewed filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-textmuted text-xs font-medium mr-1">Status:</span>
            {REVIEWED_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleReviewedChange(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  reviewed === value
                    ? "bg-primary/15 text-accent border-primary/40"
                    : "bg-surface2 text-textmuted border-border hover:border-primary/30 hover:text-textprimary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-textmuted text-sm">
            {total === 0
              ? "No alerts found"
              : `Showing ${alerts.length} of ${total} alerts`}
          </p>
        )}

        {/* Alert list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" label="Loading alerts..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-critical/10 border border-critical/30">
            <p className="text-critical text-sm">{error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alerts found"
            description={
              reviewed === "false"
                ? "All alerts have been reviewed. Great work!"
                : "No alerts match the current filters."
            }
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem
                key={alert._id}
                alert={alert}
                onMarkReviewed={markReviewed}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-textmuted hover:text-textprimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-textmuted text-sm font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-textmuted hover:text-textprimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}