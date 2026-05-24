"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import UploadZone from "../../../components/patient/UploadZone.jsx";
import ProcessingStatus from "../../../components/patient/ProcessingStatus.jsx";
import { useUpload } from "../../../hooks/useUpload.js";
import { CheckCircle, RotateCcw } from "lucide-react";

export default function UploadPage() {
  const { user } = useUser();
  const [patientId, setPatientId] = useState(null);

  const {
    file, setFile,
    reportType, setReportType,
    uploading, recordId,
    processingStatus, processingError,
    uploadError, uploadFile, reset,
  } = useUpload();

  // Load patient profile to get patientId
  useEffect(() => {
    async function loadPatient() {
      if (!user) return;
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.fullName || user.firstName || "Patient",
            email: user.primaryEmailAddress?.emailAddress || "",
          }),
        });
        const data = await res.json();
        setPatientId(data.patient?._id);
      } catch (err) {
        console.error("Failed to load patient:", err);
      }
    }
    loadPatient();
  }, [user]);

  const handleUpload = () => uploadFile(patientId);
  const isDone = processingStatus === "completed";

  return (
    <DashboardLayout title="Upload Record" subtitle="Upload a medical PDF to process">
      <div className="max-w-2xl">
        {isDone ? (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-success/10 border border-success/30 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 border border-success/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-success text-xl font-bold mb-2">Record Processed!</h3>
              <p className="text-textmuted text-sm">
                Your medical record has been fully processed and your Medical Wiki has been updated.
              </p>
            </div>
            <ProcessingStatus status={processingStatus} error={processingError} recordId={recordId} />
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border hover:border-primary/40 text-textprimary hover:text-accent text-sm font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Upload Another Record
            </button>
          </div>
        ) : recordId ? (
          <div className="space-y-4">
            <ProcessingStatus status={processingStatus} error={processingError} recordId={recordId} />
            {processingStatus === "failed" && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border hover:border-primary/40 text-textprimary hover:text-accent text-sm font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-surface border border-border">
              <h2 className="text-textprimary font-semibold mb-1">Upload Medical Document</h2>
              <p className="text-textmuted text-sm">
                Supports lab reports, prescriptions, discharge summaries, and scan reports.
                Our AI will extract all clinical data automatically.
              </p>
            </div>
            <UploadZone
              file={file}
              setFile={setFile}
              reportType={reportType}
              setReportType={setReportType}
              onUpload={handleUpload}
              uploading={uploading}
              error={uploadError}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
