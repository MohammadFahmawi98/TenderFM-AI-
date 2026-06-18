"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Globe2, KeyRound } from "lucide-react";

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

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1020] px-4 py-10 text-[#F8FAFC]">
      <section className="w-full max-w-xl rounded-lg border border-[#1E293B] bg-[#111827] p-6">
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#3B82F6]">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold">{isSignUp ? "Create Account" : "Sign In"}</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            {isSignUp
              ? "Create an organization workspace for TenderFlow FM AI."
              : "Access your tender intelligence workspace."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
            <div className="grid gap-4 md:grid-cols-2">
              <input name="firstName" className="field" placeholder="First Name" required />
              <input name="lastName" className="field" placeholder="Last Name" required />
              <input name="companyName" className="field md:col-span-2" placeholder="Company Name" required />
              <input name="phone" className="field" placeholder="Phone Number" />
              <input name="country" className="field" placeholder="Country" />
              <select name="companyType" className="field md:col-span-2" required>
                <option>Facility Management Company</option>
                <option>Cleaning Company</option>
                <option>Landscaping Company</option>
                <option>MEP Contractor</option>
                <option>HVAC Contractor</option>
                <option>Security Company</option>
                <option>Pest Control Company</option>
                <option>Government Entity</option>
                <option>Property Management Company</option>
              </select>
            </div>
          ) : null}
          <input name="email" className="field" placeholder="Email Address" type="email" required />
          <input name="password" className="field" placeholder="Password" type="password" minLength={8} required />
          {isSignUp ? (
            <input
              name="confirmPassword"
              className="field"
              placeholder="Confirm Password"
              type="password"
              minLength={8}
              required
            />
          ) : null}

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

          {error ? (
            <div className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#FCA5A5]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-[#3B82F6] text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Working..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#1E293B] text-sm">
            <Globe2 className="h-4 w-4" />
            Google
          </button>
          <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#1E293B] text-sm">
            <Building2 className="h-4 w-4" />
            Microsoft
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          {isSignUp ? "Already have an account?" : "Need a workspace?"}{" "}
          <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="text-[#3B82F6]">
            {isSignUp ? "Sign in" : "Create account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
