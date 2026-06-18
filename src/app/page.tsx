import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, DatabaseNotice, EmptyState, PageSection } from "@/components/ui";
import { getDashboardStats, getRecentTenders } from "@/lib/platform";

const workflow = [
  { title: "Analyze", copy: "Extract scope, deadlines, eligibility, risks, and missing documents.", status: "Ready" },
  { title: "Estimate", copy: "Prepare manpower, asset, supplier, SLA, and project cost models.", status: "Schema ready" },
  { title: "Propose", copy: "Generate technical, commercial, and executive submission packages.", status: "Pending exports" },
  { title: "Win", copy: "Track bid decisions, qualification quality, and win probability.", status: "Pending AI" },
];

const engines = [
  { label: "Database", value: "Connected", icon: Database, tone: "text-[#10B981]" },
  { label: "Auth APIs", value: "Live", icon: ShieldCheck, tone: "text-[#10B981]" },
  { label: "Storage", value: "Next", icon: UploadCloud, tone: "text-[#F59E0B]" },
  { label: "AI Agents", value: "Next", icon: Bot, tone: "text-[#F59E0B]" },
];

export default async function DashboardPage() {
  const [stats, recentTenders] = await Promise.all([getDashboardStats(), getRecentTenders()]);
  const kpis = [
    { label: "Active Tenders", value: stats.activeTenders, note: "Live tender records", icon: BriefcaseBusiness },
    { label: "Qualified", value: stats.qualifiedTenders, note: "GO decisions", icon: CheckCircle2 },
    { label: "Submitted", value: stats.submittedTenders, note: "Submission tracking", icon: FileCheck2 },
    { label: "Pipeline Value", value: stats.pipelineValue, note: "Sum of tender values", icon: CircleDollarSign },
    { label: "Win Rate", value: stats.winRate, note: "Won vs total tenders", icon: TrendingUp },
    { label: "Deadlines", value: stats.upcomingDeadlines, note: "Next 14 days", icon: Clock3 },
  ];

  return (
    <AppShell>
      <PageSection className="space-y-5">
        <DatabaseNotice ready={stats.databaseReady} />

        <section className="grid gap-4 2xl:grid-cols-[1.45fr_0.75fr]">
          <Card className="relative overflow-hidden border-[#26344D] bg-[#0E1629] p-0">
            <div className="border-b border-[#1E293B] bg-[#111827] px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-md border border-[#1E293B] bg-[#0B1020] px-2.5 py-1 text-xs text-[#94A3B8]">
                    <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
                    FM tender command center
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                    Analyze. Estimate. Propose. Win.
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#94A3B8]">
                    A real-data workspace for tender upload, qualification, compliance, cost estimation,
                    proposal generation, and executive bid review.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white">
                    Upload Tender
                  </Link>
                  <Link href="/sign-up" className="rounded-md border border-[#1E293B] px-4 py-2 text-sm font-semibold text-white">
                    Organization
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-[#1E293B] md:grid-cols-4">
              {workflow.map((step) => (
                <div key={step.title} className="bg-[#0E1629] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <span className="rounded-md border border-[#1E293B] px-2 py-1 text-[11px] text-[#94A3B8]">
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#94A3B8]">{step.copy}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-[#26344D] bg-[#0E1629]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Platform Readiness</h2>
                <p className="text-sm text-[#94A3B8]">Current build status</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#10B981]" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              {engines.map((engine) => (
                <div key={engine.label} className="flex items-center justify-between rounded-md border border-[#1E293B] bg-[#0B1020] px-3 py-3">
                  <div className="flex items-center gap-3">
                    <engine.icon className={`h-4 w-4 ${engine.tone}`} />
                    <span className="text-sm">{engine.label}</span>
                  </div>
                  <span className={`font-mono text-xs ${engine.tone}`}>{engine.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-[#26344D] bg-[#111827] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-[#94A3B8]">{kpi.label}</p>
                <kpi.icon className="h-4 w-4 text-[#3B82F6]" />
              </div>
              <p className="mt-4 font-mono text-2xl font-semibold">{kpi.value}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{kpi.note}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card className="border-[#26344D] bg-[#111827] p-0">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
              <div>
                <h2 className="text-lg font-semibold">Tender Pipeline</h2>
                <p className="text-sm text-[#94A3B8]">Real tender records only. No static demo rows.</p>
              </div>
              <Link href="/tenders/new" className="rounded-md bg-[#3B82F6] px-3 py-2 text-sm font-semibold">
                Upload
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

          <Card className="border-[#26344D] bg-[#111827]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              <div>
                <h2 className="text-lg font-semibold">Not Fully Built Yet</h2>
                <p className="text-sm text-[#94A3B8]">Next production modules</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                "Supabase Storage for tender files",
                "PDF/DOCX/XLSX text extraction",
                "RAG chunks and vector search",
                "AI compliance and risk agents",
                "PDF, DOCX, XLSX, PPTX, ZIP exports",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-[#1E293B] bg-[#0B1020] p-3">
                  <FileText className="h-4 w-4 text-[#94A3B8]" />
                  <span className="text-sm text-[#F8FAFC]">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </PageSection>
    </AppShell>
  );
}
