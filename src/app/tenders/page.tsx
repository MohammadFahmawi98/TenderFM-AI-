import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { getRecentTenders } from "@/lib/platform";

const statusColors: Record<string, string> = {
  DRAFT: "bg-[#94A3B8]/15 text-[#94A3B8]",
  UPLOADED: "bg-[#3B82F6]/15 text-[#3B82F6]",
  PROCESSING: "bg-[#3B82F6]/15 text-[#3B82F6]",
  ANALYZED: "bg-[#10B981]/15 text-[#10B981]",
  QUALIFIED: "bg-[#10B981]/15 text-[#10B981]",
  NO_GO: "bg-[#EF4444]/15 text-[#EF4444]",
  IN_ESTIMATION: "bg-[#F59E0B]/15 text-[#F59E0B]",
  IN_PROPOSAL: "bg-[#F59E0B]/15 text-[#F59E0B]",
  SUBMITTED: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  WON: "bg-[#10B981]/15 text-[#10B981]",
  LOST: "bg-[#EF4444]/15 text-[#EF4444]",
  ARCHIVED: "bg-[#94A3B8]/15 text-[#94A3B8]",
};

export default async function TendersPage() {
  const tenders = await getRecentTenders();

  return (
    <AppShell>
      <PageSection>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Tenders</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Each tender opens as a dedicated workspace with AI analysis and documents.
            </p>
          </div>
          <Link
            href="/tenders/new"
            className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
          >
            Upload RFP
          </Link>
        </div>

        {tenders.length === 0 ? (
          <Card className="bg-[#0B1220]">
            <EmptyState
              title="No tenders found"
              body="Upload an RFP to create your first tender workspace. AI agents will analyze requirements, risks, and compliance."
              action={
                <Link
                  href="/tenders/new"
                  className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
                >
                  Upload RFP
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tenders.map((tender) => (
              <Link key={tender.id} href={`/tenders/${tender.id}`} className="block">
                <Card className="h-full bg-[#0B1220] transition hover:border-[#3B82F6]/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{tender.name}</p>
                      <p className="mt-1 text-sm text-[#94A3B8]">{tender.clientName}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold uppercase ${
                        statusColors[tender.status] ?? statusColors.DRAFT
                      }`}
                    >
                      {tender.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-[#050816] p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                        Value
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {tender.estimatedValue
                          ? `${tender.currency} ${Number(tender.estimatedValue).toLocaleString()}`
                          : "Pending"}
                      </p>
                    </div>
                    <div className="rounded-md bg-[#050816] p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                        Deadline
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {tender.submissionDeadline?.toLocaleDateString() ?? "Not set"}
                      </p>
                    </div>
                    <div className="rounded-md bg-[#050816] p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                        Files
                      </p>
                      <p className="mt-1 text-sm font-semibold">{tender.files.length}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </AppShell>
  );
}
