"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedDocumentKind } from "@prisma/client";
import { documentBlueprints } from "@/lib/document-generation";

export function DocumentGenerationActions({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  async function generate(kind?: GeneratedDocumentKind) {
    setGenerating(kind ?? "ALL");
    setMessage(null);

    const response = await fetch("/api/generated-files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenderId,
        kind,
        generateAll: !kind,
      }),
    });
    const result = await response.json();
    setGenerating(null);

    if (!response.ok) {
      setMessage(result.error ?? "Document generation failed.");
      return;
    }

    setMessage(`${result.generatedFiles.length} document${result.generatedFiles.length === 1 ? "" : "s"} generated.`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Generate From RFP Sources</p>
          <p className="mt-1 text-sm text-[#94A3B8]">Creates real database documents from extracted tender chunks and intelligence records.</p>
        </div>
        <button
          type="button"
          onClick={() => generate()}
          disabled={Boolean(generating)}
          className="h-10 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {generating === "ALL" ? "Generating..." : "Generate Full Package"}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {documentBlueprints.map((document) => (
          <button
            key={document.kind}
            type="button"
            onClick={() => generate(document.kind)}
            disabled={Boolean(generating)}
            className="rounded-md border border-[#162033] bg-[#050816] p-3 text-left text-sm text-[#F8FAFC] transition hover:border-[#00E5FF]/50 disabled:opacity-60"
          >
            <span className="block font-semibold">{document.label}</span>
            <span className="mt-1 block text-xs text-[#94A3B8]">{document.type}</span>
          </button>
        ))}
      </div>
      {message ? <p className="text-xs text-[#94A3B8]">{message}</p> : null}
    </div>
  );
}
