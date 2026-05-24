"use client";
import { Phone, AlertTriangle, Pill, User, Printer, Heart } from "lucide-react";

export default function EmergencyCard({ patient, wiki }) {
  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Print button */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-green-600/10 text-[#6b7280] hover:text-green-400 border border-[#1f2d1f] hover:border-green-600/30 text-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Card
        </button>
      </div>

      {/* Emergency Card */}
      <div className="p-8 rounded-3xl bg-[#111111] border-2 border-green-600/40 shadow-[0_0_20px_rgba(22,163,74,0.1)] print:border-gray-300 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1f2d1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#f0fdf4]" fill="white" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280] font-mono uppercase tracking-wider">EMERGENCY MEDICAL CARD</div>
              <div className="text-[#f0fdf4] font-bold">Fastcare</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#6b7280]">BLOOD TYPE</div>
            <div className="text-5xl font-bold text-red-500 font-mono mt-1">
              {patient?.bloodGroup || "?"}
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#6b7280]" />
            <span className="text-[#6b7280] text-xs uppercase tracking-wider font-mono">Patient</span>
          </div>
          <p className="text-[#f0fdf4] text-2xl font-bold">{patient?.name || "Unknown"}</p>
          {patient?.dob && (
            <p className="text-[#6b7280] text-sm mt-0.5">
              DOB: {new Date(patient.dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {patient.age && ` · Age ${patient.age}`}
            </p>
          )}
        </div>

        {/* Allergies — most critical */}
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-500 text-sm font-bold uppercase tracking-wider">Allergies</span>
          </div>
          {wiki?.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {wiki.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-semibold">
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#6b7280] text-sm">No known allergies on record</p>
          )}
        </div>

        {/* Current medications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-green-400" />
            <span className="text-[#f0fdf4] text-sm font-semibold uppercase tracking-wider">Current Medications</span>
          </div>
          {wiki?.medications?.length > 0 ? (
            <div className="space-y-2">
              {wiki.medications.slice(0, 8).map((med, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1f2d1f] last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span className="text-[#f0fdf4] text-sm font-mono font-medium">{med.name}</span>
                  {med.dosage && <span className="text-[#6b7280] text-xs">{med.dosage}</span>}
                  {med.frequency && <span className="text-[#6b7280] text-xs">{med.frequency}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#6b7280] text-sm">No medications on record</p>
          )}
        </div>

        {/* Emergency contact */}
        {(patient?.emergencyContact?.name || patient?.emergencyContact?.phone) && (
          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f]">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="text-[#f0fdf4] text-sm font-semibold">Emergency Contact</span>
            </div>
            <div className="space-y-1">
              {patient.emergencyContact.name && (
                <p className="text-[#f0fdf4] font-medium">{patient.emergencyContact.name}
                  {patient.emergencyContact.relation && (
                    <span className="text-[#6b7280] font-normal"> · {patient.emergencyContact.relation}</span>
                  )}
                </p>
              )}
              {patient.emergencyContact.phone && (
                <p className="text-green-400 font-mono text-lg font-semibold">{patient.emergencyContact.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1f2d1f] text-center">
          <p className="text-[#6b7280] text-xs font-mono">
            Generated by Fastcare · For medical use only
          </p>
        </div>
      </div>
    </div>
  );
}