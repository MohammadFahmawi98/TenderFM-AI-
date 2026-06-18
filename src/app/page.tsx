import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileArchive,
  FileCheck2,
  FileText,
  Gauge,
  LayoutDashboard,
  LibraryBig,
  LockKeyhole,
  MessagesSquare,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
  WandSparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Tenders", icon: BriefcaseBusiness },
  { label: "AI Analysis", icon: Brain },
  { label: "Tender Chat", icon: MessagesSquare },
  { label: "Qualification", icon: CheckCircle2 },
  { label: "Compliance", icon: ClipboardCheck },
  { label: "Estimation", icon: CircleDollarSign },
  { label: "Manpower", icon: Users },
  { label: "Asset Register", icon: PackageCheck },
  { label: "PPM Planner", icon: CalendarClock },
  { label: "Proposal Generator", icon: WandSparkles },
  { label: "Risk Register", icon: AlertTriangle },
  { label: "SLA & KPI", icon: Gauge },
  { label: "Suppliers", icon: Building2 },
  { label: "Reports", icon: TrendingUp },
  { label: "Export Center", icon: FileArchive },
  { label: "Settings", icon: Settings },
];

const kpis = [
  { label: "Active Tenders", value: "0", note: "No tenders uploaded", icon: BriefcaseBusiness },
  { label: "Qualified Tenders", value: "0", note: "Awaiting analysis", icon: CheckCircle2 },
  { label: "Submitted Tenders", value: "0", note: "No submissions yet", icon: FileCheck2 },
  { label: "Pipeline Value", value: "AED 0", note: "Connect tender data", icon: CircleDollarSign },
];

const uploadTypes = [
  "PDF",
  "DOCX",
  "XLSX",
  "CSV",
  "PPTX",
  "ZIP",
  "Images",
  "BOQ",
  "Drawings",
];

const knowledgeDocs = [
  "Trade License",
  "VAT Certificate",
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "Company Profile",
  "Project References",
  "Staff CVs",
];

