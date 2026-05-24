"use client";
import { Check, Loader2, X, Circle } from "lucide-react";
import { PROCESSING_STEPS, PROCESSING_STATUS_ORDER } from "../../utils/constants.js";

export default function ProcessingStatus({ status, error, recordId }) {
  if (!status) return null;

  const currentIndex = PROCESSING_STATUS_ORDER.indexOf(status);
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-textprimary font-semibold">Processing Record</h3>
          {recordId && (
            <p className="text-textmuted text-xs font-mono mt-0.5">ID: {recordId}</p>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
            <Check className="w-4 h-4 text-success" />
            <span className="text-success text-sm font-medium">Complete</span>
          </div>
        )}
        {isFailed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-critical/10 border border-critical/30">
            <X className="w-4 h-4 text-critical" />
            <span className="text-critical text-sm font-medium">Failed</span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {PROCESSING_STEPS.map(({ key, label, description }, index) => {
          const stepIndex = PROCESSING_STATUS_ORDER.indexOf(key);
          const isActive = status === key;
          const isDone = !isFailed && currentIndex > stepIndex;
          const isPending = isFailed ? false : currentIndex < stepIndex;
          const isFailedStep = isFailed && currentIndex === stepIndex;

          return (
            <div
              key={key}
              className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 ${
                isActive ? "bg-primary/10 border border-primary/30" :
                isDone ? "bg-success/5 border border-success/10" :
                isFailedStep ? "bg-critical/10 border border-critical/30" :
                "border border-transparent"
              }`}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDone ? "bg-success/20 border border-success/40" :
                isActive ? "bg-primary/20 border border-primary/40" :
                isFailedStep ? "bg-critical/20 border border-critical/40" :
                "bg-surface2 border border-border"
              }`}>
                {isDone ? (
                  <Check className="w-4 h-4 text-success" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : isFailedStep ? (
                  <X className="w-4 h-4 text-critical" />
                ) : (
                  <Circle className="w-4 h-4 text-textmuted" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isDone ? "text-success" :
                  isActive ? "text-accent" :
                  isFailedStep ? "text-critical" :
                  "text-textmuted"
                }`}>
                  {label}
                </p>
                <p className="text-textmuted text-xs mt-0.5">{description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mt-4 p-4 rounded-xl bg-critical/10 border border-critical/30">
          <p className="text-critical text-sm font-medium mb-1">Processing Error</p>
          <p className="text-critical/70 text-xs font-mono">{error}</p>
        </div>
      )}

      {/* Success message */}
      {isCompleted && (
        <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/30">
          <p className="text-success text-sm font-medium">
            🎉 Your medical record has been fully processed. 
          </p>
        </div>
      )}
    </div>
  );
}