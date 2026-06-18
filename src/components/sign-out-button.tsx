"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      title="Sign out"
      className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.06] bg-[#111827] text-[#94A3B8] transition hover:text-white disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
