"use client";
import { AlertTriangle, Flag, ShieldOff } from "lucide-react";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import EmptyState from "../shared/EmptyState.jsx";

export default function CriticalHighlights({ highlights, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading highlights..." />
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

  const hasCritical = highlights?.criticalFlags?.length > 0;
  const hasContradictions = highlights?.contradictions?.length > 0;

  if (!hasCritical && !hasContradictions) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="No critical highlights"
        description="No critical flags or contradictions detected for this patient."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Flags */}
      {hasCritical && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-red-500 font-bold text-base">
              Critical Flags ({highlights.criticalFlags.length})
            </h3>
          </div>
          <div className="space-y-3">
            {highlights.criticalFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm leading-relaxed">{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradictions */}
      {hasContradictions && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldOff className="w-5 h-5 text-amber-500" />
            <h3 className="text-amber-500 font-bold text-base">
              Contradictions ({highlights.contradictions.length})
            </h3>
          </div>
          <div className="space-y-3">
            {highlights.contradictions.map((c, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border ${
                  c.severity === "critical"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                      c.severity === "critical"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-amber-500/20 text-amber-500"
                    }`}
                  >
                    {c.severity}
                  </span>
                  <span className="text-[#6b7280] text-xs font-mono">
                    {c.type?.replace(/_/g, " ")}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    c.severity === "critical" ? "text-red-500/90" : "text-amber-500/90"
                  }`}
                >
                  {c.description}
                </p>
                {c.recordIds?.length > 0 && (
                  <p className="text-[#6b7280] text-xs mt-2 font-mono">
                    Affected records: {c.recordIds.length}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}