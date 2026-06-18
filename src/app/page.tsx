import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, DatabaseNotice, EmptyState, PageSection } from "@/components/ui";
import { getDashboardStats, getRecentTenders } from "@/lib/platform";

const workflow = [
  { title: "Analyze", copy: "Extract scope, deadlines, eligibility, risks, and missing documents." },
  { title: "Estimate", copy: "Build manpower, asset, supplier, SLA, and project cost models." },
  { title: "Propose", copy: "Generate compliant technical and commercial submission packages." },
  { title: "Win", copy: "Track decisions, improve qualification, and learn from every bid." },
];

export default async function DashboardPage() {
  const [stats, recentTenders] = await Promise.all([getDashboardStats(), getRecentTenders()]);
  const kpis = [
    { label: "Active Tenders", value: stats.activeTenders, note: "Live tender records", icon: BriefcaseBusiness },
    { label: "Qualified Tenders", value: stats.qualifiedTenders, note: "GO decisions", icon: CheckCircle2 },
    { label: "Submitted Tenders", value: stats.submittedTenders, note: "Submission tracking", icon: FileCheck2 },
    { label: "Pipeline Value", value: stats.pipelineValue, note: "Sum of tender values", icon: CircleDollarSign },
    { label: "Win Rate", value: stats.winRate, note: "Won vs total tenders", icon: TrendingUp },
    { label: "Upcoming Deadlines", value: stats.upcomingDeadlines, note: "Next 14 days", icon: ShieldCheck },
  ];

  return (
    <AppShell>
      <PageSection>
        <DatabaseNotice ready={stats.databaseReady} />

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="bg-[#111827]/88">
            <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#1E293B] px-2.5 py-1 text-xs text-[#94A3B8]">
              <Bot className="h-3.5 w-3.5 text-[#10B981]" />
              AI workflow foundation
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">Analyze. Estimate. Propose. Win.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">
              The dashboard displays real PostgreSQL records only. Add a tender package to unlock analysis,
              compliance, estimation, proposal generation, and export workflows.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {workflow.map((step) => (
                <div key={step.title} className="rounded-md border border-[#1E293B] bg-[#0B1020] p-4">
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{step.copy}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#111827]/88">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Build Progress</p>
                <p className="text-xs text-[#94A3B8]">Production foundations</p>
              </div>
              <Sparkles className="h-5 w-5 text-[#10B981]" />
            </div>
            <div className="mt-5 space-y-3">
              {["Prisma multi-tenant schema", "Tender upload API", "Route-based app shell"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-[#1E293B] p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B1020] text-xs font-semibold text-[#3B82F6]">
                    {index + 1}
                  </span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#94A3B8]">{kpi.label}</p>
                <kpi.icon className="h-4 w-4 text-[#3B82F6]" />
              </div>
              <p className="mt-4 font-mono text-2xl font-semibold">{kpi.value}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{kpi.note}</p>
            </Card>
          ))}
        </section>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
            <div>
              <h2 className="text-lg font-semibold">Tender Pipeline</h2>
              <p className="text-sm text-[#94A3B8]">No static demo tenders are shown.</p>
            </div>
            <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-3 py-2 text-sm font-semibold">
              Upload Tender
            </Link>
          </div>
          {recentTenders.length === 0 ? (
            <EmptyState
              title="No tender records yet"
              body="Upload a real tender package to create the first tender record and begin document intelligence."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-[#94A3B8]">
                  <tr>
                    <th className="px-5 py-3">Tender</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Deadline</th>
                    <th className="px-5 py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenders.map((tender) => (
                    <tr key={tender.id} className="border-t border-[#1E293B]">
                      <td className="px-5 py-4 font-medium">{tender.name}</td>
                      <td className="px-5 py-4 text-[#94A3B8]">{tender.clientName}</td>
                      <td className="px-5 py-4">{tender.status}</td>
                      <td className="px-5 py-4 text-[#94A3B8]">
                        {tender.submissionDeadline?.toLocaleDateString() ?? "Not set"}
                      </td>
                      <td className="px-5 py-4 font-mono">
                        {tender.estimatedValue ? `${tender.currency} ${tender.estimatedValue}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageSection>
    </AppShell>
  );
}
