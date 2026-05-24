"use client";
import Link from "next/link";
import { FileText, Clock, ChevronRight, Droplets } from "lucide-react";
import StatusBadge from "../shared/StatusBadge.jsx";
import { formatRelativeTime } from "../../utils/formatDate.js";
import { getRiskConfig } from "../../utils/riskLevel.js";

export default function PatientCard({ patient }) {
  const riskConfig = getRiskConfig(patient.riskLevel || "low");

  return (
    <div className={`p-5 rounded-2xl bg-surface border ${riskConfig.borderColor} hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 card-hover flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-textprimary font-semibold text-base truncate">{patient.name}</h3>
          {patient.age && (
            <p className="text-textmuted text-xs mt-0.5">
              {patient.age} years old
            </p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${riskConfig.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${riskConfig.dotColor}`} />
          {riskConfig.label}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface2 border border-border">
          <Droplets className="w-4 h-4 text-critical flex-shrink-0" />
          <div>
            <div className="text-textmuted text-xs">Blood</div>
            <div className="text-textprimary font-mono font-bold text-sm">{patient.bloodGroup || "?"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface2 border border-border">
          <FileText className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <div className="text-textmuted text-xs">Records</div>
            <div className="text-textprimary font-mono font-bold text-sm">{patient.recordCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Last visit */}
      <div className="flex items-center gap-2 text-textmuted text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>Last visit: {patient.lastVisit ? formatRelativeTime(patient.lastVisit) : "Never"}</span>
      </div>

      {/* View button */}
      <Link
        href={`/doctor/patients/${patient._id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-accent border border-primary/30 hover:border-primary/50 text-sm font-medium transition-all"
      >
        View Patient
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}