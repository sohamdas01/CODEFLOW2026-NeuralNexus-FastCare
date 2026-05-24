"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Pill, Activity, FlaskConical, Stethoscope } from "lucide-react";
import StatusBadge from "../shared/StatusBadge.jsx";
import { formatDate } from "../../utils/formatDate.js";
// import { REPORT_TYPE_COLORS } from "../../utils/constants.js";

function EntityTag({ label, items, color }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`text-xs font-medium ${color} mr-1`}>{label}:</span>
      {items.slice(0, 5).map((item, i) => (
        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-textmuted font-mono">
          {item}
        </span>
      ))}
      {items.length > 5 && (
        <span className="text-xs text-textmuted">+{items.length - 5} more</span>
      )}
    </div>
  );
}

export default function TimelineItem({ record, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const sd = record.structuredData || {};
  const ner = record.nerOutput || {};
  const isCompleted = record.processingStatus === "completed";

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-5 ${
          isCompleted ? "bg-primary border-primary" : "bg-surface2 border-border"
        }`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      {/* Card */}
      <div className="flex-1 mb-6 pb-2">
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge reportType={record.reportType} />
              <StatusBadge status={record.processingStatus} />
            </div>
            <span className="text-textmuted text-xs font-mono whitespace-nowrap">
              {formatDate(record.recordDate || record.createdAt)}
            </span>
          </div>

          {/* Summary snippet */}
          {isCompleted && (
            <div className="space-y-2 mb-3">
              {sd.conditions?.length > 0 && (
                <EntityTag label="Conditions" items={sd.conditions} color="text-warning" />
              )}
              {ner.drugs?.length > 0 && (
                <EntityTag label="Drugs" items={ner.drugs} color="text-purple-400" />
              )}
              {ner.diseases?.length > 0 && (
                <EntityTag label="Diseases" items={ner.diseases} color="text-critical" />
              )}
            </div>
          )}

          {/* Expanded details */}
          {expanded && isCompleted && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {sd.medications?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-textmuted mb-2 flex items-center gap-1">
                    <Pill className="w-3 h-3" /> Medications
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sd.medications.map((m, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                        {m.name}{m.dosage ? ` ${m.dosage}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sd.labValues?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-textmuted mb-2 flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" /> Lab Values
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sd.labValues.map((lv, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
                        lv.isAbnormal
                          ? "bg-critical/10 text-critical border-critical/30"
                          : "bg-surface2 text-textmuted border-border"
                      }`}>
                        {lv.name}: {lv.value}{lv.unit ? ` ${lv.unit}` : ""}
                        {lv.isAbnormal && " ⚠"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sd.allergies?.length > 0 && (
                <EntityTag label="Allergies" items={sd.allergies} color="text-critical" />
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            {isCompleted ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-textmuted hover:text-accent text-xs transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Hide details" : "Show details"}
              </button>
            ) : (
              <span className="text-textmuted text-xs">Processing...</span>
            )}

            {record.cloudinaryUrl && (
              <a
                href={record.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-textmuted hover:text-accent text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}