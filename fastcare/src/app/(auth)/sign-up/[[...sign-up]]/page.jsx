"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Shield, BrainCircuit, Activity, FileText, Loader2, HeartPulse, Stethoscope } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, isDoctor }),
    });

    if (res.ok) {
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!signInRes?.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Error signing in after registration");
        setLoading(false);
      }
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex bg-black mt-15">
      {/* Left Aside */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0a150f] via-black to-[#050a07] border-r border-[#1f2d1f] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.3)]">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">FastCare</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#f0fdf4] mb-6 leading-tight">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">revolution</span> in healthcare.
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-md">
            Create your secure account to manage records and get intelligent medical insights instantly.
          </p>

          <div className="space-y-6">
            {[
              { icon: BrainCircuit, title: "AI-Powered Analysis", desc: "Instantly process and summarize complex medical PDFs." },
              { icon: Activity, title: "Real-time Clinical Alerts", desc: "Get notified about critical health flags immediately." },
              { icon: Shield, title: "Smart Contradiction Checks", desc: "Automatically detect drug and allergy conflicts." },
              { icon: FileText, title: "Secure Medical Vault", desc: "All your records encrypted and safely stored in one place." }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1f2d1f] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <feature.icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-[#f0fdf4] font-medium">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="relative z-10 text-sm text-gray-500 font-mono">
          © {new Date().getFullYear()} FastCare Systems. All rights reserved.
        </div> */}
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden lg:hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-green-900/10 blur-[100px]" />
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left mb-8">
            <div className="flex items-center justify-center lg:hidden gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#f0fdf4]">FastCare</span>
            </div>
            <h2 className="text-3xl font-bold text-[#f0fdf4] mb-2">Create an account</h2>
            <p className="text-gray-400">Please enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#111111] border border-[#1f2d1f] text-[#f0fdf4] placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#111111] border border-[#1f2d1f] text-[#f0fdf4] placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#111111] border border-[#1f2d1f] text-[#f0fdf4] placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2 pb-1">
              <div 
                className={"flex items-center gap-3 p-3 rounded-xl border bg-[#111111] transition-all cursor-pointer select-none " + (isDoctor ? "border-green-500/50 shadow-[0_0_15px_rgba(22,163,74,0.1)]" : "border-[#1f2d1f] hover:border-green-500/30")}
                onClick={() => setIsDoctor(!isDoctor)}
              >
                <div className={"w-5 h-5 rounded flex items-center justify-center border transition-colors " + (isDoctor ? "bg-green-500 border-green-500" : "bg-[#0a0a0a] border-gray-600")}>
                  {isDoctor && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-gray-300">I am a healthcare provider (Doctor)</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-[0_0_20px_rgba(22,163,74,0.15)] hover:shadow-[0_0_25px_rgba(22,163,74,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
