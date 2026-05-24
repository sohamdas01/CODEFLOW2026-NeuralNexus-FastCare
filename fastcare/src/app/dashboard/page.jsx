"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stethoscope, User, Heart, Loader2 } from "lucide-react";
import LoadingSpinner from "../../components/shared/LoadingSpinner.jsx";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email =
      user.primaryEmailAddress
        ?.emailAddress
        ?.toLowerCase();

    const doctorEmails =
      process.env
        .NEXT_PUBLIC_DOCTOR_EMAILS
        ?.split(",")
        .map(email => email.trim().toLowerCase()) || [];

    const role =
      doctorEmails.includes(email)
        ? "doctor"
        : "patient";

    router.replace(
      `/${role}/dashboard`
    );

  }, [isLoaded, user, router]);


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading..."
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Redirecting..."
        />
      </div>
    );
  }


  async function selectRole(chosenRole) {

    setSelecting(true);
    setError("");

    try {

      router.replace(
        `/${chosenRole}/dashboard`
      );

    } catch {

      setError(
        "Something went wrong"
      );

      setSelecting(false);
    }
  }


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">

        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-green">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>

          <div className="text-textprimary font-bold text-2xl">
            Fastcare
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-surface border border-border">

          <div className="text-center mb-8">

            <h2 className="text-textprimary text-2xl font-bold mb-2">
              Welcome, {user?.firstName || "there"}!
            </h2>

            <p className="text-textmuted">
              How will you be using Fastcare?
            </p>

          </div>


          {error && (
            <div className="mb-6 p-4 rounded-xl bg-critical/10 border border-critical/30 text-critical text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => selectRole("patient")}
              disabled={selecting}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User className="w-8 h-8 text-accent" />
              </div>

              <div className="text-center">
                <div className="text-textprimary font-bold text-lg">
                  Patient
                </div>

                <div className="text-textmuted text-xs mt-1">
                  Upload and manage my own medical records
                </div>
              </div>
            </button>


            <button
              onClick={() => selectRole("doctor")}
              disabled={selecting}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Stethoscope className="w-8 h-8 text-blue-400" />
              </div>

              <div className="text-center">
                <div className="text-textprimary font-bold text-lg">
                  Doctor
                </div>

                <div className="text-textmuted text-xs mt-1">
                  View and analyze my patients' records
                </div>
              </div>

            </button>

          </div>

          {selecting && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="text-textmuted text-sm">
                Setting up your account...
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}