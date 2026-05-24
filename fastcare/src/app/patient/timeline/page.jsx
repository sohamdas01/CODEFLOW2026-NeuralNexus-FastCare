"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import TimelineItem from "../../../components/patient/TimelineItem.jsx";
import EmptyState from "../../../components/shared/EmptyState.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import { Clock, Upload } from "lucide-react";
import Link from "next/link";
import { REPORT_TYPES } from "../../../utils/constants.js";

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const pRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.name || "Patient",
            email: user?.email || "",
          }),
        });
        const pData = await pRes.json();
        const pid = pData.patient?._id;
        setPatientId(pid);

        if (pid) {
          const rRes = await fetch(`/api/patients/${pid}/timeline`);
          const rData = await rRes.json();
          setRecords(rData.records || []);
        }
      } catch (err) {
        console.error("Timeline load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredRecords = filter === "all"
    ? records
    : records.filter((r) => r.reportType === filter);

  return (
    <DashboardLayout title="Medical Timeline" subtitle="Your complete medical history">
      <div className="max-w-3xl">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === "all" ? "bg-green-600/15 text-green-400 border-green-600/40" : "bg-[#1a1a1a] text-[#6b7280] border-[#1f2d1f] hover:border-green-600/30"}`}
          >
            All
          </button>
          {REPORT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === value ? "bg-green-600/15 text-green-400 border-green-600/40" : "bg-[#1a1a1a] text-[#6b7280] border-[#1f2d1f] hover:border-green-600/30"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" label="Loading timeline..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No records found"
            description={filter === "all" ? "Upload your first medical document to start your timeline." : `No ${filter} records uploaded yet.`}
            action={
              <Link href="/patient/upload" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-[#f0fdf4] text-sm font-medium hover:hover:bg-green-700 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Record
              </Link>
            }
          />
        ) : (
          <div>
            <p className="text-[#6b7280] text-sm mb-6">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} found
            </p>
            {filteredRecords.map((record, index) => (
              <TimelineItem
                key={record._id}
                record={record}
                isLast={index === filteredRecords.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
