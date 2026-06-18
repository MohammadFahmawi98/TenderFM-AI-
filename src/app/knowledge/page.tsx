import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";

const libraries = [
  "Technical Proposals",
  "Method Statements",
  "SOPs",
  "PPM Libraries",
  "SLA Libraries",
  "KPI Libraries",
  "HSE Plans",
  "Risk Registers",
  "Mobilization Plans",
  "Company Profiles",
  "Certifications",
  "Past Projects",
  "References",
  "Case Studies",
];

export default function KnowledgePage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Knowledge Hub</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">FM intelligence memory</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            TenderFlow uses this library to ground proposals, method statements, compliance, PPM, SLA, KPI, HSE, and executive outputs.
          </p>
        </div>
        <Card className="bg-[#0B1220]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {libraries.map((item) => (
              <div key={item} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs leading-5 text-[#94A3B8]">No real records yet</p>
              </div>
            ))}
          </div>
        </Card>
      </PageSection>
    </AppShell>
  );
}
