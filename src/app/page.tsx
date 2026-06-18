import Link from "next/link";
import { AgentActivityGrid } from "@/components/agent-activity-grid";
import { AppShell } from "@/components/app-shell";
import { PageSection } from "@/components/ui";
import { tenderAgents } from "@/lib/agents";
import { commandItems } from "@/lib/navigation";

const supportedFiles = ["PDF", "DOCX", "XLSX", "PPTX", "ZIP", "BOQ", "Contracts", "Drawings", "Specifications", "Images", "Appendices"];

export default function HomePage() {
  return (
    <AppShell>
      <PageSection className="min-h-[calc(100vh-80px)] py-8 md:py-12">
        <section className="mx-auto grid w-full max-w-7xl gap-10 xl:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#00E5FF]">AI Command Center</p>
            <h2 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Upload an RFP. Generate a Complete FM Tender Package.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#94A3B8]">
              TenderFlow reads the tender, activates specialized AI agents, analyzes requirements, and prepares submission-ready deliverables.
            </p>

            <Link
              href="/tenders/new"
              className="mt-10 flex min-h-[42vh] flex-col justify-between rounded-2xl border border-dashed border-[#3B82F6]/70 bg-[#0B1220] p-6 text-left shadow-2xl transition hover:border-[#00E5FF] hover:bg-[#111827]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Primary Upload Area</p>
                <h3 className="mt-4 text-3xl font-semibold">Drop RFP files here</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">
                  Multi-file upload is ready. Folder upload and drag-and-drop are staged for the browser upload layer.
                </p>
              </div>
              <div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {supportedFiles.map((item) => (
                    <span key={item} className="rounded-md border border-white/[0.06] bg-[#050816] px-3 py-2 text-xs text-[#F8FAFC]">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 inline-flex rounded-md bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white">Upload RFP</div>
              </div>
            </Link>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-[#0B1220] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Command System</p>
              <div className="mt-5 space-y-2">
                {commandItems.map((item) => (
                  <Link
                    key={item}
                    href={item === "Analyze Tender" ? "/tenders/new" : item === "Open Workspace" ? "/workspaces" : "/documents"}
                    className="block rounded-md border border-white/[0.06] bg-[#050816] px-3 py-3 text-sm text-[#F8FAFC] transition hover:border-[#00E5FF]/50"
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-xs text-[#94A3B8]">Use CTRL + K from anywhere to open commands.</p>
            </div>
          </aside>
        </section>

        <section className="mx-auto mt-12 w-full max-w-7xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">AI Bid Department</p>
              <h3 className="mt-2 text-2xl font-semibold">Specialized FM agents working together</h3>
            </div>
            <Link href="/workspace" className="text-sm font-semibold text-[#3B82F6]">
              View active workspace
            </Link>
          </div>
          <AgentActivityGrid agents={tenderAgents} />
        </section>
      </PageSection>
    </AppShell>
  );
}
