"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DocumentCommentForm({
  tenderId,
  tenderFileId,
  generatedFileId,
  label = "Add review comment",
}: {
  tenderId: string;
  tenderFileId?: string;
  generatedFileId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/document-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenderId,
        tenderFileId,
        generatedFileId,
        content: formData.get("content"),
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Could not add comment.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Comment added");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-md border border-[#162033] bg-[#070B14] p-3">
      <p className="text-xs font-medium text-[#F8FAFC]">{label}</p>
      <textarea
        name="content"
        required
        className="field min-h-20 resize-none text-sm"
        placeholder="@reviewer add a change request, approval note, or source question"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-8 rounded-md bg-[#1E293B] px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Adding..." : "Comment"}
        </button>
        {message ? <p className="text-xs text-[#94A3B8]">{message}</p> : null}
      </div>
    </form>
  );
}
