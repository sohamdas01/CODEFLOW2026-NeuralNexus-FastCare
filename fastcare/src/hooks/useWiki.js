"use client";
import { useState, useEffect, useCallback } from "react";

// Hook to fetch patient wiki data

export function useWiki(patientId) {
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWiki = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/patients/${patientId}/wiki`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch wiki");
      }
      const data = await res.json();
      setWiki(data.wiki);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchWiki();
  }, [fetchWiki]);

  return { wiki, loading, error, refetch: fetchWiki };
}
