"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Upload, Clock, CreditCard, ArrowRight, FileText } from "lucide-react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx"; 
import StatusBadge from "../../../components/shared/StatusBadge.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import { formatDate } from "../../../utils/formatDate.js";
import StatCards from "../../../components/patient/StatCards.jsx";
export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get or create patient profile
        const pRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.name || "Patient",
            email: user?.email || "",
          }),
        });
        const pData = await pRes.json();
        setPatient(pData.patient);

        if (pData.patient?._id) {
          const rRes = await fetch(`/api/patients/${pData.patient._id}/records`);
          const rData = await rRes.json();
          setRecords(rData.records?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
  }, [user]);

  const quickActions = [
    { href: "/patient/upload", icon: Upload, label: "Upload Record", color: "text-green-400", bg: "bg-green-600/10", border: "border-green-600/30" },
    { href: "/patient/timeline", icon: Clock, label: "View Timeline", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { href: "/patient/emergency-card", icon: CreditCard, label: "Emergency Card", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.firstName || ""}!`}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading your dashboard..." />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl">
          {/* Stats */}
          <StatCards patient={patient} />

          {/* Quick actions */}
          <div>
            <h2 className="text-[#f0fdf4] font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map(({ href, icon: Icon, label, color, bg, border }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-[#111111] border ${border} hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] hover:-translate-y-0.5 transition-all duration-200 group`}
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[#f0fdf4] font-medium">{label}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6b7280] group-hover:text-green-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent records */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#f0fdf4] font-semibold">Recent Uploads</h2>
              <Link href="/patient/timeline" className="text-green-400 text-sm hover:text-green-600 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {records.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition text-center">
                <FileText className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
                <p className="text-[#f0fdf4] font-medium mb-1">No records yet</p>
                <p className="text-[#6b7280] text-sm mb-4">Upload your first medical PDF to get started</p>
                <Link href="/patient/upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-[#f0fdf4] text-sm font-medium hover:hover:bg-green-700 transition-colors">
                  <Upload className="w-4 h-4" /> Upload Record
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition">
                    <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge reportType={r.reportType} />
                        <StatusBadge status={r.processingStatus} />
                      </div>
                      <p className="text-[#6b7280] text-xs mt-1">{formatDate(r.recordDate || r.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}