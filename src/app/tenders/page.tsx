import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageSection } from "@/components/ui";
import { getRecentTenders } from "@/lib/platform";

export default async function TendersPage() {
  const tenders = await getRecentTenders();

  return (
    <AppShell>
      <PageSection>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Tenders</h2>
            <p className="text-sm text-[#94A3B8]">Tender records are loaded from PostgreSQL only.</p>
          </div>
          <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold">
            Upload Tender
          </Link>
        </div>
        <Card className="p-0">
          {tenders.length === 0 ? (
            <EmptyState
              title="No tenders found"
              body="Create the first tender from uploaded RFP documents. The platform will not show demo tenders."
            />
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {tenders.map((tender) => (
                <div key={tender.id} className="grid gap-2 p-5 md:grid-cols-[1fr_180px_160px]">
                  <div>
                    <p className="font-medium">{tender.name}</p>
                    <p className="text-sm text-[#94A3B8]">
                      {tender.clientName} · {tender.files.length} file{tender.files.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p>{tender.status}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {tender.files.filter((file) => file.extractionStatus === "COMPLETED").length} extracted
                    </p>
                  </div>
                  <p className="text-sm text-[#94A3B8]">
                    {tender.submissionDeadline?.toLocaleDateString() ?? "No deadline"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
