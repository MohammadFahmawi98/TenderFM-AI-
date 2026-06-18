import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";

export default function OrganizationPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Organization</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Company bid capability profile</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Manage company identity, certifications, roles, team access, and FM capability data used by the AI bid department.
          </p>
        </div>
        <section className="grid gap-4 lg:grid-cols-2">
          {["Company Profile", "Certifications", "Team & Roles", "Audit Trail"].map((item) => (
            <Card key={item} className="bg-[#0B1220]">
              <h3 className="text-lg font-semibold">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Connected to real organization records after account creation.</p>
            </Card>
          ))}
        </section>
      </PageSection>
    </AppShell>
  );
}
