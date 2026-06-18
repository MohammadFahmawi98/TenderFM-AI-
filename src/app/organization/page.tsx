import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { CompanyKnowledgeUploadForm } from "@/components/company-knowledge-upload-form";
import { Card, PageSection } from "@/components/ui";
import { StatusChip, ToolbarButton, ViewsBar, WorkspaceHeader } from "@/components/workspace-chrome";
import { getOrganizationMemory } from "@/lib/platform";

export default async function OrganizationPage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const memory = await getOrganizationMemory(organizationId);
  const files = memory?.files ?? [];

  return (
    <AppShell>
      <PageSection>
        <WorkspaceHeader
          eyebrow="Organization"
          title="Company bid capability profile"
          subtitle="Manage company identity, certifications, roles, team access, and FM capability data used by the AI bid department."
          actions={
            <>
              <ToolbarButton href="/knowledge">Knowledge Hub</ToolbarButton>
              <ToolbarButton href="/settings">Settings</ToolbarButton>
            </>
          }
          meta={[
            { label: "Company Files", value: files.length, tone: "blue" },
            { label: "Indexed Chunks", value: files.reduce((total, file) => total + file.knowledgeChunks.length, 0), tone: "green" },
            { label: "Categories", value: memory?.chunksBySource.length ?? 0, tone: "amber" },
          ]}
        />
        <ViewsBar
          views={[
            { label: "Profile", href: "#profile", active: true },
            { label: "Memory", href: "#memory", count: files.length },
            { label: "Settings", href: "/settings" },
          ]}
          right={<StatusChip tone="green">Tenant memory</StatusChip>}
        />

        <section id="profile" className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="bg-[#0B1220]">
            <CompanyKnowledgeUploadForm />
          </Card>

          <Card className="bg-[#0B1220]">
            <h3 className="text-lg font-semibold">Memory Coverage</h3>
            <div className="mt-4 space-y-2">
              {[
                ["Company files", files.length],
                ["Indexed chunks", files.reduce((total, file) => total + file.knowledgeChunks.length, 0)],
                ["Memory categories", memory?.chunksBySource.length ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-[#162033] bg-[#050816] px-3 py-2">
                  <span className="text-sm text-[#94A3B8]">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card id="memory" className="bg-[#0B1220]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Organization Memory</p>
              <h3 className="mt-2 text-xl font-semibold">Uploaded company evidence</h3>
            </div>
            <p className="text-sm text-[#94A3B8]">{files.length} file{files.length === 1 ? "" : "s"}</p>
          </div>

          {files.length === 0 ? (
            <p className="mt-5 rounded-md border border-[#162033] bg-[#050816] p-4 text-sm text-[#94A3B8]">
              Upload company profile, certifications, HSE manuals, references, staff CVs, equipment lists, SOPs, and pricing libraries to
              strengthen generated tender documents.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {files.map((file) => (
                <div key={file.id} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{file.displayName ?? file.fileName}</p>
                      <p className="mt-1 text-xs text-[#94A3B8]">{file.fileName}</p>
                    </div>
                    <span className="rounded border border-[#1E293B] px-2 py-1 text-[10px] text-[#94A3B8]">{file.extractionStatus}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#94A3B8]">
                    {file.knowledgeChunks.length} indexed chunk{file.knowledgeChunks.length === 1 ? "" : "s"} - uploaded{" "}
                    {file.uploadedAt.toLocaleDateString()}
                  </p>
                  {file.description ? <p className="mt-2 text-xs leading-5 text-[#64748B]">{file.description}</p> : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
