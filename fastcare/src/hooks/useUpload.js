"use client";
import { useState, useRef, useCallback } from "react";
import { POLLING_INTERVAL_MS } from "../utils/constants.js";
// Hook to manage file upload and processing status polling
export function useUpload() {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/records/${id}/status`);
          if (!res.ok) return;
          const data = await res.json();

          setProcessingStatus(data.processingStatus);

          if (data.processingStatus === "completed" || data.processingStatus === "failed") {
            stopPolling();
            if (data.processingStatus === "failed") {
              setProcessingError(data.processingError || "Processing failed");
            }
          }
        } catch (err) {
          console.error("[useUpload] Polling error:", err);
        }
      }, POLLING_INTERVAL_MS);
    },
    [stopPolling]
  );

  const uploadFile = useCallback(
    async (patientId) => {
      if (!file) {
        setUploadError("Please select a PDF file");
        return;
      }

      setUploading(true);
      setUploadError(null);
      setProcessingError(null);
      setRecordId(null);
      setProcessingStatus(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("reportType", reportType);
      if (patientId) formData.append("patientId", patientId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        setRecordId(data.recordId);
        setProcessingStatus("uploading");
        startPolling(data.recordId);
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setUploading(false);
      }
    },
    [file, reportType, startPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setFile(null);
    setReportType("other");
    setUploading(false);
    setRecordId(null);
    setProcessingStatus(null);
    setProcessingError(null);
    setUploadError(null);
  }, [stopPolling]);

  return {
    file,
    setFile,
    reportType,
    setReportType,
    uploading,
    recordId,
    processingStatus,
    processingError,
    uploadError,
    uploadFile,
    reset,
  };
}
