"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export function TenderUploadForm() {
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const response = await fetch("/api/tenders", {
      method: "POST",
      body: new FormData(form),
    });

    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setMessage({ type: "error", text: result.error ?? "Tender upload failed." });
      return;
    }

    form.reset();
    const extracted = result.tender.files.filter((file: { extractionStatus: string }) => file.extractionStatus === "COMPLETED").length;
    setMessage({
      type: "success",
      text: `Workspace created: ${result.tender.name}. ${extracted} file(s) extracted for AI intelligence.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-md border border-[#1E293B] bg-[#0B1020] px-3 py-2 text-sm text-[#94A3B8]">
        Upload the RFP package only. TenderFlow will extract the tender name, client, dates, scope, risks, and requirements from the source files.
      </div>

      <label className="block min-h-[340px] rounded-lg border border-dashed border-[#3B82F6]/70 bg-[#0B1020] p-8 text-center transition hover:border-[#00E5FF]">
        <UploadCloud className="mx-auto h-12 w-12 text-[#3B82F6]" />
        <span className="mt-5 block text-2xl font-semibold">Upload RFP documents</span>
        <span className="mx-auto mt-3 block max-w-2xl text-sm leading-6 text-[#94A3B8]">
          Add the full tender package: RFP, scope, BOQ, asset register, drawings, appendices, addendums, commercial forms, and schedules.
          The workspace profile and intelligence will be created from these files.
        </span>
        <input name="files" type="file" multiple required className="mt-8 max-w-full text-sm" />
      </label>

      {message ? (
        <div className="rounded-md border border-[#1E293B] bg-[#0B1020] px-3 py-2 text-sm text-[#F8FAFC]">
          <span>{message.text}</span>
          {message.type === "success" ? (
            <Link href="/workspace" className="ml-2 font-semibold text-[#00E5FF]">
              Open workspace
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="h-10 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Creating workspace..." : "Upload RFP and Create Workspace"}
      </button>
    </form>
  );
}
