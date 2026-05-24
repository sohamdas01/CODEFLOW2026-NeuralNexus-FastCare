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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface2 hover:bg-primary/10 text-textmuted hover:text-accent border border-border hover:border-primary/30 text-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Card
        </button>
      </div>

      {/* Emergency Card */}
      <div className="p-8 rounded-3xl bg-surface border-2 border-primary/40 glow-green print:border-gray-300 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <div className="text-xs text-textmuted font-mono uppercase tracking-wider">EMERGENCY MEDICAL CARD</div>
              <div className="text-textprimary font-bold">Fastcare</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-textmuted">BLOOD TYPE</div>
            <div className="text-5xl font-bold text-critical font-mono mt-1">
              {patient?.bloodGroup || "?"}
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-textmuted" />
            <span className="text-textmuted text-xs uppercase tracking-wider font-mono">Patient</span>
          </div>
          <p className="text-textprimary text-2xl font-bold">{patient?.name || "Unknown"}</p>
          {patient?.dob && (
            <p className="text-textmuted text-sm mt-0.5">
              DOB: {new Date(patient.dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {patient.age && ` · Age ${patient.age}`}
            </p>
          )}
        </div>

        {/* Allergies — most critical */}
        <div className="mb-6 p-4 rounded-xl bg-critical/10 border border-critical/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-critical" />
            <span className="text-critical text-sm font-bold uppercase tracking-wider">Allergies</span>
          </div>
          {wiki?.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {wiki.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-critical/20 text-critical border border-critical/40 text-sm font-semibold">
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-textmuted text-sm">No known allergies on record</p>
          )}
        </div>

        {/* Current medications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-accent" />
            <span className="text-textprimary text-sm font-semibold uppercase tracking-wider">Current Medications</span>
          </div>
          {wiki?.medications?.length > 0 ? (
            <div className="space-y-2">
              {wiki.medications.slice(0, 8).map((med, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-textprimary text-sm font-mono font-medium">{med.name}</span>
                  {med.dosage && <span className="text-textmuted text-xs">{med.dosage}</span>}
                  {med.frequency && <span className="text-textmuted text-xs">{med.frequency}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textmuted text-sm">No medications on record</p>
          )}
        </div>

        {/* Emergency contact */}
        {(patient?.emergencyContact?.name || patient?.emergencyContact?.phone) && (
          <div className="p-4 rounded-xl bg-surface2 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-success" />
              <span className="text-textprimary text-sm font-semibold">Emergency Contact</span>
            </div>
            <div className="space-y-1">
              {patient.emergencyContact.name && (
                <p className="text-textprimary font-medium">{patient.emergencyContact.name}
                  {patient.emergencyContact.relation && (
                    <span className="text-textmuted font-normal"> · {patient.emergencyContact.relation}</span>
                  )}
                </p>
              )}
              {patient.emergencyContact.phone && (
                <p className="text-accent font-mono text-lg font-semibold">{patient.emergencyContact.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-textmuted text-xs font-mono">
            Generated by Fastcare · For medical use only
          </p>
        </div>
      </div>
    </div>
  );
}