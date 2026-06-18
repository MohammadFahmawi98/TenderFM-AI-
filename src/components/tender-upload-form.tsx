"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

const categories = [
  "Total Facilities Management",
  "Hard FM",
  "Soft FM",
  "HVAC Maintenance",
  "MEP Maintenance",
  "Cleaning Services",
  "Landscaping",
  "Pest Control",
  "Security Services",
  "Waste Management",
  "AMC",
];

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
      text: `Tender created: ${result.tender.name}. ${extracted} file(s) extracted for AI workspace.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-md border border-[#1E293B] bg-[#0B1020] px-3 py-2 text-sm text-[#94A3B8]">
        Tender uploads use your signed-in organization automatically.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="tenderName" placeholder="Tender Name" required className="field" />
        <input name="clientName" placeholder="Client Name" required className="field" />
        <input name="country" placeholder="Country" className="field" />
        <input name="location" placeholder="Location" className="field" />
        <select name="tenderCategory" className="field">
          <option value="">Tender Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input name="submissionDeadline" type="date" className="field" />
        <input name="contractDuration" placeholder="Contract Duration" className="field" />
        <input name="estimatedValue" type="number" min="0" step="0.01" placeholder="Estimated Value" className="field" />
      </div>

      <label className="block rounded-md border border-dashed border-[#3B82F6]/60 bg-[#0B1020] p-6 text-center">
        <UploadCloud className="mx-auto h-8 w-8 text-[#3B82F6]" />
        <span className="mt-3 block text-sm font-medium">Upload real tender documents</span>
        <span className="mt-1 block text-xs text-[#94A3B8]">
          PDF, DOCX, XLSX, CSV, ZIP, images, BOQ, asset registers, drawings, and addendums
        </span>
        <input name="files" type="file" multiple required className="mt-4 text-sm" />
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
        {submitting ? "Saving tender..." : "Create Tender Record"}
      </button>
    </form>
  );
}
