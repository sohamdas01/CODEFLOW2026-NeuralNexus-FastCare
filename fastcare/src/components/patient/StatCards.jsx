"use client";
import { FileText, Clock, ShieldAlert, TrendingUp } from "lucide-react";
import { getRiskConfig } from "../../utils/riskLevel.js";
import { formatRelativeTime } from "../../utils/formatDate.js";

export default function StatCards({ patient, recordCount }) {
  const riskConfig = getRiskConfig(patient?.riskLevel || "low");

  const stats = [
    {
      label: "Total Records",
      value: recordCount ?? patient?.recordCount ?? 0,
      icon: FileText,
      color: "text-accent",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Last Upload",
      value: patient?.lastVisit ? formatRelativeTime(patient.lastVisit) : "Never",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Risk Level",
      value: riskConfig.label,
      icon: ShieldAlert,
      color: riskConfig.color,
      bg: riskConfig.bgColor,
      border: riskConfig.borderColor,
    },
    {
      label: "Blood Group",
      value: patient?.bloodGroup || "Unknown",
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`p-5 rounded-2xl bg-surface border ${border} flex flex-col gap-3`}
        >
          <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-textmuted text-xs mt-0.5">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
