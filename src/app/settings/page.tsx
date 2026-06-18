import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";
import { StatusChip, ToolbarButton, ViewsBar, WorkspaceHeader } from "@/components/workspace-chrome";
import { tenderAgents } from "@/lib/agents";
import { getOrganizationMemory } from "@/lib/platform";

const settingsSections = [
  "General",
  "Workspace",
  "People",
  "Permissions",
  "Statuses",
  "Fields",
  "Automations",
  "AI Agents",
  "Integrations",
  "Security",
  "Billing",
  "Audit",
];

const hierarchy = [
  ["Organization", "Company identity, billing, SSO, security, global permissions"],
  ["Tender Spaces", "Active bids, archived bids, client groups, regions"],
  ["Tender Workspace", "RFP sources, tasks, generated documents, team comments"],
  ["Views", "Overview, board, requirements, documents, approvals, export"],
  ["Tasks", "Owners, due dates, status, priority, agent, related document"],
  ["Custom Fields", "Tender value, client, category, country, risk, readiness, approval gate"],
];

const statusWorkflow = [
  ["Intake", "RFP uploaded and extraction running", "blue"],
  ["Qualification", "Go/no-go, win probability, complexity", "amber"],
  ["Generation", "Agents draft documents and matrices", "blue"],
  ["Review", "Team comments, changes requested, approvals", "amber"],
  ["Final Lock", "Approved documents become final", "green"],
  ["Exported", "ZIP package created with audit trail", "green"],
] as const;

const customFields = [
  ["Tender Value", "Money", "Workspace default", "Pipeline and expected revenue"],
  ["Submission Deadline", "Date", "Required", "Deadline and escalation"],
  ["Client Sector", "Dropdown", "Can set", "Executive filtering"],
  ["Go/No-Go Score", "Number", "AI managed", "Qualification gate"],
  ["Readiness Score", "Formula", "AI managed", "Export gate"],
  ["Commercial Risk", "Label", "Private", "Sensitive risk reporting"],
  ["Approval Owner", "People", "Can edit", "Review accountability"],
  ["Submission Link", "URL", "Can view", "Final package reference"],
];

const automationRules = [
  ["RFP uploaded", "Create workspace tasks for qualification, compliance, and document generation"],
  ["Readiness below 70%", "Flag bid manager and keep export gate closed"],
  ["Document changes requested", "Move related task to In Review and notify owner"],
  ["Required document approved", "Update readiness and check package gate"],
  ["All required docs final", "Enable final ZIP export"],
  ["Submission package exported", "Lock package record and write audit event"],
];

const permissions = [
  ["Owner", "All settings, billing, security, users, data export"],
  ["Admin", "Workspace settings, roles, integrations, knowledge, audit"],
  ["Bid Manager", "Tender workspaces, tasks, document generation, export package"],
  ["Commercial Manager", "Pricing fields, commercial proposal, BOQ, commercial approval"],
  ["Operations Manager", "Technical, manpower, PPM, SLA/KPI, operational approval"],
  ["Reviewer", "Comments, changes requested, assigned approvals"],
  ["Viewer", "Read-only workspace and final documents"],
];

