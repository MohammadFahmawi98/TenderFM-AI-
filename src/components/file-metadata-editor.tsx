"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  ["RFP_MAIN_DOCUMENT", "RFP Main Document"],
  ["BOQ", "BOQ"],
  ["TECHNICAL_SPECIFICATION", "Technical Specification"],
  ["CONTRACT_CONDITIONS", "Contract Conditions"],
  ["DRAWINGS", "Drawings"],
  ["APPENDICES", "Appendices"],
  ["COMPLIANCE_DOCUMENTS", "Compliance Documents"],
  ["PRICING_DOCUMENTS", "Pricing Documents"],
  ["CLIENT_FORMS", "Client Forms"],
  ["OTHER", "Other"],
] as const;

export function FileMetadataEditor({
  file,
}: {
  file: {
    id: string;
    fileName: string;
    displayName: string | null;
    description: string | null;
    category: string;
    isImportant: boolean;
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/tender-files/${file.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: formData.get("displayName"),
        description: formData.get("description"),
        category: formData.get("category"),
        isImportant: formData.get("isImportant") === "on",
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Could not save file metadata.");
      return;
    }

    setMessage("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-md border border-[#162033] bg-[#070B14] p-3">
      <input
        name="displayName"
        defaultValue={file.displayName ?? file.fileName}
        className="field h-9 text-xs"
        placeholder="Display name"
      />
      <select name="category" defaultValue={file.category} className="field h-9 text-xs">
        {categories.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        defaultValue={file.description ?? ""}
        className="field min-h-16 resize-none text-xs"
        placeholder="Description for the bid team"
      />
      <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
        <input name="isImportant" type="checkbox" defaultChecked={file.isImportant} />
        Mark as important
      </label>
      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-8 rounded-md bg-[#3B82F6] px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save metadata"}
        </button>
        {message ? <p className="text-xs text-[#94A3B8]">{message}</p> : null}
      </div>
    </form>
  );
}
