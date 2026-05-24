"use client";
import { useEffect, useState } from "react";
import {
  Brain, AlertTriangle, Pill,
  Activity, FlaskConical, Clock, FileText
} from "lucide-react";

export default function MedicalWiki({ patientId }) {
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWiki() {
      try {
        const res = await fetch(
          `/api/patients/${patientId}/wiki`
        );
        const data = await res.json();
        setWiki(data.wiki);
      } catch (err) {
        console.error("Wiki fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (patientId) fetchWiki();
  }, [patientId]);

  if (loading) {
    return (
      <p className="text-[#6b7280] text-sm">Loading...</p>
    );
  }

  if (!wiki) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
        <p className="text-[#f0fdf4] font-medium">
          No records processed yet
        </p>
        <p className="text-[#6b7280] text-sm mt-1">
          Patient needs to upload medical PDFs first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* AI Summary */}
      {wiki.aiSummary && (
        <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-green-400" />
            <p className="font-semibold text-[#f0fdf4] text-sm">
              AI Summary
            </p>
          </div>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            {wiki.aiSummary}
          </p>
          <p className="text-[#6b7280] text-xs mt-3">
            Last updated:{" "}
            {new Date(wiki.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Critical Flags */}
      {wiki.criticalFlags?.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="font-semibold text-red-400 text-sm">
              Critical Flags
            </p>
          </div>
          <ul className="space-y-1.5">
            {wiki.criticalFlags.map((flag, i) => (
              <li key={i} className="text-sm text-[#f0fdf4] flex gap-2">
                <span className="text-red-400">•</span> {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contradictions */}
      {wiki.contradictions?.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="font-semibold text-amber-400 text-sm">
              Contradictions Detected
            </p>
          </div>
          {wiki.contradictions.map((c, i) => (
            <div
              key={i}
              className="mb-3 last:mb-0 p-3 bg-[#1a1a1a] rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${c.severity === "critical"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-amber-500/10 text-amber-400"
                  }`}>
                  {c.severity}
                </span>
                <span className="text-xs text-[#6b7280]">{c.type}</span>
              </div>
              <p className="text-sm text-[#f0fdf4]">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">

        {/* Conditions */}
        {wiki.conditions?.length > 0 && (
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-green-400" />
              <p className="font-semibold text-[#f0fdf4] text-sm">
                Conditions
              </p>
            </div>
            <ul className="space-y-1.5">
              {wiki.conditions.map((c, i) => (
                <li key={i} className="text-sm text-[#a1a1aa] flex gap-2">
                  <span className="text-green-400">•</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Allergies */}
        {wiki.allergies?.length > 0 && (
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="font-semibold text-[#f0fdf4] text-sm">
                Allergies
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {wiki.allergies.map((a, i) => (
                <span
                  key={i}
                  className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {wiki.medications?.length > 0 && (
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-green-400" />
              <p className="font-semibold text-[#f0fdf4] text-sm">
                Medications
              </p>
            </div>
            <ul className="space-y-2">
              {wiki.medications.map((m, i) => (
                <li key={i} className="text-sm">
                  <span className="text-[#f0fdf4] font-medium">
                    {m.name}
                  </span>
                  {m.dosage && (
                    <span className="text-[#6b7280]">
                      {" "}— {m.dosage}
                    </span>
                  )}
                  {m.frequency && (
                    <span className="text-[#6b7280]">
                      , {m.frequency}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lab Values */}
        {wiki.labValues?.length > 0 && (
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-green-400" />
              <p className="font-semibold text-[#f0fdf4] text-sm">
                Lab Values
              </p>
            </div>
            <ul className="space-y-2">
              {wiki.labValues.map((l, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#a1a1aa]">{l.name}</span>
                  <span className={
                    l.isAbnormal
                      ? "text-red-400 font-mono font-medium"
                      : "text-green-400 font-mono"
                  }>
                    {l.value} {l.unit}
                    {l.isAbnormal && " ⚠"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Timeline */}
      {wiki.timeline?.length > 0 && (
        <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-green-400" />
            <p className="font-semibold text-[#f0fdf4] text-sm">
              Chronological Timeline
            </p>
          </div>
          <div className="space-y-3">
            {wiki.timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 mt-1 shrink-0" />
                  {i < wiki.timeline.length - 1 && (
                    <div className="w-px flex-1 bg-[#1f2d1f] mt-1" />
                  )}
                </div>
                <div className="pb-3 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {t.date && (
                      <span className="text-xs font-mono text-green-400">
                        {t.date}
                      </span>
                    )}
                    {t.source && (
                      <span className="text-xs text-[#6b7280]">
                        {t.source}
                        {t.page && ` · p.${t.page}`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#f0fdf4]">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}