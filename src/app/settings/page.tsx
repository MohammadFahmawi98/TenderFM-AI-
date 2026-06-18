import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";

const settings = [
  "AI Provider Keys",
  "Supabase Storage",
  "Document Processing",
  "Export Templates",
  "Security & RLS",
  "Billing",
];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Settings</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Platform configuration</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Configure providers, security, storage, document processing, exports, and organization-level platform behavior.
          </p>
        </div>
        <section className="grid gap-4 lg:grid-cols-3">
          {settings.map((item) => (
            <Card key={item} className="bg-[#0B1220]">
              <h3 className="text-lg font-semibold">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Configuration workspace ready for production settings.</p>
            </Card>
          ))}
        </section>
      </PageSection>
    </AppShell>
  );
}
