"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, BrainCircuit, Activity, FileText, Loader2, HeartPulse } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full flex-1 flex bg-black mt-15">
      {/* Left Aside (Visible on Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0a150f] via-black to-[#050a07] border-r border-[#1f2d1f] p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background blobs */}
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
            The future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">intelligent</span> patient care.
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-md">
            Unify your medical records, get AI-powered clinical insights, and detect contradictions instantly.
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
            <h2 className="text-3xl font-bold text-[#f0fdf4] mb-2">Welcome back</h2>
            <p className="text-gray-400">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-[0_0_20px_rgba(22,163,74,0.15)] hover:shadow-[0_0_25px_rgba(22,163,74,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
