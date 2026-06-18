"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-[#F8FAFC]">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B1220] lg:grid-cols-[1fr_520px]">
        <div className="flex flex-col justify-between bg-[#111827] p-8 md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00E5FF]">TenderFlow AI</p>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight">
              {isSignUp ? "Create your AI bid department." : "Welcome back to your tender operating system."}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#94A3B8]">
              {isSignUp
                ? "Start with an organization workspace built for FM tender analysis, AI agents, document review, and final submission packages."
                : "Open your workspaces, generated documents, agents, and submission package review."}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["Upload RFP", "Agents Generate", "Team Reviews"].map((item) => (
              <div key={item} className="rounded-lg border border-white/[0.06] bg-[#050816] p-4">
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center p-6 md:p-10">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5FF]">
                {isSignUp ? "Organization Setup" : "Secure Access"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{isSignUp ? "Create workspace" : "Sign in"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="firstName" className="field" placeholder="First name" required />
                    <input name="lastName" className="field" placeholder="Last name" required />
                  </div>
                  <input name="companyName" className="field" placeholder="Company name" required />
                  <select name="companyType" className="field" required defaultValue="">
                    <option value="" disabled>
                      Company type
                    </option>
                    {companyTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </>
              ) : null}

              <input name="email" className="field" placeholder="Work email" type="email" required />
              <input name="password" className="field" placeholder="Password" type="password" minLength={8} required />

              {!isSignUp ? (
                <div className="flex items-center justify-between text-sm text-[#94A3B8]">
                  <label className="flex items-center gap-2">
                    <input name="rememberMe" type="checkbox" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-[#3B82F6]">
                    Forgot password
                  </Link>
                </div>
              ) : null}

              {error ? <div className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#FCA5A5]">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-[#3B82F6] text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Working..." : isSignUp ? "Create workspace" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#94A3B8]">
              {isSignUp ? "Already have a workspace?" : "Need a workspace?"}{" "}
              <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="text-[#3B82F6]">
                {isSignUp ? "Sign in" : "Create one"}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
