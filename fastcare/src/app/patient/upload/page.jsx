// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
// import UploadZone from "../../../components/patient/UploadZone.jsx";
// import ProcessingStatus from "../../../components/patient/ProcessingStatus.jsx";
// import { useUpload } from "../../../hooks/useUpload.js";
// import { CheckCircle, RotateCcw } from "lucide-react";

// export default function UploadPage() {
//   const { user } = useUser();
//   const [patientId, setPatientId] = useState(null);

//   const {
//     file, setFile,
//     reportType, setReportType,
//     uploading, recordId,
//     processingStatus, processingError,
//     uploadError, uploadFile, reset,
//   } = useUpload();

//   // Load patient profile to get patientId
//   useEffect(() => {
//     async function loadPatient() {
//       if (!user) return;
//       try {
//         const res = await fetch("/api/patients", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: user.fullName || user.firstName || "Patient",
//             email: user.primaryEmailAddress?.emailAddress || "",
//           }),
//         });
//         const data = await res.json();
//         setPatientId(data.patient?._id);
//       } catch (err) {
//         console.error("Failed to load patient:", err);
//       }
//     }
//     loadPatient();
//   }, [user]);

//   const handleUpload = () => uploadFile(patientId);
//   const isDone = processingStatus === "completed";

//   return (
//     <DashboardLayout title="Upload Record" subtitle="Upload a medical PDF to process">
//       <div className="max-w-2xl">
//         {isDone ? (
//           <div className="space-y-6">
//             <div className="p-8 rounded-2xl bg-success/10 border border-success/30 text-center">
//               <div className="w-16 h-16 rounded-full bg-success/20 border border-success/40 flex items-center justify-center mx-auto mb-4">
//                 <CheckCircle className="w-8 h-8 text-success" />
//               </div>
//               <h3 className="text-success text-xl font-bold mb-2">Record Processed!</h3>
//               <p className="text-textmuted text-sm">
//                 Your medical record has been fully processed and your Medical Wiki has been updated.
//               </p>
//             </div>
//             <ProcessingStatus status={processingStatus} error={processingError} recordId={recordId} />
//             <button
//               onClick={reset}
//               className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border hover:border-primary/40 text-textprimary hover:text-accent text-sm font-medium transition-all"
//             >
//               <RotateCcw className="w-4 h-4" />
//               Upload Another Record
//             </button>
//           </div>
//         ) : recordId ? (
//           <div className="space-y-4">
//             <ProcessingStatus status={processingStatus} error={processingError} recordId={recordId} />
//             {processingStatus === "failed" && (
//               <button
//                 onClick={reset}
//                 className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border hover:border-primary/40 text-textprimary hover:text-accent text-sm font-medium transition-all"
//               >
//                 <RotateCcw className="w-4 h-4" />
//                 Try Again
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="p-5 rounded-2xl bg-surface border border-border">
//               <h2 className="text-textprimary font-semibold mb-1">Upload Medical Document</h2>
//               <p className="text-textmuted text-sm">
//                 Supports lab reports, prescriptions, discharge summaries, and scan reports.
//                 Our AI will extract all clinical data automatically.
//               </p>
//             </div>
//             <UploadZone
//               file={file}
//               setFile={setFile}
//               reportType={reportType}
//               setReportType={setReportType}
//               onUpload={handleUpload}
//               uploading={uploading}
//               error={uploadError}
//             />
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import UploadZone from "../../../components/patient/UploadZone.jsx";
import ProcessingStatus from "../../../components/patient/ProcessingStatus.jsx";
import { useUpload } from "../../../hooks/useUpload.js";
import { CheckCircle, RotateCcw } from "lucide-react";

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
      const formData = new FormData();
      formData.append("reportType", reportType);
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setRecordId(data.recordId);
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
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-6">
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
          <div className="bg-[#111111] border border-[#1f2d1f] rounded-2xl p-6 text-center space-y-4">
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
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
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