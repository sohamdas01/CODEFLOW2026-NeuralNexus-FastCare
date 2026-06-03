
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import UploadZone from "../../../components/patient/UploadZone.jsx";
import ProcessingStatus from "../../../components/patient/ProcessingStatus.jsx";
import { useUpload } from "../../../hooks/useUpload.js";
import { CheckCircle, RotateCcw } from "lucide-react";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const [patientId, setPatientId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Get patient on load
  useEffect(() => {
    async function loadPatient() {
      if (!user) return;
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.name || "Patient",
            email: user?.email || "",
          }),
        });
        const data = await res.json();
        setPatientId(data.patient?._id);
      } catch (err) {
        console.error("Failed to load patient:", err);
        setError("Could not load patient profile.");
      } finally {
        setLoadingPatient(false);
      }
    }
    loadPatient();
  }, [user]);

  async function handleUpload(files, reportType) {
    if (!patientId) {
      setError("Patient profile not loaded yet.");
      return;
    }

    setUploading(true);
    setError(null);
    setDone(false);
    setRecordId(null);

    try {
      let firstRecordId = null;

      for (const file of files) {
        const formData = new FormData();
        formData.append("reportType", reportType);
        formData.append("patientId", patientId);
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        if (!firstRecordId) {
          firstRecordId = data.recordId;
        }

        // Trigger processing immediately for each file
        // We don't await this so it runs asynchronously on the backend
        fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: data.recordId, patientId }),
        }).catch(err => console.error("Failed to start processing:", err));
      }

      setRecordId(firstRecordId);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setRecordId(null);
    setDone(false);
    setError(null);
  }

  return (
    <DashboardLayout
      title="Upload Records"
      subtitle="Upload your medical PDFs for AI analysis"
    >
      <div className="max-w-2xl space-y-5">

        {/* Loading patient */}
        {loadingPatient && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="md" label="Loading profile..." />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload zone — show when no record processing */}
        {!loadingPatient && !recordId && (
          <div className="bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition rounded-2xl p-6">
            <h2 className="text-[#f0fdf4] font-semibold mb-5">
              Upload Medical Records
            </h2>
            <UploadZone
              onUpload={handleUpload}
              uploading={uploading}
            />
          </div>
        )}

        {/* Processing status — show after upload */}
        {recordId && !done && (
          <ProcessingStatus
            recordId={recordId}
            onComplete={() => setDone(true)}
          />
        )}

        {/* Success state */}
        {done && (
          <div className="bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition rounded-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-[#f0fdf4] font-semibold text-lg">
                Records processed!
              </p>
              <p className="text-[#6b7280] text-sm mt-1">
                Your medical data has been analysed and saved.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl border border-[#1f2d1f] text-[#f0fdf4] text-sm font-medium hover:border-green-600 transition"
              >
                Upload Another
              </button>
              <Link
                href="/patient/timeline"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-[#f0fdf4] text-sm font-semibold transition"
              >
                View Timeline <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}