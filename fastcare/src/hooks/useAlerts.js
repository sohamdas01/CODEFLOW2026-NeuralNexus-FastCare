"use client";
import { useState, useEffect, useCallback } from "react";


export function useAlerts({ severity = "", reviewed = "", page = 1, limit = 20 } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (severity) params.set("severity", severity);
    if (reviewed !== "") params.set("reviewed", reviewed);
    params.set("page", String(page));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/alerts?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch alerts");
      }
      const data = await res.json();
      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [severity, reviewed, page, limit]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markReviewed = useCallback(async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: true }),
      });
      if (!res.ok) throw new Error("Failed to mark reviewed");
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, reviewed: true } : a))
      );
    } catch (err) {
      console.error("[useAlerts] Mark reviewed error:", err);
    }
  }, []);

  return { alerts, total, totalPages, loading, error, refetch: fetchAlerts, markReviewed };
}
