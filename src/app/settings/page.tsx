import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";
import { requiredSettings, tenderAgents } from "@/lib/agents";

const roleMatrix = [
  ["Admin", "Organization, integrations, knowledge, users, final approvals"],
  ["Bid Manager", "RFP upload, workspace ownership, agent outputs, export packages"],
  ["Commercial Manager", "BOQ, pricing model, commercial proposal, commercial approval"],
  ["Operations Manager", "Technical proposal, manpower, PPM, mobilization, operational approval"],
  ["Reviewer", "Review documents, add comments, request changes, approve assigned documents"],
  ["Viewer", "View tender workspace and approved documents only"],
];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Settings</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Enterprise TenderFlow configuration</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Configure the AI bid department: agents, document generation, integrations, team permissions, security, and final export readiness.
          </p>
        </div>

        <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4 md:grid-cols-2">
            {requiredSettings.map((item) => (
              <Card key={item.title} className="bg-[#0B1220]">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{item.body}</p>
                <div className="mt-5 rounded-md border border-white/[0.06] bg-[#050816] px-3 py-2 text-xs font-medium text-[#10B981]">
                  Required for enterprise launch
                </div>
              </Card>
            ))}
          </div>

          <aside className="space-y-4">
            <Card className="bg-[#0B1220]">
              <h3 className="text-lg font-semibold">Required Agents</h3>
              <div className="mt-4 space-y-2">
                {tenderAgents.map((agent) => (
                  <div key={agent.name} className="rounded-md border border-white/[0.06] bg-[#050816] p-3">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="mt-1 text-xs text-[#94A3B8]">{agent.deliverables.join(", ")}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#0B1220]">
              <h3 className="text-lg font-semibold">Team Roles</h3>
              <div className="mt-4 space-y-2">
                {roleMatrix.map(([role, permission]) => (
                  <div key={role} className="rounded-md border border-white/[0.06] bg-[#050816] p-3">
                    <p className="text-sm font-medium">{role}</p>
                    <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{permission}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </PageSection>
    </AppShell>
  );
}
