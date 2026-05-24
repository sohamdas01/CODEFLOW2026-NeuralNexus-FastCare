"use client";
import { useState, useCallback } from "react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import PatientCard from "../../../components/doctor/PatientCard.jsx";
import PatientSearch from "../../../components/doctor/PatientSearch.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import EmptyState from "../../../components/shared/EmptyState.jsx";
import { usePatients } from "../../../hooks/usePatients.js";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [page, setPage] = useState(1);

  const { patients, total, totalPages, loading, error } = usePatients({ search, riskLevel, page });

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleRiskFilter = useCallback((val) => {
    setRiskLevel(val);
    setPage(1);
  }, []);

  return (
    <DashboardLayout title="Patients" subtitle={`${total} patients registered`}>
      <div className="space-y-6 max-w-7xl">
        {/* Search + filters */}
        <PatientSearch
          onSearch={handleSearch}
          onRiskFilter={handleRiskFilter}
          searchValue={search}
          riskValue={riskLevel}
        />

        {/* Results info */}
        {!loading && (
          <p className="text-textmuted text-sm">
            {total === 0 ? "No patients found" : `Showing ${patients.length} of ${total} patients`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" label="Loading patients..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-critical/10 border border-critical/30">
            <p className="text-critical text-sm">{error}</p>
          </div>
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description={search ? `No results for "${search}". Try a different search.` : "No patients have registered yet."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {patients.map((patient) => (
              <PatientCard key={patient._id} patient={patient} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-textmuted hover:text-textprimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-textmuted text-sm font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-textmuted hover:text-textprimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}