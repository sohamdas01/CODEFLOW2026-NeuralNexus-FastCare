"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Bell, FileText, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import StatusBadge from "../../../components/shared/StatusBadge.jsx";
import { formatRelativeTime } from "../../../utils/formatDate.js";
import { getRiskBadgeClass } from "../../../utils/riskLevel.js";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, activeAlerts: 0, criticalPatients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch("/api/patients?limit=5"),
          fetch("/api/alerts?severity=critical&reviewed=false&limit=5"),
        ]);
        const pData = await pRes.json();
        const aData = await aRes.json();

        const allPatientsRes = await fetch("/api/patients?limit=1");
        const allP = await allPatientsRes.json();

        setPatients(pData.patients || []);
        setAlerts(aData.alerts || []);
        setStats({
          totalPatients: allP.total || pData.total || 0,
          activeAlerts: aData.total || 0,
          criticalPatients: (pData.patients || []).filter((p) => p.riskLevel === "critical" || p.riskLevel === "high").length,
        });
      } catch (err) {
        console.error("Doctor dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-accent", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Active Alerts", value: stats.activeAlerts, icon: Bell, color: "text-critical", bg: "bg-critical/10", border: "border-critical/20" },
    { label: "High/Critical Risk", value: stats.criticalPatients, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  ];

  return (
    <DashboardLayout title="Doctor Dashboard" subtitle="Overview of patient activity">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading dashboard..." />
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`p-5 rounded-2xl bg-surface border ${border} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
                  <div className="text-textmuted text-sm">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent patients */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-textprimary font-semibold">Recent Patients</h2>
                <Link href="/doctor/patients" className="text-accent text-sm hover:text-primary flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {patients.length === 0 ? (
                <p className="text-textmuted text-sm text-center py-8">No patients registered yet</p>
              ) : (
                <div className="space-y-3">
                  {patients.map((p) => (
                    <Link
                      key={p._id}
                      href={`/doctor/patients/${p._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent text-sm font-bold">{p.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-textprimary text-sm font-medium truncate">{p.name}</p>
                        <p className="text-textmuted text-xs">{p.recordCount || 0} records · {p.lastVisit ? formatRelativeTime(p.lastVisit) : "No visits"}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRiskBadgeClass(p.riskLevel)}`}>
                        {p.riskLevel}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Critical alerts sidebar */}
            <div className="p-6 rounded-2xl bg-surface border border-critical/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-critical font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Alerts
                </h2>
                <Link href="/doctor/alerts" className="text-accent text-sm hover:text-primary flex items-center gap-1 transition-colors">
                  All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {alerts.length === 0 ? (
                <p className="text-textmuted text-sm text-center py-8">No critical alerts 🎉</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div key={a._id} className="p-3 rounded-xl bg-critical/5 border border-critical/20">
                      <p className="text-textmuted text-xs mb-1">{a.patientId?.name}</p>
                      <p className="text-critical/90 text-xs leading-relaxed line-clamp-2">{a.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}