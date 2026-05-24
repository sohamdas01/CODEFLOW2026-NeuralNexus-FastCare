"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import EmergencyCard from "../../../components/patient/EmergencyCard.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";

export default function EmergencyCardPage() {
  const { user } = useUser();
  const [patient, setPatient] = useState(null);
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const pRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.fullName || user.firstName || "Patient",
            email: user.primaryEmailAddress?.emailAddress || "",
          }),
        });
        const pData = await pRes.json();
        const p = pData.patient;
        setPatient(p);

        if (p?._id) {
          const wRes = await fetch(`/api/patients/${p._id}/wiki`);
          const wData = await wRes.json();
          setWiki(wData.wiki);
        }
      } catch (err) {
        console.error("Emergency card load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <DashboardLayout title="Emergency Card" subtitle="Your medical ID card for emergencies">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading emergency card..." />
        </div>
      ) : (
        <EmergencyCard patient={patient} wiki={wiki} />
      )}
    </DashboardLayout>
  );
}
