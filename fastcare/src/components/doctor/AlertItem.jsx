"use client";
import { CheckCircle, AlertTriangle, Info, Zap, User } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatDate.js";

const SEVERITY_CONFIG = {
  critical: {
    icon: Zap,
    iconColor: "text-red-500",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    activeBorder: "border-red-500/20",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    activeBorder: "border-amber-500/20",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
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
          ? "bg-[#111111] opacity-50 border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition"
          : `${config.bg} ${config.activeBorder} hover:${config.activeBorder}`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isReviewed ? "bg-[#1a1a1a]" : `${config.bg} border ${config.border}`}`}>
          {isReviewed ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
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
              <span className="text-xs text-[#6b7280] font-mono">
                {alert.type?.replace(/_/g, " ")}
              </span>
            </div>
            <span className="text-[#6b7280] text-xs whitespace-nowrap">
              {formatRelativeTime(alert.createdAt)}
            </span>
          </div>

          {/* Patient name */}
          {alert.patientId?.name && (
            <div className="flex items-center gap-1.5 mt-1.5 mb-1">
              <User className="w-3 h-3 text-[#6b7280]" />
              <span className="text-green-400 text-xs font-medium">{alert.patientId.name}</span>
            </div>
          )}

          <p className={`text-sm leading-relaxed mt-1 ${isReviewed ? "text-[#6b7280]" : "text-[#f0fdf4]"}`}>
            {alert.message}
          </p>

          {/* Mark reviewed */}
          {!isReviewed && (
            <button
              onClick={() => onMarkReviewed(alert._id)}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition hover:border-green-500/20 hover:bg-green-500/5 text-[#6b7280] hover:text-green-500 text-xs font-medium transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Reviewed
            </button>
          )}
          {isReviewed && (
            <span className="mt-2 inline-flex items-center gap-1 text-green-500 text-xs">
              <CheckCircle className="w-3 h-3" />
              Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}