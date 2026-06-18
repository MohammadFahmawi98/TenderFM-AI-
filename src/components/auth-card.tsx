"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

const companyTypes = [
  "Facility Management Company",
  "Cleaning Company",
  "Landscaping Company",
  "MEP Contractor",
  "HVAC Contractor",
  "Security Company",
  "Pest Control Company",
  "Property Management Company",
  "Government Entity",
];

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());
    const endpoint = isSignUp ? "/api/auth/sign-up" : "/api/auth/sign-in";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Authentication failed.");
      return;
    }

    router.push(isSignUp ? "/tenders/new" : "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#070812] px-4 py-8 text-[#F8FAFC]">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0F1A] shadow-2xl lg:grid-cols-[1fr_500px]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative flex min-h-[620px] flex-col justify-between overflow-hidden p-8 md:p-10"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,8,18,0.96),rgba(11,15,26,0.72),rgba(6,24,38,0.78))]" />
          <motion.div
            className="absolute right-10 top-10 h-28 w-28 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 blur-sm"
            animate={{ y: [0, 10, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
          <motion.div
            className="absolute bottom-24 left-12 h-20 w-20 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 blur-sm"
            animate={{ y: [0, -12, 0], opacity: [0.4, 0.75, 0.4] }}
            transition={{ repeat: Infinity, duration: 6 }}
          />

          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#36F4B7]">TenderFlow AI</p>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              {isSignUp ? "Create your AI bid department." : "Welcome back to your tender operating system."}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#94A3B8]">
              {isSignUp
                ? "Start with an organization workspace built for FM tender analysis, AI agents, document review, and final submission packages."
                : "Open your workspaces, generated documents, agents, and submission package review."}
            </p>
          </div>

          <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Upload RFP", "Extract requirements"],
              ["Agents Generate", "Draft every deliverable"],
              ["Team Reviews", "Approve and export"],
            ].map(([item, body], index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
                className="rounded-lg border border-white/[0.08] bg-[#07111F]/80 p-4 backdrop-blur"
              >
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center bg-[#F8FAFC] p-6 text-[#0F172A] md:p-10"
        >
          <div className="w-full">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                {isSignUp ? "Organization Setup" : "Secure Access"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{isSignUp ? "Create workspace" : "Sign in"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="firstName" className="auth-field" placeholder="First name" required />
                    <input name="lastName" className="auth-field" placeholder="Last name" required />
                  </div>
                  <input name="companyName" className="auth-field" placeholder="Company name" required />
                  <select name="companyType" className="auth-field" required defaultValue="">
                    <option value="" disabled>
                      Company type
                    </option>
                    {companyTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </>
              ) : null}

              <input name="email" className="auth-field" placeholder="Work email" type="email" required />
              <input name="password" className="auth-field" placeholder="Password" type="password" minLength={8} required />

              {!isSignUp ? (
                <div className="flex items-center justify-between text-sm text-[#475569]">
                  <label className="flex items-center gap-2">
                    <input name="rememberMe" type="checkbox" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="font-medium text-[#2563EB]">
                    Forgot password
                  </Link>
                </div>
              ) : null}

              {error ? <div className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#FCA5A5]">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-[#2563EB] text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/20 transition hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                {loading ? "Working..." : isSignUp ? "Create workspace" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#475569]">
              {isSignUp ? "Already have a workspace?" : "Need a workspace?"}{" "}
              <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-medium text-[#2563EB]">
                {isSignUp ? "Sign in" : "Create one"}
              </Link>
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
