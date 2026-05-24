"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../../components/shared/DashboardLayout.jsx";
import LoadingSpinner from "../../../components/shared/LoadingSpinner.jsx";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { BLOOD_GROUPS } from "../../../utils/constants.js";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("medical");

  const [form, setForm] = useState({
    bloodGroup: "Unknown",
    dob: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

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
        const p = data.patient;
        setPatient(p);
        setForm({
          bloodGroup: p?.bloodGroup || "Unknown",
          dob: p?.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
          emergencyName: p?.emergencyContact?.name || "",
          emergencyPhone: p?.emergencyContact?.phone || "",
          emergencyRelation: p?.emergencyContact?.relation || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/patients/${patient._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup: form.bloodGroup,
          dob: form.dob || undefined,
          emergencyContact: {
            name: form.emergencyName,
            phone: form.emergencyPhone,
            relation: form.emergencyRelation,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setPatient(data.patient);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#1f2d1f] text-[#f0fdf4] focus:outline-none focus:border-green-600 transition-colors text-sm placeholder-textmuted";
  const labelClass = "block text-sm font-medium text-[#f0fdf4] mb-1.5";

  return (
    <DashboardLayout title="Profile" subtitle="Manage your medical profile">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading profile..." />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#1f2d1f] pb-0">
            {["medical", "account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                  activeTab === tab
                    ? "border-green-600 text-green-400"
                    : "border-transparent text-[#6b7280] hover:text-[#f0fdf4]"
                }`}
              >
                {tab === "medical" ? "Medical Info" : "Account Settings"}
              </button>
            ))}
          </div>

          {activeTab === "medical" ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition space-y-5">
                <h3 className="text-[#f0fdf4] font-semibold">Medical Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className={inputClass}
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg} className="bg-[#1a1a1a]">{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition space-y-5">
                <h3 className="text-[#f0fdf4] font-semibold">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      value={form.emergencyName}
                      onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                      placeholder="Contact person's full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      value={form.emergencyPhone}
                      onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Relationship</label>
                    <input
                      type="text"
                      value={form.emergencyRelation}
                      onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                      placeholder="e.g. Spouse, Parent"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-green-500 text-sm">Profile saved successfully!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:hover:bg-green-700 text-[#f0fdf4] font-medium transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition">
              <h3 className="text-xl font-semibold mb-4 text-[#f0fdf4]">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-1">Name</label>
                  <p className="text-[#f0fdf4] bg-[#1a1a1a] px-4 py-2 rounded-lg">{session?.user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-1">Email</label>
                  <p className="text-[#f0fdf4] bg-[#1a1a1a] px-4 py-2 rounded-lg">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
