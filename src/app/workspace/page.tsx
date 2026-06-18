import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";

const agents = [
  "Tender Intelligence Agent",
  "Qualification Agent",
  "Compliance Agent",
  "Technical Proposal Agent",
  "Commercial Agent",
  "Manpower Agent",
  "PPM Agent",
  "Risk Agent",
  "HSE Agent",
  "Presentation Agent",
  "Executive Review Agent",
];

const deliverables = [
  "Executive Summary",
  "Qualification Matrix",
  "Compliance Matrix",
  "Technical Proposal",
  "Commercial Submission",
  "Manpower Plan",
  "PPM Schedule",
  "Risk Register",
  "Executive Deck",
  "Submission Package",
];

export default function WorkspacePage() {
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

        <section className="grid gap-4 xl:grid-cols-[280px_1fr_320px]">
          <Card className="bg-[#0B1220]">
            <h3 className="text-lg font-semibold">Tender Sources</h3>
            <div className="mt-5 space-y-3">
              {["Tender Documents", "Knowledge Sources", "Generated Files"].map((item) => (
                <div key={item} className="rounded-md border border-[#162033] bg-[#050816] p-3 text-sm text-[#94A3B8]">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-[#94A3B8]">Upload a real RFP to populate source files and extracted knowledge.</p>
          </Card>

          <Card className="min-h-[560px] bg-[#0B1220]">
            <div className="border-b border-[#162033] pb-4">
              <h3 className="text-lg font-semibold">Conversation Workspace</h3>
              <p className="mt-1 text-sm text-[#94A3B8]">Ask questions with source page references and confidence scores.</p>
            </div>
            <div className="flex min-h-[380px] items-center justify-center text-center">
              <div>
                <p className="text-2xl font-semibold">Upload a tender to activate agents</p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94A3B8]">
                  Once documents are uploaded, this center panel becomes the live AI collaboration output.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[#162033] bg-[#050816] p-3">
              <input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-[#64748B]" placeholder="Ask about qualification, compliance, manpower, risk, pricing..." />
            </div>
          </Card>

          <Card className="bg-[#0B1220]">
            <h3 className="text-lg font-semibold">Agent Orchestration</h3>
            <div className="mt-5 space-y-2">
              {agents.map((agent) => (
                <div key={agent} className="flex items-center justify-between rounded-md border border-[#162033] bg-[#050816] p-3">
                  <span className="text-sm">{agent}</span>
                  <span className="text-xs text-[#94A3B8]">Waiting</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="bg-[#0B1220]">
          <h3 className="text-lg font-semibold">Generated Deliverables</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {deliverables.map((item) => (
              <div key={item} className="rounded-md border border-[#162033] bg-[#050816] p-4 text-sm text-[#F8FAFC]">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </PageSection>
    </AppShell>
  );
}
