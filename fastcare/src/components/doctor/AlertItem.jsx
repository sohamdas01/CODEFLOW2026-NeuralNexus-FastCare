"use client";
import { CheckCircle, AlertTriangle, Info, Zap, User } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatDate.js";

const SEVERITY_CONFIG = {
  critical: {
    icon: Zap,
    iconColor: "text-critical",
    bg: "bg-critical/5",
    border: "border-critical/20",
    activeBorder: "border-critical/50",
    badgeClass: "bg-critical/10 text-critical border-critical/30",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    bg: "bg-warning/5",
    border: "border-warning/20",
    activeBorder: "border-warning/50",
    badgeClass: "bg-warning/10 text-warning border-warning/30",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-400",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    activeBorder: "border-blue-500/40",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
};

export default function AlertItem({ alert, onMarkReviewed }) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;
  const isReviewed = alert.reviewed;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isReviewed
          ? "bg-surface opacity-50 border-border"
          : `${config.bg} ${config.activeBorder} hover:${config.activeBorder}`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isReviewed ? "bg-surface2" : `${config.bg} border ${config.border}`}`}>
          {isReviewed ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                {alert.severity}
              </span>
              <span className="text-xs text-textmuted font-mono">
                {alert.type?.replace(/_/g, " ")}
              </span>
            </div>
            <span className="text-textmuted text-xs whitespace-nowrap">
              {formatRelativeTime(alert.createdAt)}
            </span>
          </div>

          {/* Patient name */}
          {alert.patientId?.name && (
            <div className="flex items-center gap-1.5 mt-1.5 mb-1">
              <User className="w-3 h-3 text-textmuted" />
              <span className="text-accent text-xs font-medium">{alert.patientId.name}</span>
            </div>
          )}

          <p className={`text-sm leading-relaxed mt-1 ${isReviewed ? "text-textmuted" : "text-textprimary"}`}>
            {alert.message}
          </p>

          {/* Mark reviewed */}
          {!isReviewed && (
            <button
              onClick={() => onMarkReviewed(alert._id)}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-success/40 hover:bg-success/5 text-textmuted hover:text-success text-xs font-medium transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Reviewed
            </button>
          )}
          {isReviewed && (
            <span className="mt-2 inline-flex items-center gap-1 text-success text-xs">
              <CheckCircle className="w-3 h-3" />
              Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}