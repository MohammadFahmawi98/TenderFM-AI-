import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageSection } from "@/components/ui";
import { commandItems } from "@/lib/navigation";

const flow = [
  "UPLOAD RFP",
  "AI UNDERSTANDS TENDER",
  "AGENTS COLLABORATE",
  "DOCUMENTS GENERATED",
  "EXECUTIVE REVIEW",
  "EXPORT PACKAGE",
];

export default function HomePage() {
  return (
    <AppShell>
      <PageSection className="flex min-h-[calc(100vh-80px)] flex-col justify-center py-10 md:py-14">
        <section className="mx-auto w-full max-w-5xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#00E5FF]">Good Morning</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            What would you like your AI bid department to create today?
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Upload an RFP and TenderFlow will read the tender, coordinate specialized FM agents, and prepare the bid package.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-[#1E293B] bg-[#0B1220] p-3 text-left shadow-2xl">
            <textarea
              className="min-h-28 w-full resize-none bg-transparent p-4 text-base leading-7 text-white outline-none placeholder:text-[#64748B]"
              placeholder="Ask TenderFlow to analyze a tender, generate a proposal, create a manpower plan, or build an executive presentation..."
            />
            <div className="flex flex-col gap-3 border-t border-[#1E293B] p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#94A3B8]">Primary flow: upload RFP, then AI agents start working.</p>
              <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                Upload RFP
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-6 grid max-w-4xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {commandItems.slice(0, 6).map((item) => (
              <Link
                key={item}
                href={item === "Analyze Uploaded Tender" ? "/tenders/new" : "/workspace"}
                className="rounded-lg border border-[#162033] bg-[#0B1220] px-4 py-3 text-left text-sm text-[#F8FAFC] transition hover:border-[#00E5FF]/50 hover:bg-[#111827]"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 w-full max-w-6xl rounded-xl border border-[#162033] bg-[#0B1220] p-5">
          <div className="grid gap-px overflow-hidden rounded-lg border border-[#162033] bg-[#162033] lg:grid-cols-6">
            {flow.map((step, index) => (
              <div key={step} className="bg-[#050816] p-4">
                <p className="font-mono text-xs text-[#00E5FF]">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-sm font-semibold tracking-[0.08em]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </PageSection>
    </AppShell>
  );
}
