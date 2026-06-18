import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, DatabaseNotice, EmptyState, PageSection } from "@/components/ui";
import { getDashboardStats, getRecentTenders } from "@/lib/platform";

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

export default async function DashboardPage() {
  const [stats, recentTenders] = await Promise.all([getDashboardStats(), getRecentTenders()]);

  return (
    <AppShell>
      <PageSection>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Tender pipeline overview and key performance indicators.
            </p>
          </div>
          <Link
            href="/tenders/new"
            className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
          >
            Upload RFP
          </Link>
        </div>

        <DatabaseNotice ready={stats.databaseReady} />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Tenders", value: stats.activeTenders, color: "text-[#3B82F6]" },
            { label: "Qualified", value: stats.qualifiedTenders, color: "text-[#10B981]" },
            { label: "Submitted", value: stats.submittedTenders, color: "text-[#8B5CF6]" },
            { label: "Won", value: stats.wonTenders, color: "text-[#10B981]" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8]">{kpi.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${kpi.color}`}>{kpi.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Pipeline Value", value: stats.pipelineValue },
            { label: "Win Rate", value: stats.winRate },
            { label: "Upcoming Deadlines", value: stats.upcomingDeadlines },
            { label: "Estimated Revenue", value: stats.estimatedRevenue },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8]">{kpi.label}</p>
              <p className="mt-2 text-xl font-semibold">{kpi.value}</p>
            </Card>
          ))}
        </section>

        <Card className="bg-[#0B1220]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Tenders</h3>
            <Link href="/tenders" className="text-sm font-medium text-[#3B82F6]">
              View all
            </Link>
          </div>

          {recentTenders.length === 0 ? (
            <EmptyState
              title="No tenders yet"
              body="Upload your first RFP to start building your tender pipeline."
              action={
                <Link
                  href="/tenders/new"
                  className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
                >
                  Upload RFP
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {recentTenders.map((tender) => (
                <Link
                  key={tender.id}
                  href={`/tenders/${tender.id}`}
                  className="grid gap-2 p-4 transition hover:bg-[#111827] md:grid-cols-[1fr_160px_140px_120px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tender.name}</p>
                    <p className="mt-0.5 truncate text-sm text-[#94A3B8]">
                      {tender.clientName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase ${
                        statusColors[tender.status] ?? statusColors.DRAFT
                      }`}
                    >
                      {tender.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="self-center text-sm text-[#94A3B8]">
                    {tender.estimatedValue
                      ? `${tender.currency} ${Number(tender.estimatedValue).toLocaleString()}`
                      : "No value"}
                  </p>
                  <p className="self-center text-sm text-[#94A3B8]">
                    {tender.submissionDeadline?.toLocaleDateString() ?? "No deadline"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
