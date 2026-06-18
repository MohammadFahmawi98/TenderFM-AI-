import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { DocumentCommentForm } from "@/components/document-comment-form";
import { DocumentGenerationActions } from "@/components/document-generation-actions";
import { GeneratedDocumentEditor } from "@/components/generated-document-editor";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { StatusChip, ToolbarButton, ViewsBar, WorkspaceHeader } from "@/components/workspace-chrome";
import { getDocumentLibrary } from "@/lib/platform";

const integrations = [
  "GOOGLE_DRIVE",
  "MICROSOFT_365",
  "GMAIL",
  "OUTLOOK",
  "SLACK",
  "MICROSOFT_TEAMS",
  "CALENDAR",
  "SUPABASE",
  "OPENAI",
];

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const library = await getDocumentLibrary(organizationId);
  const tender = library?.tender;
  const integrationMap = new Map<string, string>(library?.integrations.map((item) => [item.provider, item.status]) ?? []);

  return (
    <AppShell>
      <PageSection>
        <WorkspaceHeader
          eyebrow="Document Editor"
          title="Generated document review system"
          subtitle="Preview, edit, comment, version, approve, lock, and export generated tender documents."
          actions={
            <>
              <ToolbarButton href="/workspace">Workspace</ToolbarButton>
              <ToolbarButton href="/exports">Export Center</ToolbarButton>
            </>
          }
          meta={
            tender
              ? [
                  { label: "Tender", value: tender.name },
                  { label: "Generated", value: tender.generatedFiles.length, tone: "blue" },
                  { label: "Tasks", value: tender.workspaceTasks.length, tone: "amber" },
                  { label: "Client", value: tender.clientName },
                ]
              : undefined
          }
        />

        {!tender ? (
          <Card className="bg-[#0B1220]">
            <EmptyState
              title="No tender workspace found"
              body="Upload an RFP first. Generated documents and review workflows are attached to a tender workspace."
              action={
                <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <ViewsBar
                views={[
                  { label: "All", href: "#all-documents", active: true, count: tender.generatedFiles.length },
                  { label: "Drafts", href: "#all-documents", count: tender.generatedFiles.filter((file) => file.reviewStatus === "DRAFT").length },
                  { label: "Review", href: "#all-documents", count: tender.generatedFiles.filter((file) => file.reviewStatus === "IN_REVIEW").length },
                  { label: "Approved", href: "#all-documents", count: tender.generatedFiles.filter((file) => ["APPROVED", "FINAL"].includes(file.reviewStatus)).length },
                  { label: "Tasks", href: "#document-tasks", count: tender.workspaceTasks.length },
                ]}
                right={<StatusChip tone="blue">Document workspace</StatusChip>}
              />
              <Card id="document-tasks" className="bg-[#0B1220]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{tender.name}</h3>
                    <p className="mt-1 text-sm text-[#94A3B8]">{tender.clientName}</p>
                  </div>
                  <div className="rounded-md border border-[#162033] bg-[#050816] px-3 py-2 text-sm text-[#94A3B8]">
                    {tender.generatedFiles.length} generated document{tender.generatedFiles.length === 1 ? "" : "s"}
                  </div>
                </div>
              </Card>

              <Card className="bg-[#0B1220]">
                <DocumentGenerationActions tenderId={tender.id} />
              </Card>

              {tender.generatedFiles.length === 0 ? (
                <Card className="bg-[#0B1220]">
                  <EmptyState
                    title="No generated documents yet"
                    body="Generate one document or the full submission package from the extracted RFP source data."
                  />
                </Card>
              ) : (
                tender.generatedFiles.map((file) => (
                  <Card key={file.id} className="bg-[#0B1220]">
                    <div className="flex flex-col gap-3 border-b border-[#162033] pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">{file.kind.replaceAll("_", " ")}</p>
                        <h3 className="mt-2 text-xl font-semibold">{file.title ?? file.fileName}</h3>
                        <p className="mt-1 text-sm text-[#94A3B8]">
                          {file.type} - {file.reviewStatus.replaceAll("_", " ")} - v{file.version}
                        </p>
                      </div>
                      <div className="rounded-md border border-[#162033] bg-[#050816] px-3 py-2 text-xs text-[#94A3B8]">
                        {file.lockedAt ? `Locked ${file.lockedAt.toLocaleDateString()}` : "Editable"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
                      <GeneratedDocumentEditor file={file} />

                      <div className="space-y-3">
                        <div className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Reviewer</p>
                          <p className="mt-2 text-sm">
                            {file.reviewer ? `${file.reviewer.firstName} ${file.reviewer.lastName}` : "Not assigned"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">Version History</p>
                          <div className="mt-3 space-y-2">
                            {file.versions.length === 0 ? (
                              <p className="text-sm text-[#94A3B8]">No saved versions yet.</p>
                            ) : (
                              file.versions.map((version) => (
                                <div key={version.id} className="text-sm text-[#CBD5E1]">
                                  v{version.version} - {version.changeSummary ?? "Saved revision"}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <DocumentCommentForm tenderId={tender.id} generatedFileId={file.id} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <aside className="space-y-4">
              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Review Workflow</h3>
                <div className="mt-4 space-y-2">
                  {["Draft", "AI Generated", "In Review", "Changes Requested", "Approved", "Final"].map((status) => (
                    <div key={status} className="rounded-md border border-[#162033] bg-[#050816] p-3 text-sm text-[#94A3B8]">
                      {status}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Document Tasks</h3>
                <div className="mt-4 space-y-3">
                  {tender.workspaceTasks.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">No document review tasks yet.</p>
                  ) : (
                    tender.workspaceTasks.map((task) => (
                      <div key={task.id} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Integration Readiness</h3>
                <div className="mt-4 space-y-2">
                  {integrations.map((integration) => (
                    <div key={integration} className="flex items-center justify-between rounded-md border border-[#162033] bg-[#050816] p-3">
                      <span className="text-sm">{integration.replaceAll("_", " ")}</span>
                      <span className="text-xs text-[#94A3B8]">{integrationMap.get(integration) ?? "NOT CONNECTED"}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </aside>
          </section>
        )}
      </PageSection>
    </AppShell>
  );
}
