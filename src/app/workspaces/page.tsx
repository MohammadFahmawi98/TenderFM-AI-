import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { getTenderWorkspaces } from "@/lib/platform";

function readinessFor(workspace: Awaited<ReturnType<typeof getTenderWorkspaces>>[number]) {
  const hasFiles = workspace.files.length > 0;
  const extracted = workspace.files.some((file) => file.extractionStatus === "COMPLETED");
  const hasApprovedDocument = workspace.generatedFiles.some((file) => file.reviewStatus === "APPROVED" || file.reviewStatus === "FINAL");
  const taskDone = workspace.workspaceTasks.some((task) => task.status === "COMPLETED" || task.status === "APPROVED");
  return Math.round(([hasFiles, extracted, hasApprovedDocument, taskDone].filter(Boolean).length / 4) * 100);
}

export default async function WorkspacesPage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const workspaces = await getTenderWorkspaces(organizationId);

  return (
    <AppShell>
      <PageSection>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Workspaces</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Tender workspaces</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
              Each uploaded RFP becomes a focused FM tender workspace with agents, requirements, documents, team review, and export readiness.
            </p>
          </div>
          <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
            Upload RFP
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <Card className="bg-[#0B1220]">
            <EmptyState
              title="No tender workspaces yet"
              body="Upload an RFP to create the first workspace. TenderFlow will read the documents and activate the bid agents."
              action={
                <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {workspaces.map((workspace) => {
              const readiness = readinessFor(workspace);
              return (
                <Link key={workspace.id} href="/workspace" className="block">
                  <Card className="h-full bg-[#0B1220] transition hover:border-[#00E5FF]/40">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#00E5FF]">{workspace.clientName}</p>
                        <h3 className="mt-2 text-2xl font-semibold">{workspace.name}</h3>
                        <p className="mt-2 text-sm text-[#94A3B8]">
                          {workspace.submissionDeadline?.toLocaleDateString() ?? "No deadline"} - {workspace.currency}{" "}
                          {workspace.estimatedValue ? Number(workspace.estimatedValue).toLocaleString() : "Value pending"}
                        </p>
                      </div>
                      <div className="rounded-md border border-white/[0.06] bg-[#050816] px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8]">Readiness</p>
                        <p className="mt-1 text-xl font-semibold text-[#10B981]">{readiness}%</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-2 sm:grid-cols-4">
                      <div className="rounded-md bg-[#050816] p-3">
                        <p className="text-xs text-[#94A3B8]">Files</p>
                        <p className="mt-1 text-lg font-semibold">{workspace.files.length}</p>
                      </div>
                      <div className="rounded-md bg-[#050816] p-3">
                        <p className="text-xs text-[#94A3B8]">Documents</p>
                        <p className="mt-1 text-lg font-semibold">{workspace.generatedFiles.length}</p>
                      </div>
                      <div className="rounded-md bg-[#050816] p-3">
                        <p className="text-xs text-[#94A3B8]">Tasks</p>
                        <p className="mt-1 text-lg font-semibold">{workspace.workspaceTasks.length}</p>
                      </div>
                      <div className="rounded-md bg-[#050816] p-3">
                        <p className="text-xs text-[#94A3B8]">Win</p>
                        <p className="mt-1 text-lg font-semibold">{workspace.analysis?.winProbability ?? "-"}%</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </section>
        )}
      </PageSection>
    </AppShell>
  );
}
