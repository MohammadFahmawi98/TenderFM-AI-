"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionExportActions({
  tenderId,
  canExport,
  missingRequiredKinds,
}: {
  tenderId: string;
  canExport: boolean;
  missingRequiredKinds: string[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function exportPackage() {
    setExporting(true);
    setMessage(null);

    const response = await fetch("/api/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenderId }),
    });
    const result = await response.json();
    setExporting(false);

    if (!response.ok) {
      setMessage(result.error ?? "Export failed.");
      return;
    }

    setMessage("Submission package exported and locked.");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-[#162033] bg-[#050816] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Final Package Gate</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {canExport
              ? "Required documents are approved or final. The package can be exported."
              : `Missing approvals: ${missingRequiredKinds.map((kind) => kind.replaceAll("_", " ")).join(", ") || "none"}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={exportPackage}
          disabled={!canExport || exporting}
          className="h-10 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export Final ZIP"}
        </button>
      </div>
      {message ? <p className="mt-3 text-xs text-[#94A3B8]">{message}</p> : null}
    </div>
  );
}
