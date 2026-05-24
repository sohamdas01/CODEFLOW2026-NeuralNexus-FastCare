"use client";
import Link from "next/link";
import { FileText, Clock, ChevronRight, Droplets } from "lucide-react";
import StatusBadge from "../shared/StatusBadge.jsx";
import { formatRelativeTime } from "../../utils/formatDate.js";
import { getRiskConfig } from "../../utils/riskLevel.js";

export default function PatientCard({ patient }) {
  const riskConfig = getRiskConfig(patient.riskLevel || "low");

  return (
    <div className={`p-5 rounded-2xl bg-[#111111] border ${riskConfig.borderColor} hover:border-green-600/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#f0fdf4] font-semibold text-base truncate">{patient.name}</h3>
          {patient.age && (
            <p className="text-[#6b7280] text-xs mt-0.5">
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
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f]">
          <Droplets className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div>
            <div className="text-[#6b7280] text-xs">Blood</div>
            <div className="text-[#f0fdf4] font-mono font-bold text-sm">{patient.bloodGroup || "?"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f]">
          <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div>
            <div className="text-[#6b7280] text-xs">Records</div>
            <div className="text-[#f0fdf4] font-mono font-bold text-sm">{patient.recordCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Last visit */}
      <div className="flex items-center gap-2 text-[#6b7280] text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>Last visit: {patient.lastVisit ? formatRelativeTime(patient.lastVisit) : "Never"}</span>
      </div>

      {/* View button */}
      <Link
        href={`/doctor/patients/${patient._id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 hover:border-green-600/50 text-sm font-medium transition-all"
      >
        View Patient
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}