"use client";
import { useState, useEffect } from "react";
import { Check, Loader2, X, Circle } from "lucide-react";
import { PROCESSING_STEPS, PROCESSING_STATUS_ORDER } from "../../utils/constants.js";

export default function ProcessingStatus({ recordId, onComplete }) {
  const [status, setStatus] = useState("uploading");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/records/${recordId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.processingStatus);
          
          if (data.processingStatus === "completed") {
            clearInterval(interval);
            if (onComplete) onComplete();
          } else if (data.processingStatus === "failed") {
            clearInterval(interval);
            setError(data.processingError || "Unknown processing error");
          }
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [recordId, onComplete]);

  if (!status) return null;

  const currentIndex = PROCESSING_STATUS_ORDER.indexOf(status);
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  return (
    <div className="p-6 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[#f0fdf4] font-semibold">Processing Record</h3>
          {recordId && (
            <p className="text-[#6b7280] text-xs font-mono mt-0.5">ID: {recordId}</p>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm font-medium">Complete</span>
          </div>
        )}
        {isFailed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <X className="w-4 h-4 text-red-500" />
            <span className="text-red-500 text-sm font-medium">Failed</span>
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
                isActive ? "bg-green-600/10 border border-green-600/30" :
                isDone ? "bg-green-500/5 border border-green-500/20" :
                isFailedStep ? "bg-red-500/10 border border-red-500/20" :
                "border border-transparent"
              }`}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDone ? "bg-green-500/20 border border-green-500/20" :
                isActive ? "bg-green-600/20 border border-green-600/40" :
                isFailedStep ? "bg-red-500/20 border border-red-500/20" :
                "bg-[#1a1a1a] border border-[#1f2d1f]"
              }`}>
                {isDone ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                ) : isFailedStep ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : (
                  <Circle className="w-4 h-4 text-[#6b7280]" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isDone ? "text-green-500" :
                  isActive ? "text-green-400" :
                  isFailedStep ? "text-red-500" :
                  "text-[#6b7280]"
                }`}>
                  {label}
                </p>
                <p className="text-[#6b7280] text-xs mt-0.5">{description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-500 text-sm font-medium mb-1">Processing Error</p>
          <p className="text-red-500/70 text-xs font-mono">{error}</p>
        </div>
      )}

      {/* Success message */}
      {isCompleted && (
        <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-500 text-sm font-medium">
            🎉 Your medical record has been fully processed. 
          </p>
        </div>
      )}
    </div>
  );
}