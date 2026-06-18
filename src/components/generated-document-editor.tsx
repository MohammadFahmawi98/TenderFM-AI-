"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewStatus } from "@prisma/client";

type Section = {
  heading: string;
  body: string;
  source?: string;
};

type GeneratedContent = {
  generator?: string;
  generatedAt?: string;
  sections?: Section[];
};

export function GeneratedDocumentEditor({
  file,
}: {
  file: {
    id: string;
    title: string | null;
    fileName: string;
    content: unknown;
    reviewStatus: ReviewStatus;
    lockedAt: Date | null;
  };
}) {
  const router = useRouter();
  const parsed = parseContent(file.content);
  const [title, setTitle] = useState(file.title ?? file.fileName);
  const [body, setBody] = useState(() => renderSections(parsed.sections));
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isLocked = Boolean(file.lockedAt);
  const wordCount = useMemo(() => body.split(/\s+/).filter(Boolean).length, [body]);

  async function updateDocument(payload: {
    title?: string;
    content?: GeneratedContent;
    reviewStatus?: ReviewStatus;
    changeSummary?: string;
  }) {
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/generated-files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generatedFileId: file.id,
        ...payload,
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Document update failed.");
      return;
    }

    setMessage("Saved");
    router.refresh();
  }

  return (
    <div className="min-h-72 rounded-lg border border-[#162033] bg-[#050816] p-5">
      <div className="flex flex-col gap-3 border-b border-[#162033] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">Inline Editor</p>
          <p className="mt-1 text-xs text-[#64748B]">
            {parsed.generator ?? "Generated document"} - {wordCount} words
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "FINAL"] as ReviewStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              disabled={saving || (isLocked && status !== "FINAL")}
              onClick={() => updateDocument({ reviewStatus: status })}
              className="rounded-md border border-[#1E293B] px-3 py-2 text-xs font-semibold text-[#F8FAFC] disabled:opacity-50"
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isLocked}
          className="field h-10 text-sm"
          aria-label="Document title"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isLocked}
          className="field min-h-72 resize-y text-sm leading-6"
          aria-label="Document body"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-[#94A3B8]">
          {isLocked ? "Final document is locked." : "Edits create a new saved version."} {message}
        </div>
        <button
          type="button"
          disabled={saving || isLocked}
          onClick={() =>
            updateDocument({
              title,
              content: {
                ...parsed,
                sections: parseBody(body),
              },
              changeSummary: "Manual document editor update.",
            })
          }
          className="h-9 rounded-md bg-[#3B82F6] px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save New Version"}
        </button>
      </div>
    </div>
  );
}

function parseContent(content: unknown): GeneratedContent {
  if (content && typeof content === "object") {
    const value = content as GeneratedContent;
    return {
      generator: value.generator,
      generatedAt: value.generatedAt,
      sections: Array.isArray(value.sections) ? value.sections : [],
    };
  }

  return { sections: [] };
}

function renderSections(sections: Section[] = []) {
  return sections.map((section) => `## ${section.heading}\n${section.body}${section.source ? `\n\n${section.source}` : ""}`).join("\n\n");
}

function parseBody(body: string): Section[] {
  const parts = body
    .split(/\n(?=## )/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return [{ heading: "Document", body }];
  }

  return parts.map((part) => {
    const [firstLine, ...rest] = part.split("\n");
    return {
      heading: firstLine.replace(/^##\s*/, "").trim() || "Section",
      body: rest.join("\n").trim(),
    };
  });
}
