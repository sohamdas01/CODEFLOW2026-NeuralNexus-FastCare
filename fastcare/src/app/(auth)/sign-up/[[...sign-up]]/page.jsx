"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      }
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-8 rounded-xl border border-[#1f2d1f] w-full max-w-md">
        <h2 className="text-2xl text-[#f0fdf4] font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-[#1f2d1f] text-[#f0fdf4]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-[#1f2d1f] text-[#f0fdf4]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-[#1f2d1f] text-[#f0fdf4]"
            required
          />
        </div>
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isDoctor"
            checked={isDoctor}
            onChange={(e) => setIsDoctor(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isDoctor" className="text-gray-400 text-sm">I am a doctor</label>
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-[#f0fdf4] font-semibold py-3 rounded-xl transition">
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link href="/sign-in" className="text-green-500 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}