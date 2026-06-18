"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

const sourceTypes = [
  "Company Profile",
  "Trade License",
  "VAT Certificate",
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "HSE Manual",
  "Quality Manual",
  "Organization Chart",
  "Staff CVs",
  "Equipment List",
  "Project References",
  "Case Studies",
  "Method Statements",
  "SOPs",
  "Pricing Library",
  "Supplier Database",
];

export function CompanyKnowledgeUploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage(null);

    const form = event.currentTarget;
    const response = await fetch("/api/company-documents", {
      method: "POST",
      body: new FormData(form),
    });
    const result = await response.json();
    setUploading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Company knowledge upload failed.");
      return;
    }

    form.reset();
    const chunks = result.files.reduce((total: number, file: { knowledgeChunks: unknown[] }) => total + file.knowledgeChunks.length, 0);
    setMessage(`${result.files.length} file(s) uploaded and ${chunks} knowledge chunk(s) indexed.`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[#162033] bg-[#050816] p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Upload Organization Memory</p>
        <p className="mt-1 text-sm text-[#94A3B8]">These files are stored privately and reused across future tender generation.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select name="sourceType" className="field h-10 text-sm" defaultValue="Company Profile">
          {sourceTypes.map((sourceType) => (
            <option key={sourceType} value={sourceType}>
              {sourceType}
            </option>
          ))}
        </select>
        <input name="description" className="field h-10 text-sm" placeholder="Notes or expiry details" />
      </div>
      <label className="block rounded-md border border-dashed border-[#3B82F6]/60 bg-[#0B1020] p-5 text-center">
        <UploadCloud className="mx-auto h-8 w-8 text-[#3B82F6]" />
        <span className="mt-3 block text-sm font-medium">Upload company files</span>
        <span className="mt-1 block text-xs text-[#94A3B8]">PDF, DOCX, XLSX, CSV, PPTX, TXT, ZIP</span>
        <input name="files" type="file" multiple required className="mt-4 max-w-full text-sm" />
      </label>
      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="h-10 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {uploading ? "Indexing..." : "Upload and Index"}
        </button>
        {message ? <p className="text-xs text-[#94A3B8]">{message}</p> : null}
      </div>
    </form>
  );
}
