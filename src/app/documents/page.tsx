import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageSection } from "@/components/ui";

export default function DocumentsPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">Document Library</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Generated outputs only</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Preview, download, regenerate, compare versions, and export DOCX, XLSX, PPTX, PDF, and ZIP deliverables.
          </p>
        </div>
        <Card className="bg-[#0B1220]">
          <EmptyState
            title="No generated documents yet"
            body="Generated outputs appear here after agents process a real uploaded RFP."
          />
        </Card>
      </PageSection>
    </AppShell>
  );
}
