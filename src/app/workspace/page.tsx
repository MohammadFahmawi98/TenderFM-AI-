import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { DocumentCommentForm } from "@/components/document-comment-form";
import { FileMetadataEditor } from "@/components/file-metadata-editor";
import { WorkspaceTaskForm } from "@/components/workspace-task-form";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { getLatestWorkspaceTender } from "@/lib/platform";

const agents = [
  ["Tender Intelligence Agent", "analysis"],
  ["Qualification Agent", "review"],
  ["Compliance Agent", "compliance"],
  ["Technical Proposal Agent", "drafting"],
  ["Commercial Agent", "commercial"],
  ["Manpower Agent", "planning"],
  ["PPM Agent", "planning"],
  ["Risk Agent", "risk"],
  ["HSE Agent", "hse"],
  ["Presentation Agent", "waiting"],
  ["Executive Review Agent", "waiting"],
];

export default async function WorkspacePage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const tender = await getLatestWorkspaceTender(organizationId);
  const extractedFiles = tender?.files.filter((file) => file.extractionStatus === "COMPLETED") ?? [];
  const chunkCount = tender?.files.reduce((total, file) => total + file.chunks.length, 0) ?? 0;
  const approvedDocuments =
    tender?.generatedFiles.filter((file) => file.reviewStatus === "APPROVED" || file.reviewStatus === "FINAL").length ?? 0;
  const completedTasks =
    tender?.workspaceTasks.filter((task) => task.status === "COMPLETED" || task.status === "APPROVED").length ?? 0;
  const readinessItems = [Boolean(tender?.files.length), chunkCount > 0, completedTasks > 0, approvedDocuments > 0];
  const readiness = Math.round((readinessItems.filter(Boolean).length / readinessItems.length) * 100);

  return (
    <AppShell>
      <PageSection>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Team Workspace</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Collaborative tender submission workspace</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
              Upload RFP, AI agents generate, team reviews, final package export. Every action is tied to the live tender record.
            </p>
          </div>
          <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
            Upload RFP
          </Link>
        </div>

        {!tender ? (
          <Card className="bg-[#0B1220]">
            <EmptyState
              title="No active tender workspace yet"
              body="Upload the first RFP and TenderFlow will create a workspace for source files, tasks, comments, reviews, and exports."
              action={
                <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-[330px_1fr_360px]">
              <Card className="bg-[#0B1220]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]">Uploaded File Management</p>
                <h3 className="mt-2 text-lg font-semibold">{tender.name}</h3>
                <p className="mt-1 text-sm text-[#94A3B8]">{tender.clientName}</p>
                <div className="mt-5 space-y-3">
                  {tender.files.map((file) => (
                    <div key={file.id} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-words text-sm font-medium">{file.displayName ?? file.fileName}</p>
                        <span className="shrink-0 rounded border border-[#1E293B] px-2 py-1 text-[10px] text-[#94A3B8]">
                          {file.extractionStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#94A3B8]">
                        {(file.sizeBytes / 1024).toFixed(1)} KB - {file.category.replaceAll("_", " ")} - v{file.version}
                      </p>
                      {file.isImportant ? <p className="mt-2 text-xs font-semibold text-[#F59E0B]">Important source</p> : null}
                      {file.extractionError ? <p className="mt-2 text-xs leading-5 text-[#F59E0B]">{file.extractionError}</p> : null}
                      <FileMetadataEditor file={file} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-[#162033] bg-[#050816] p-3 text-sm text-[#94A3B8]">
                  {extractedFiles.length} of {tender.files.length} files extracted into source memory.
                </div>
              </Card>

              <Card className="min-h-[560px] bg-[#0B1220]">
                <div className="border-b border-[#162033] pb-4">
                  <h3 className="text-lg font-semibold">Tender Workspace</h3>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    {chunkCount} extracted requirement chunk{chunkCount === 1 ? "" : "s"} are ready for team review.
                  </p>
                </div>

                <div className="space-y-4 py-5">
                  <div className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Initial Analysis</p>
                    <p className="mt-3 text-sm leading-6 text-[#F8FAFC]">
                      {tender.analysis?.executiveSummary ?? "Analysis has not been generated yet."}
                    </p>
                  </div>

                  {tender.files.flatMap((file) =>
                    file.chunks.map((chunk) => (
                      <div key={chunk.id} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">{file.displayName ?? file.fileName}</p>
                          <span className="text-xs text-[#00E5FF]">Chunk {chunk.chunkIndex + 1}</span>
                        </div>
                        <p className="mt-3 line-clamp-5 text-sm leading-6 text-[#CBD5E1]">{chunk.content}</p>
                      </div>
                    )),
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="bg-[#050816]">
                      <h3 className="text-base font-semibold">Team Tasks</h3>
                      <div className="mt-4 space-y-3">
                        {tender.workspaceTasks.length === 0 ? (
                          <p className="text-sm text-[#94A3B8]">No tender tasks assigned yet.</p>
                        ) : (
                          tender.workspaceTasks.map((task) => (
                            <div key={task.id} className="rounded-md border border-[#162033] bg-[#070B14] p-3">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-medium">{task.title}</p>
                                <span className="rounded border border-[#1E293B] px-2 py-1 text-[10px] text-[#94A3B8]">
                                  {task.status.replaceAll("_", " ")}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[#94A3B8]">
                                {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"} - {task.priority}
                              </p>
                              {task.relatedFile ? (
                                <p className="mt-1 text-xs text-[#64748B]">File: {task.relatedFile.displayName ?? task.relatedFile.fileName}</p>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    <Card className="bg-[#050816]">
                      <h3 className="text-base font-semibold">Review Comments</h3>
                      <div className="mt-4 space-y-3">
                        {tender.documentComments.length === 0 ? (
                          <p className="text-sm text-[#94A3B8]">No comments yet.</p>
                        ) : (
                          tender.documentComments.map((comment) => (
                            <div key={comment.id} className="rounded-md border border-[#162033] bg-[#070B14] p-3">
                              <p className="text-sm leading-6">{comment.content}</p>
                              <p className="mt-2 text-xs text-[#94A3B8]">
                                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "Team"} -{" "}
                                {comment.tenderFile?.displayName ?? comment.tenderFile?.fileName ?? comment.generatedFile?.title ?? "Workspace"}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="rounded-lg border border-[#162033] bg-[#050816] p-3">
                  <input
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-[#64748B]"
                    placeholder="Ask about qualification, compliance, manpower, risk, pricing..."
                  />
                </div>
              </Card>

              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Agent Orchestration</h3>
                <div className="mt-5 space-y-2">
                  {agents.map(([agent, mode]) => (
                    <div key={agent} className="flex items-center justify-between gap-3 rounded-md border border-[#162033] bg-[#050816] p-3">
                      <span className="text-sm">{agent}</span>
                      <span className="text-xs text-[#94A3B8]">{chunkCount === 0 ? "Waiting" : mode === "waiting" ? "Queued" : "Ready"}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-md border border-[#162033] bg-[#050816] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Compliance Signals</p>
                    <p className="mt-2 text-2xl font-semibold">{tender.complianceItems.length}</p>
                  </div>
                  <div className="rounded-md border border-[#162033] bg-[#050816] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#F59E0B]">Risk Signals</p>
                    <p className="mt-2 text-2xl font-semibold">{tender.riskItems.length}</p>
                  </div>
                  <div className="rounded-md border border-[#162033] bg-[#050816] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#10B981]">Export Readiness</p>
                    <p className="mt-2 text-2xl font-semibold">{readiness}%</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">Checks source files, extraction, task progress, and approved documents.</p>
                  </div>
                </div>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Team Assignment System</h3>
                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                  <WorkspaceTaskForm tenderId={tender.id} users={tender.organization.users} files={tender.files} />
                  <DocumentCommentForm tenderId={tender.id} label="Add workspace review comment" />
                </div>
              </Card>

              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Activity Feed</h3>
                <div className="mt-4 space-y-3">
                  {tender.activityEvents.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">Activity appears as the team edits, assigns, reviews, and approves work.</p>
                  ) : (
                    tender.activityEvents.map((event) => (
                      <div key={event.id} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                        <p className="text-sm leading-6">{event.message}</p>
                        <p className="mt-2 text-xs text-[#94A3B8]">{event.createdAt.toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>
          </>
        )}

        <Card className="bg-[#0B1220]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Generated Deliverables</h3>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Review status, versions, comments, and final lock state live with each generated document.
              </p>
            </div>
            <Link href="/documents" className="rounded-md border border-[#1E293B] px-3 py-2 text-sm font-semibold text-[#F8FAFC]">
              Open Documents
            </Link>
          </div>
          {tender && tender.generatedFiles.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tender.generatedFiles.map((file) => (
                <div key={file.id} className="rounded-md border border-[#162033] bg-[#050816] p-4 text-sm text-[#F8FAFC]">
                  <p className="font-medium">{file.title ?? file.fileName}</p>
                  <p className="mt-2 text-xs text-[#94A3B8]">
                    {file.kind.replaceAll("_", " ")} - {file.reviewStatus.replaceAll("_", " ")} - v{file.version}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#94A3B8]">No generated outputs yet. Document generation starts after the AI agent build step.</p>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
