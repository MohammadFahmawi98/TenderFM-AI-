import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
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

  return (
    <AppShell>
      <PageSection>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">AI Workspace</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Your bid department workspace</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
              Tender documents, conversation, agents, progress, and deliverables live in one workspace after upload.
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
              body="Upload the first RFP and TenderFlow will create the workspace from real extracted source documents."
              action={
                <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <section className="grid gap-4 xl:grid-cols-[300px_1fr_340px]">
          <Card className="bg-[#0B1220]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]">Tender Sources</p>
            <h3 className="mt-2 text-lg font-semibold">{tender.name}</h3>
            <p className="mt-1 text-sm text-[#94A3B8]">{tender.clientName}</p>
            <div className="mt-5 space-y-3">
              {tender.files.map((file) => (
                <div key={file.id} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-medium">{file.fileName}</p>
                    <span className="shrink-0 rounded border border-[#1E293B] px-2 py-1 text-[10px] text-[#94A3B8]">
                      {file.extractionStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#94A3B8]">
                    {(file.sizeBytes / 1024).toFixed(1)} KB · {file.chunks.length} chunk{file.chunks.length === 1 ? "" : "s"}
                  </p>
                  {file.extractionError ? (
                    <p className="mt-2 text-xs leading-5 text-[#F59E0B]">{file.extractionError}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md border border-[#162033] bg-[#050816] p-3 text-sm text-[#94A3B8]">
              {extractedFiles.length} of {tender.files.length} files extracted into source memory.
            </div>
          </Card>

          <Card className="min-h-[560px] bg-[#0B1220]">
            <div className="border-b border-[#162033] pb-4">
              <h3 className="text-lg font-semibold">Conversation Workspace</h3>
              <p className="mt-1 text-sm text-[#94A3B8]">
                {chunkCount} source chunk{chunkCount === 1 ? "" : "s"} are ready for agent review.
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
                      <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">{file.fileName}</p>
                      <span className="text-xs text-[#00E5FF]">Chunk {chunk.chunkIndex + 1}</span>
                    </div>
                    <p className="mt-3 line-clamp-5 text-sm leading-6 text-[#CBD5E1]">{chunk.content}</p>
                  </div>
                )),
              )}
            </div>
            <div className="rounded-lg border border-[#162033] bg-[#050816] p-3">
              <input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-[#64748B]" placeholder="Ask about qualification, compliance, manpower, risk, pricing..." />
            </div>
          </Card>

          <Card className="bg-[#0B1220]">
            <h3 className="text-lg font-semibold">Agent Orchestration</h3>
            <div className="mt-5 space-y-2">
              {agents.map(([agent, mode]) => (
                <div key={agent} className="flex items-center justify-between gap-3 rounded-md border border-[#162033] bg-[#050816] p-3">
                  <span className="text-sm">{agent}</span>
                  <span className="text-xs text-[#94A3B8]">
                    {chunkCount === 0 ? "Waiting" : mode === "waiting" ? "Queued" : "Ready"}
                  </span>
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
            </div>
          </Card>
          </section>
        )}

        <Card className="bg-[#0B1220]">
          <h3 className="text-lg font-semibold">Generated Deliverables</h3>
          {tender && tender.generatedFiles.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tender.generatedFiles.map((file) => (
                <div key={file.id} className="rounded-md border border-[#162033] bg-[#050816] p-4 text-sm text-[#F8FAFC]">
                  <p className="font-medium">{file.fileName}</p>
                  <p className="mt-2 text-xs text-[#94A3B8]">{file.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#94A3B8]">
              No generated outputs yet. Document generation starts after the next AI agent build step.
            </p>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
