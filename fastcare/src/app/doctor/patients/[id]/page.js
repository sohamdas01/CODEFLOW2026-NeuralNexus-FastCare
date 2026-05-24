"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Droplets,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "../../../../components/shared/DashboardLayout.jsx";
import MedicalWiki from "../../../../components/doctor/MedicalWiki.jsx";
import CriticalHighlights from "../../../../components/doctor/CriticalHighlights.jsx";
import RecordViewer from "../../../../components/doctor/RecordViewer.jsx";
import TimelineItem from "../../../../components/patient/TimelineItem.jsx";
import LoadingSpinner from "../../../../components/shared/LoadingSpinner.jsx";
import EmptyState from "../../../../components/shared/EmptyState.jsx";
import { useWiki } from "../../../../hooks/useWiki.js";
import { getRiskBadgeClass } from "../../../../utils/riskLevel.js";
import { formatDate } from "../../../../utils/formatDate.js";

const TABS = [
  { key: "wiki", label: "Medical Wiki" },
  { key: "timeline", label: "Timeline" },
  { key: "records", label: "Records" },
  { key: "highlights", label: "Critical Highlights" },
];

async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [tab, setTab] = useState("wiki");

  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState("");

  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState("");

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const [highlights, setHighlights] = useState(null);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlightsError, setHighlightsError] = useState("");

  const { wiki, loading: wikiLoading, error: wikiError } = useWiki(id);

  useEffect(() => {
    let cancelled = false;

    async function loadPatient() {
      if (!id) {
        setPatientError("Missing patient id.");
        setPatientLoading(false);
        return;
      }

      setPatientLoading(true);
      setPatientError("");

      try {
        const data = await fetchJson(`/api/patients/${id}`);
        if (!cancelled) {
          setPatient(data?.patient ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setPatientError("Failed to load patient details.");
          setPatient(null);
        }
      } finally {
        if (!cancelled) {
          setPatientLoading(false);
        }
      }
    }

    loadPatient();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadTimeline() {
      if (!id || tab !== "timeline" || timeline.length > 0) return;

      setTimelineLoading(true);
      setTimelineError("");

      try {
        const data = await fetchJson(`/api/patients/${id}/timeline`);
        if (!cancelled) {
          setTimeline(Array.isArray(data?.records) ? data.records : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setTimelineError("Failed to load timeline.");
          setTimeline([]);
        }
      } finally {
        if (!cancelled) {
          setTimelineLoading(false);
        }
      }
    }

    loadTimeline();

    return () => {
      cancelled = true;
    };
  }, [tab, id, timeline.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      if (!id || tab !== "records" || records.length > 0) return;

      setRecordsLoading(true);
      setRecordsError("");

      try {
        const data = await fetchJson(`/api/patients/${id}/records`);
        if (!cancelled) {
          setRecords(Array.isArray(data?.records) ? data.records : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setRecordsError("Failed to load records.");
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setRecordsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [tab, id, records.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadHighlights() {
      if (!id || tab !== "highlights" || highlights) return;

      setHighlightsLoading(true);
      setHighlightsError("");

      try {
        const data = await fetchJson(`/api/patients/${id}/highlights`);
        if (!cancelled) {
          setHighlights(data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setHighlightsError("Failed to load critical highlights.");
          setHighlights(null);
        }
      } finally {
        if (!cancelled) {
          setHighlightsLoading(false);
        }
      }
    }

    loadHighlights();

    return () => {
      cancelled = true;
    };
  }, [tab, id, highlights]);

  if (!id) {
    return (
      <DashboardLayout title="Patient">
        <div className="flex items-center justify-center py-20">
          <EmptyState
            icon={AlertTriangle}
            title="Patient not found"
            description="The patient id is missing from the route."
          />
        </div>
      </DashboardLayout>
    );
  }

  if (patientLoading) {
    return (
      <DashboardLayout title="Patient">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading patient..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={patient?.name || "Patient Detail"}
      subtitle={`Patient ID: ${String(id).slice(-8)}`}
    >
      <div className="max-w-5xl space-y-6">
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-2 text-[#6b7280] hover:text-green-400 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>

        {patientError ? (
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400">
            {patientError}
          </div>
        ) : null}

        {patient && (
          <div className="p-6 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-14 h-14 rounded-2xl bg-green-600/10 border border-green-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-2xl font-bold">
                  {patient.name?.[0]?.toUpperCase() || "P"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h2 className="text-[#f0fdf4] text-xl font-bold">
                    {patient.name}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRiskBadgeClass(
                      patient.riskLevel
                    )}`}
                  >
                    {patient.riskLevel || "Unknown"} risk
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[#6b7280] text-sm flex-wrap">
                  {patient.age ? (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Age {patient.age}
                    </span>
                  ) : null}

                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    {patient.bloodGroup || "Unknown"}
                  </span>

                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {patient.recordCount || 0} records
                  </span>

                  {patient.lastVisit ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last: {formatDate(patient.lastVisit)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-[#1f2d1f]">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                  tab === key
                    ? "border-green-600 text-green-400"
                    : "border-transparent text-[#6b7280] hover:text-[#f0fdf4]"
                }`}
              >
                {label}
                {key === "highlights" &&
                ((highlights?.criticalFlags?.length || 0) > 0 ||
                  (highlights?.contradictions?.length || 0) > 0) ? (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-critical inline-block" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div>
          {tab === "wiki" && (
            <MedicalWiki wiki={wiki} loading={wikiLoading} error={wikiError} />
          )}

          {tab === "timeline" &&
            (timelineLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" label="Loading timeline..." />
              </div>
            ) : timelineError ? (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400">
                {timelineError}
              </div>
            ) : timeline.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No records"
                description="No records uploaded for this patient."
              />
            ) : (
              <div>
                {timeline.map((record, index) => (
                  <TimelineItem
                    key={record._id || index}
                    record={record}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </div>
            ))}

          {tab === "records" && (
            recordsLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" label="Loading records..." />
              </div>
            ) : recordsError ? (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400">
                {recordsError}
              </div>
            ) : (
              <RecordViewer records={records} loading={false} error={null} />
            )
          )}

          {tab === "highlights" &&
            (highlightsLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" label="Loading highlights..." />
              </div>
            ) : highlightsError ? (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400">
                {highlightsError}
              </div>
            ) : (
              <CriticalHighlights
                highlights={highlights}
                loading={false}
                error={null}
              />
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}