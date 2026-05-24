"use client";
import { useState, useEffect, useCallback } from "react";

// Hook to fetch patients for doctor view
export function usePatients({ search = "", riskLevel = "", page = 1, limit = 12 } = {}) {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (riskLevel) params.set("riskLevel", riskLevel);
    params.set("page", String(page));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/patients?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch patients");
      }
      const data = await res.json();
      setPatients(data.patients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, riskLevel, page, limit]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, total, totalPages, loading, error, refetch: fetchPatients };
}

//single patient
export function usePatient(id) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch patient");
      }
      const data = await res.json();
      setPatient(data.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  return { patient, loading, error, refetch: fetchPatient };
}
