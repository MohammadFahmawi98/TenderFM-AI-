"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkspaceTaskForm({
  tenderId,
  users,
  files,
}: {
  tenderId: string;
  users: Array<{ id: string; firstName: string; lastName: string }>;
  files: Array<{ id: string; fileName: string; displayName: string | null }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/workspace-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenderId,
        title: formData.get("title"),
        description: formData.get("description"),
        assigneeId: formData.get("assigneeId") || undefined,
        dueDate: formData.get("dueDate") || undefined,
        priority: formData.get("priority"),
        status: "TODO",
        relatedFileId: formData.get("relatedFileId") || undefined,
        relatedAgent: formData.get("relatedAgent") || undefined,
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Could not create task.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Task created");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-[#162033] bg-[#050816] p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Assign Tender Task</p>
        <p className="mt-1 text-xs text-[#94A3B8]">Tasks stay attached to this tender workspace.</p>
      </div>
      <input name="title" required className="field h-10 text-sm" placeholder="Task title" />
      <textarea name="description" className="field min-h-20 resize-none text-sm" placeholder="Description" />
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="assigneeId" className="field h-10 text-sm">
          <option value="">Assignee</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        <input name="dueDate" type="date" className="field h-10 text-sm" />
        <select name="priority" defaultValue="MEDIUM" className="field h-10 text-sm">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select name="relatedFileId" className="field h-10 text-sm">
          <option value="">Related file</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.displayName ?? file.fileName}
            </option>
          ))}
        </select>
      </div>
      <input name="relatedAgent" className="field h-10 text-sm" placeholder="Related AI agent" />
      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-9 rounded-md bg-[#3B82F6] px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create task"}
        </button>
        {message ? <p className="text-xs text-[#94A3B8]">{message}</p> : null}
      </div>
    </form>
  );
}
