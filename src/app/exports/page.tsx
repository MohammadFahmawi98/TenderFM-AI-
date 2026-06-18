import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { SubmissionExportActions } from "@/components/submission-export-actions";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { StatusChip, ToolbarButton, ViewsBar, WorkspaceHeader } from "@/components/workspace-chrome";
import { getExportGate, getRequiredExportKinds } from "@/lib/export-generation";
import { getExportCenter } from "@/lib/platform";
import { calculateSubmissionReadiness } from "@/lib/readiness";

export default async function ExportCenterPage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const tender = await getExportCenter(organizationId);
  const readiness = tender ? calculateSubmissionReadiness(tender) : null;
  const generatedFiles = tender?.generatedFiles ?? [];
  const exportGate = getExportGate(generatedFiles);
  const requiredKinds = getRequiredExportKinds();
  const packages = generatedFiles.filter((file) => file.kind === "SUBMISSION_PACKAGE");
  const documents = generatedFiles.filter((file) => file.kind !== "SUBMISSION_PACKAGE");

  return (
    <AppShell>
      <PageSection>
        <WorkspaceHeader
          eyebrow="Export Center"
          title="Submission package control"
          subtitle="Lock approved tender documents into a final ZIP package with a manifest, readiness checklist, and audit trail."
          actions={
            <>
              <ToolbarButton href="/documents">Documents</ToolbarButton>
              <ToolbarButton href="/workspace">Workspace</ToolbarButton>
            </>
          }
          meta={
            tender
              ? [
                  { label: "Readiness", value: `${readiness?.score ?? 0}%`, tone: "green" },
                  { label: "Required Open", value: exportGate.missingRequiredKinds.length, tone: exportGate.canExport ? "green" : "amber" },
                  { label: "Packages", value: packages.length, tone: "blue" },
                  { label: "Documents", value: documents.length },
                ]
              : undefined
          }
        />

        {!tender ? (
          <Card className="bg-[#0B1220]">
            <EmptyState
              title="No tender workspace found"
              body="Upload an RFP and generate documents before exporting a submission package."
              action={
                <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <ViewsBar
              views={[
                { label: "Gate", href: "#gate", active: true },
                { label: "Checklist", href: "#checklist", count: requiredKinds.length },
                { label: "Packages", href: "#packages", count: packages.length },
                { label: "Documents", href: "/documents", count: documents.length },
              ]}
              right={<StatusChip tone={exportGate.canExport ? "green" : "amber"}>{exportGate.canExport ? "Ready to export" : "Approvals needed"}</StatusChip>}
            />
            <section className="grid gap-3 md:grid-cols-5">
              {[
                ["Readiness", `${readiness?.score ?? 0}%`],
                ["Compliance", `${readiness?.compliance ?? 0}%`],
                ["Technical", `${readiness?.technicalProposal ?? 0}%`],
                ["Commercial", `${readiness?.commercialProposal ?? 0}%`],
                ["Approvals", `${readiness?.approvals ?? 0}%`],
              ].map(([label, value]) => (
                <Card key={label} className="bg-[#0B1220]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">{label}</p>
                  <p className="mt-3 text-2xl font-semibold">{value}</p>
                </Card>
              ))}
            </section>

            <Card id="gate" className="bg-[#0B1220]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Active Tender</p>
                  <h3 className="mt-2 text-2xl font-semibold">{tender.name}</h3>
                  <p className="mt-1 text-sm text-[#94A3B8]">{tender.clientName}</p>
                </div>
                <div className="rounded-md border border-[#162033] bg-[#050816] px-3 py-2 text-sm text-[#94A3B8]">
                  {documents.length} generated document{documents.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="mt-5">
                <SubmissionExportActions
                  tenderId={tender.id}
                  canExport={exportGate.canExport}
                  missingRequiredKinds={[...exportGate.missingRequiredKinds]}
                />
              </div>
            </Card>

            <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
              <Card id="checklist" className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Required Package Checklist</h3>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {requiredKinds.map((kind) => {
                    const file = documents.find((document) => document.kind === kind && ["APPROVED", "FINAL"].includes(document.reviewStatus));
                    return (
                      <div key={kind} className="rounded-md border border-[#162033] bg-[#050816] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{kind.replaceAll("_", " ")}</p>
                            <p className="mt-1 text-xs text-[#94A3B8]">
                              {file ? `${file.reviewStatus} - v${file.version}` : "Missing approved/final document"}
                            </p>
                          </div>
                          <span className={`rounded px-2 py-1 text-xs ${file ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#F59E0B]/15 text-[#F59E0B]"}`}>
                            {file ? "READY" : "OPEN"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card id="packages" className="bg-[#0B1220]">
                <h3 className="text-lg font-semibold">Exported Packages</h3>
                <div className="mt-4 space-y-3">
                  {packages.length === 0 ? (
                    <p className="text-sm leading-6 text-[#94A3B8]">No final ZIP package has been exported yet.</p>
                  ) : (
                    packages.map((file) => (
                      <div key={file.id} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                        <p className="text-sm font-medium">{file.title ?? file.fileName}</p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {file.reviewStatus} - v{file.version} - {file.createdAt.toLocaleString()}
                        </p>
                        <a
                          href={`/api/exports/${file.id}/download`}
                          className="mt-3 inline-flex rounded-md border border-[#1E293B] px-3 py-2 text-xs font-semibold text-[#F8FAFC]"
                        >
                          Download ZIP
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>
          </>
        )}
      </PageSection>
    </AppShell>
  );
}
