import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { CompanyKnowledgeUploadForm } from "@/components/company-knowledge-upload-form";
import { Card, PageSection } from "@/components/ui";
import { getKnowledgeNetwork, getOrganizationMemory } from "@/lib/platform";

const documentMemory = [
  ["Technical Proposals", "TECHNICAL_PROPOSAL"],
  ["Commercial Proposals", "COMMERCIAL_PROPOSAL"],
  ["Compliance Matrices", "COMPLIANCE_MATRIX"],
  ["Manpower Plans", "MANPOWER_PLAN"],
  ["PPM Schedules", "PPM_SCHEDULE"],
  ["SLA Matrices", "SLA_MATRIX"],
  ["KPI Matrices", "KPI_MATRIX"],
  ["Risk Registers", "RISK_REGISTER"],
  ["HSE Plans", "HSE_PLAN"],
  ["Method Statements", "METHOD_STATEMENT"],
  ["Executive Summaries", "EXECUTIVE_SUMMARY"],
  ["Presentations", "POWERPOINT_PRESENTATION"],
] as const;

export default async function KnowledgePage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const [network, memory] = await Promise.all([getKnowledgeNetwork(organizationId), getOrganizationMemory(organizationId)]);
  const companyFiles = memory?.files ?? [];

  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Knowledge Hub</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">FM intelligence memory</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            TenderFlow uses this library to ground proposals, method statements, compliance, PPM, SLA, KPI, HSE, and executive outputs.
          </p>
        </div>
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["Tenders Learned", network?.tenders ?? 0],
            ["Source Files", network?.tenderFiles ?? 0],
            ["Indexed Chunks", (network?.chunks ?? 0) + (network?.companyKnowledgeChunks ?? 0)],
            ["Team Members", network?.users ?? 0],
          ].map(([label, value]) => (
            <Card key={label} className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </Card>
          ))}
        </section>
        <Card className="bg-[#0B1220]">
          <CompanyKnowledgeUploadForm />
        </Card>

        <Card className="bg-[#0B1220]">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Organization AI Memory</p>
              <h3 className="mt-2 text-xl font-semibold">Uploaded evidence and reusable knowledge</h3>
            </div>
            <p className="text-sm text-[#94A3B8]">{network?.companyKnowledgeChunks ?? 0} indexed chunk(s)</p>
          </div>
          {companyFiles.length === 0 ? (
            <p className="rounded-md border border-[#162033] bg-[#050816] p-4 text-sm text-[#94A3B8]">
              No company memory uploaded yet. Add company profile, certificates, references, SOPs, HSE manuals, staff CVs, equipment lists,
              and pricing libraries to ground future generated proposals.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {companyFiles.map((file) => (
                <div key={file.id} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                  <p className="text-sm font-semibold">{file.displayName ?? "Company Evidence"}</p>
                  <p className="mt-1 break-words text-xs text-[#94A3B8]">{file.fileName}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-[#64748B]">{file.extractionStatus}</span>
                    <span className="text-xs text-[#00E5FF]">{file.knowledgeChunks.length} chunks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-[#0B1220]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Document Knowledge Network</p>
            <h3 className="mt-2 text-xl font-semibold">Generated and reviewed tender memory</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {documentMemory.map(([label, kind]) => {
              const count = network?.generatedByKind[kind] ?? 0;
              return (
                <div key={kind} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{count}</p>
                  <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
                    {count > 0 ? "Available from real workspace outputs" : "Not uploaded or generated yet"}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-[#0B1220]">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Compliance Responses", network?.complianceItems ?? 0],
              ["Risk Patterns", network?.riskItems ?? 0],
              ["Supplier Records", network?.suppliers ?? 0],
              ["Company Evidence", network?.companyFiles ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
                <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
                  {Number(value) > 0 ? "Connected to organization memory" : "Not uploaded yet"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </PageSection>
    </AppShell>
  );
}