const integrations = [
  ["Microsoft 365", "Email, Word, Excel, Teams, calendar"],
  ["Google Workspace", "Drive, Docs, Sheets, Gmail, calendar"],
  ["Slack", "Review notifications and approvals"],
  ["Supabase", "Database, storage, auth-ready services"],
  ["OpenAI / Claude / Gemini", "Model routing for agent generation"],
  ["Sentry / PostHog", "Errors, product analytics, usage telemetry"],
];

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("tenderflow_organization_id")?.value;
  const memory = await getOrganizationMemory(organizationId);
  const memoryFiles = memory?.files.length ?? 0;
  const memoryChunks = memory?.files.reduce((total, file) => total + file.knowledgeChunks.length, 0) ?? 0;

  return (
    <AppShell>
      <PageSection>
        <WorkspaceHeader
          eyebrow="Settings"
          title="TenderFlow admin center"
          subtitle="Configure workspace hierarchy, roles, custom fields, automations, AI agents, integrations, security, and export governance."
          actions={
            <>
              <ToolbarButton href="/organization">Organization</ToolbarButton>
              <ToolbarButton href="/knowledge">Knowledge</ToolbarButton>
              <ToolbarButton href="/workspace">Workspace</ToolbarButton>
            </>
          }
          meta={[
            { label: "Settings Areas", value: settingsSections.length, tone: "blue" },
            { label: "Agents", value: tenderAgents.length, tone: "green" },
            { label: "Memory Files", value: memoryFiles, tone: "amber" },
            { label: "Memory Chunks", value: memoryChunks },
          ]}
        />

        <ViewsBar
          views={[
            { label: "General", href: "#general", active: true },
            { label: "People", href: "#people" },
            { label: "Workflow", href: "#workflow" },
            { label: "Fields", href: "#fields" },
            { label: "Automations", href: "#automations" },
            { label: "Security", href: "#security" },
          ]}
          right={<StatusChip tone="blue">Workspace settings</StatusChip>}
        />

        <section className="grid gap-4 xl:grid-cols-[260px_1fr]">
          <aside className="rounded-lg border border-[#162033] bg-[#0B1220] p-3">
            <p className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#64748B]">All Settings</p>
            <div className="space-y-1">
              {settingsSections.map((section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase().replaceAll(" ", "-")}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[#94A3B8] hover:bg-[#111827] hover:text-white"
                >
                  <span>{section}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E293B]" />
                </a>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <Card id="general" className="bg-[#0B1220]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">General</p>
                  <h3 className="mt-2 text-2xl font-semibold">Workspace identity and hierarchy</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#94A3B8]">
                    TenderFlow should behave like a bid workspace OS: global organization settings at the top, then tender spaces, workspaces,
                    views, tasks, fields, and export gates.
                  </p>
                </div>
                <StatusChip tone="green">Operational map</StatusChip>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {hierarchy.map(([title, body], index) => (
                  <div key={title} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1E293B] text-xs font-semibold text-[#00E5FF]">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold">{title}</p>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#94A3B8]">{body}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="people" className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">People and Permissions</p>
              <h3 className="mt-2 text-xl font-semibold">Role model for tender teams</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {permissions.map(([role, access]) => (
                  <div key={role} className="rounded-md border border-[#162033] bg-[#050816] p-4">
                    <p className="text-sm font-semibold">{role}</p>
                    <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{access}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="workflow" className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Workflow</p>
              <h3 className="mt-2 text-xl font-semibold">Tender lifecycle statuses</h3>
              <div className="mt-5 grid gap-3 xl:grid-cols-6">
                {statusWorkflow.map(([status, body, tone]) => (
                  <div key={status} className="rounded-lg border border-[#162033] bg-[#050816] p-4">
                    <StatusChip tone={tone}>{status}</StatusChip>
                    <p className="mt-3 text-xs leading-5 text-[#94A3B8]">{body}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="fields" className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Custom Fields</p>
              <h3 className="mt-2 text-xl font-semibold">Structured bid data</h3>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-[#64748B]">
                    <tr>
                      <th className="border-b border-[#162033] px-3 py-3">Field</th>
                      <th className="border-b border-[#162033] px-3 py-3">Type</th>
                      <th className="border-b border-[#162033] px-3 py-3">Permission</th>
                      <th className="border-b border-[#162033] px-3 py-3">TenderFlow Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.map(([field, type, permission, use]) => (
                      <tr key={field}>
                        <td className="border-b border-[#162033] px-3 py-3 font-medium">{field}</td>
                        <td className="border-b border-[#162033] px-3 py-3 text-[#94A3B8]">{type}</td>
                        <td className="border-b border-[#162033] px-3 py-3 text-[#94A3B8]">{permission}</td>
                        <td className="border-b border-[#162033] px-3 py-3 text-[#94A3B8]">{use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card id="automations" className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Automations</p>
              <h3 className="mt-2 text-xl font-semibold">Rules that keep submissions moving</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {automationRules.map(([trigger, action]) => (
                  <div key={trigger} className="rounded-md border border-[#162033] bg-[#050816] p-4">
                    <p className="text-sm font-semibold">When: {trigger}</p>
                    <p className="mt-2 text-xs leading-5 text-[#94A3B8]">Then: {action}</p>
                  </div>
                ))}
              </div>
            </Card>

            <section className="grid gap-4 xl:grid-cols-2">
              <Card id="ai-agents" className="bg-[#0B1220]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">AI Agents</p>
                <h3 className="mt-2 text-xl font-semibold">Agent permissions and outputs</h3>
                <div className="mt-5 space-y-2">
                  {tenderAgents.map((agent) => (
                    <div key={agent.name} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                      <p className="text-sm font-semibold">{agent.name}</p>
                      <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{agent.deliverables.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card id="integrations" className="bg-[#0B1220]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Integrations</p>
                <h3 className="mt-2 text-xl font-semibold">Connected systems roadmap</h3>
                <div className="mt-5 space-y-2">
                  {integrations.map(([name, body]) => (
                    <div key={name} className="rounded-md border border-[#162033] bg-[#050816] p-3">
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{body}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <Card id="security" className="bg-[#0B1220]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#00E5FF]">Security</p>
              <h3 className="mt-2 text-xl font-semibold">Enterprise controls to add next</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {["SSO/SAML", "Custom role permissions", "Private fields", "Audit exports", "Data retention", "IP/session controls"].map((item) => (
                  <div key={item} className="rounded-md border border-[#162033] bg-[#050816] p-4 text-sm font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </PageSection>
    </AppShell>
  );
}