const workflow = [
  { title: "Analyze", copy: "Extract scope, deadlines, eligibility, risks, and missing documents." },
  { title: "Estimate", copy: "Build manpower, asset, supplier, SLA, and project cost models." },
  { title: "Propose", copy: "Generate compliant technical and commercial submission packages." },
  { title: "Win", copy: "Track decisions, improve qualification, and learn from every bid." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-[#F8FAFC]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[#1E293B] bg-[#0F172A]/95 lg:block">
          <div className="flex h-20 items-center gap-3 border-b border-[#1E293B] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">TenderFlow</p>
              <p className="text-xs text-[#94A3B8]">FM AI Command</p>
            </div>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                  item.active
                    ? "bg-[#1E293B] text-white"
                    : "text-[#94A3B8] hover:bg-[#111827] hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#1E293B] bg-[#0B1020]/88 px-4 backdrop-blur md:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3B82F6]">
                  Facility Management Tender Intelligence
                </p>
                <h1 className="truncate text-xl font-semibold md:text-2xl">
                  TenderFlow FM AI
                </h1>
              </div>
              <div className="hidden min-w-72 items-center gap-2 rounded-md border border-[#1E293B] bg-[#111827] px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-[#94A3B8]" />
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#94A3B8]"
                  placeholder="Search tenders, clients, documents"
                />
              </div>
              <button className="flex h-10 items-center gap-2 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />
                New Tender
              </button>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8">
            <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-lg border border-[#1E293B] bg-[#111827]/88 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#1E293B] px-2.5 py-1 text-xs text-[#94A3B8]">
                      <Bot className="h-3.5 w-3.5 text-[#10B981]" />
                      AI workspace ready
                    </p>
                    <h2 className="text-2xl font-semibold md:text-3xl">
                      Analyze. Estimate. Propose. Win.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">
                      Start by uploading a tender package or company knowledge file.
                      The dashboard stays empty until real tender data exists.
                    </p>
                  </div>
                  <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#1E293B] px-4 text-sm font-medium text-[#F8FAFC]">
                    <UploadCloud className="h-4 w-4" />
                    Upload Package
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  {workflow.map((step) => (
                    <div key={step.title} className="rounded-md border border-[#1E293B] bg-[#0B1020] p-4">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#1E293B] bg-[#111827]/88 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Onboarding</p>
                    <p className="text-xs text-[#94A3B8]">3 setup actions</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[#10B981]" />
                </div>
                <div className="mt-5 space-y-3">
                  {["Create company profile", "Upload knowledge documents", "Add first tender package"].map(
                    (item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-md border border-[#1E293B] p-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B1020] text-xs font-semibold text-[#3B82F6]">
                          {index + 1}
                        </span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-[#1E293B] bg-[#111827] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#94A3B8]">{kpi.label}</p>
                    <kpi.icon className="h-4 w-4 text-[#3B82F6]" />
                  </div>
                  <p className="mt-4 font-mono text-2xl font-semibold">{kpi.value}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">{kpi.note}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-lg border border-[#1E293B] bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Tender Upload</h2>
                    <p className="text-sm text-[#94A3B8]">Register the first real opportunity.</p>
                  </div>
                  <FileText className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {["Tender Name", "Client Name", "Country", "Location", "Tender Category", "Submission Deadline"].map(
                    (field) => (
                      <label key={field} className="space-y-2">
                        <span className="text-xs text-[#94A3B8]">{field}</span>
                        <input className="h-10 w-full rounded-md border border-[#1E293B] bg-[#0B1020] px-3 text-sm outline-none focus:border-[#3B82F6]" />
                      </label>
                    ),
                  )}
                </div>
                <div className="mt-5 rounded-md border border-dashed border-[#3B82F6]/60 bg-[#0B1020] p-5 text-center">
                  <UploadCloud className="mx-auto h-7 w-7 text-[#3B82F6]" />
                  <p className="mt-3 text-sm font-medium">Drop tender package files</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">{uploadTypes.join(" / ")}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#1E293B] bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Company Knowledge Hub</h2>
                    <p className="text-sm text-[#94A3B8]">Organization memory for AI proposal work.</p>
                  </div>
                  <LibraryBig className="h-5 w-5 text-[#10B981]" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {knowledgeDocs.map((doc) => (
                    <button
                      key={doc}
                      className="flex h-11 items-center justify-between rounded-md border border-[#1E293B] bg-[#0B1020] px-3 text-left text-sm"
                    >
                      <span>{doc}</span>
                      <ArrowUpRight className="h-4 w-4 text-[#94A3B8]" />
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-[#1E293B] bg-[#0B1020] p-4">
                  <p className="text-sm font-medium">Vector index</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">No company documents processed yet.</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-[#1E293B] bg-[#111827]">
                <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
                  <div>
                    <h2 className="text-lg font-semibold">Tender Pipeline</h2>
                    <p className="text-sm text-[#94A3B8]">No static demo tenders are shown.</p>
                  </div>
                  <button className="flex h-9 items-center gap-2 rounded-md border border-[#1E293B] px-3 text-sm">
                    Status
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                  <LockKeyhole className="h-8 w-8 text-[#94A3B8]" />
                  <p className="mt-4 text-sm font-semibold">No tender records yet</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#94A3B8]">
                    Upload a real tender package to unlock qualification, compliance, cost estimation,
                    proposal generation, and submission tracking.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#1E293B] bg-[#111827] p-5">
                <h2 className="text-lg font-semibold">AI Insights</h2>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Compliance Alerts", value: "0", color: "text-[#10B981]" },
                    { label: "Missing Documents", value: "0", color: "text-[#F59E0B]" },
                    { label: "High Risks", value: "0", color: "text-[#EF4444]" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-md border border-[#1E293B] bg-[#0B1020] p-4">
                      <span className="text-sm text-[#94A3B8]">{item.label}</span>
                      <span className={`font-mono text-lg font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
